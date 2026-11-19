import firebaseConfig from '../../firebase-applet-config.json';
import { GasService } from './gasService';
import { StorageService } from './storageService';
import { auth, getAccessToken } from './googleAuthService';
import {
  compressImageToResult,
  CompressedImageResult,
  blobToDataUrl,
} from '../utils/imageCompressor';

const SESSION_FB_BLOCKED_KEY = 'ejurnal_fb_storage_blocked_until';
const SESSION_GAS_BLOCKED_KEY = 'ejurnal_gas_photo_blocked_until';
const BLOCK_TTL_MS = 15 * 60 * 1000; // 15 menit cache sesi

function isSessionFlagActive(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    return Date.now() < Number(raw);
  } catch {
    return false;
  }
}

function setSessionFlag(key: string, ttlMs = BLOCK_TTL_MS): void {
  try {
    sessionStorage.setItem(key, String(Date.now() + ttlMs));
  } catch {}
}

// IndexedDB configuration for high-capacity offline/local photo storage
const IDB_NAME = 'ejurnal_photo_cache_v1';
const IDB_STORE = 'eviden_photos';

function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung pada browser ini'));
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoToIndexedDB(id: string, blob: Blob): Promise<string> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ id, blob, createdAt: Date.now() });
      tx.oncomplete = () => {
        resolve(`idb://${id}`);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[PhotoStorage] Gagal menyimpan ke IndexedDB, menggunakan ObjectURL memori:', err);
    return URL.createObjectURL(blob);
  }
}

export async function getPhotoFromIndexedDB(idOrUrl: string): Promise<string | null> {
  try {
    const cleanId = idOrUrl.startsWith('idb://') ? idOrUrl.slice(6) : idOrUrl;
    const db = await openPhotoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(cleanId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(URL.createObjectURL(req.result.blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function findPhotoForJurnalInIndexedDB(jurnalId: string): Promise<string | null> {
  if (!jurnalId) return null;
  try {
    const db = await openPhotoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result || []) as Array<{ id: string; blob?: Blob; createdAt?: number }>;
        const matches = items
          .filter((item) => item.id && item.id.includes(`foto_${jurnalId}_`) && item.blob)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (matches.length > 0 && matches[0].blob) {
          resolve(URL.createObjectURL(matches[0].blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

function base64ToBlob(base64: string, mimeType = 'image/jpeg'): Blob {
  let clean = base64;
  if (clean.includes(',')) {
    const parts = clean.split(',');
    clean = parts[1];
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
  }
  const binary = atob(clean);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeType });
}

export interface UploadPhotoResult {
  url: string;
  provider: 'firebase' | 'gdrive_gas' | 'gdrive_oauth' | 'indexeddb';
  fileName: string;
}

export type PrecompressedSource = {
  blob: Blob;
  objectUrl?: string;
  dataUrl?: string;
  precompressed: true;
};

function isPrecompressedSource(source: unknown): source is PrecompressedSource {
  return (
    typeof source === 'object' &&
    source !== null &&
    'precompressed' in source &&
    (source as PrecompressedSource).precompressed === true
  );
}

/**
 * Upload biner langsung ke Firebase Storage REST API dalam 1 HTTP request (tanpa resumable handshake/retry loop SDK)
 */
async function uploadToFirebaseStorageFast(
  blob: Blob,
  fileName: string,
  timeoutMs = 2500
): Promise<string | null> {
  const bucket = (firebaseConfig as any).storageBucket as string | undefined;
  if (!bucket || isSessionFlagActive(SESSION_FB_BLOCKED_KEY)) {
    return null;
  }

  const objectPath = `dokumentasi_jurnal/${fileName}`;
  const endpoint = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    bucket
  )}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'image/jpeg',
  };

  try {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Firebase ${idToken}`;
      }
    }
  } catch {}

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: blob,
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        setSessionFlag(SESSION_FB_BLOCKED_KEY);
      }
      return null;
    }

    const data = await res.json();
    const token = data.downloadTokens
      ? String(data.downloadTokens).split(',')[0].trim()
      : '';
    const finalBucket = data.bucket || bucket;
    const finalName = data.name || objectPath;
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
      finalBucket
    )}/o/${encodeURIComponent(finalName)}?alt=media${
      token ? `&token=${encodeURIComponent(token)}` : ''
    }`;
  } catch {
    setSessionFlag(SESSION_FB_BLOCKED_KEY, 5 * 60 * 1000);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload biner langsung ke Google Drive API v3 jika pengguna memiliki OAuth Access Token aktif
 */
async function uploadToGoogleDriveOAuthFast(
  blob: Blob,
  fileName: string,
  guruNama: string,
  timeoutMs = 4500
): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const boundary = '-------314159265358979323846';
  const metadataPart = JSON.stringify({
    name: fileName,
    mimeType: 'image/jpeg',
    description: `Eviden E-Jurnal Guru SMKN 1 Sidayu - ${guruNama}`,
  });

  // Kirim binary Blob langsung via Blob concat (tanpa konversi Base64!)
  const multipartBlob = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n`,
      `--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`,
      blob,
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const driveUploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: multipartBlob,
        signal: controller.signal,
      }
    );

    if (!driveUploadRes.ok) return null;
    const driveData = await driveUploadRes.json();
    const fileId = driveData.id;
    if (!fileId) return null;

    // Set public read permission secara async agar tampilan kepsek bisa langsung membuka gambar
    fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }).catch(() => {});

    return `https://lh3.googleusercontent.com/d/${fileId}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export class PhotoStorageService {
  /**
   * Mengunggah foto dokumentasi secara cepat ke Firebase Storage atau Google Drive,
   * dan hanya mengembalikan string URL foto untuk disimpan di Firestore & Local Storage.
   */
  static async uploadJournalPhoto(
    source: File | Blob | string | PrecompressedSource,
    metadata: {
      jurnalId?: string;
      guruNama?: string;
      guruNip?: string;
      mapel?: string;
      kelas?: string;
    }
  ): Promise<UploadPhotoResult> {
    let blob: Blob;
    let cachedDataUrl: string | undefined;

    if (isPrecompressedSource(source)) {
      blob = source.blob;
      cachedDataUrl = source.dataUrl;
    } else if (typeof source === 'string') {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        return {
          url: source,
          provider: source.includes('firebasestorage') ? 'firebase' : 'gdrive_gas',
          fileName: 'existing_url.jpg',
        };
      } else if (source.startsWith('data:image')) {
        const existingBlob = base64ToBlob(source);
        if (existingBlob.size <= 100 * 1024) {
          blob = existingBlob;
          cachedDataUrl = source;
        } else {
          const res: CompressedImageResult = await compressImageToResult(existingBlob, {
            maxWidth: 1280,
            maxHeight: 720,
            quality: 0.8,
            maxSizeBytes: 100 * 1024,
          });
          blob = res.blob;
          URL.revokeObjectURL(res.objectUrl);
        }
      } else {
        return {
          url: source,
          provider: 'indexeddb',
          fileName: 'local_photo.jpg',
        };
      }
    } else {
      const res: CompressedImageResult = await compressImageToResult(source, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8,
        maxSizeBytes: 100 * 1024,
      });
      blob = res.blob;
      URL.revokeObjectURL(res.objectUrl);
    }

    const safeGuru = (metadata.guruNama || 'GURU')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    const timeKey = Date.now().toString(36).toUpperCase();
    const fileName = `EVIDEN_${metadata.jurnalId || 'JRN'}_${safeGuru}_${timeKey}.jpg`;

    // 1. Firebase Storage Direct REST (1 HTTP call, timeout 2.5s, tanpa retry loop lambat)
    const fbUrl = await uploadToFirebaseStorageFast(blob, fileName, 2500);
    if (fbUrl) {
      return { url: fbUrl, provider: 'firebase', fileName };
    }

    // 2. Google Drive OAuth Direct Binary Upload (jika token OAuth tersedia, tanpa Base64!)
    const driveOAuthUrl = await uploadToGoogleDriveOAuthFast(
      blob,
      fileName,
      metadata.guruNama || '',
      4500
    );
    if (driveOAuthUrl) {
      return { url: driveOAuthUrl, provider: 'gdrive_oauth', fileName };
    }

    // 3. Google Drive via Google Apps Script Web App (konversi Base64 lazy hanya jika GAS aktif)
    if (!isSessionFlagActive(SESSION_GAS_BLOCKED_KEY)) {
      try {
        const config = StorageService.getConfig();
        const webAppUrl = config.gas_web_app_url;
        if (webAppUrl && webAppUrl.startsWith('http')) {
          const base64ForGas = cachedDataUrl || (await blobToDataUrl(blob));
          const gasRes = await GasService.uploadPhoto(
            webAppUrl,
            {
              base64: base64ForGas,
              filename: fileName,
              jurnalId: metadata.jurnalId,
              guruNama: metadata.guruNama,
            },
            4500
          );

          if (gasRes && gasRes.status === 'success' && (gasRes.url || gasRes.driveUrl)) {
            return {
              url: gasRes.url || gasRes.driveUrl || '',
              provider: 'gdrive_gas',
              fileName,
            };
          } else if (
            gasRes?.message &&
            gasRes.message.toLowerCase().includes('tidak dikenali')
          ) {
            setSessionFlag(SESSION_GAS_BLOCKED_KEY);
          }
        }
      } catch (gasErr: any) {
        console.warn('[PhotoStorage] Upload GAS dilewati:', gasErr?.message || gasErr);
      }
    }

    // 4. Fallback cepat IndexedDB (lokal kapasitas besar tanpa memblokir simpan jurnal)
    const photoId = `foto_${metadata.jurnalId || 'jrn'}_${Date.now()}`;
    const localUrl = await savePhotoToIndexedDB(photoId, blob);
    return {
      url: localUrl,
      provider: 'indexeddb',
      fileName,
    };
  }
}
