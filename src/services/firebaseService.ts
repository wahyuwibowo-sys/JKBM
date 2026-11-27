import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  writeBatch,
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  deleteDoc,
  Firestore,
  Query,
  DocumentData,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppConfig, DeepLearningData, JurnalPembelajaran, KurikulumCPTP, User, UserRole } from '../types';
import { auth } from './googleAuthService';

// Initialize Firebase App (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const databaseId: string | undefined = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

// Initialize Firestore with multi-tab IndexedDB persistent cache + ignoreUndefinedProperties
// so 100 concurrent teachers/day benefit from offline resilience & minimal quota reads.
function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
        ignoreUndefinedProperties: true,
      },
      databaseId
    );
  } catch {
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const PENDING_QUEUE_KEY = 'ejurnal_pending_sync_v1';
const DELETED_SEEDS_KEY = 'ejurnal_deleted_seeds_v1';
export const SEED_JURNAL_IDS = new Set([
  'JRN-20261016-001',
  'JRN-20261017-002',
  'JRN-20261015-003',
]);

export function getDeletedSeedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SEEDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addDeletedSeedIds(ids: string[]): string[] {
  const existing = new Set(getDeletedSeedIds());
  ids.forEach((id) => {
    if (SEED_JURNAL_IDS.has(id)) {
      existing.add(id);
    }
  });
  const next = Array.from(existing).slice(0, 20);
  try {
    localStorage.setItem(DELETED_SEEDS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

const DELETED_CPTP_SEEDS_KEY = 'ejurnal_deleted_seed_cptp_v1';
const PENDING_CPTP_QUEUE_KEY = 'ejurnal_pending_cptp_sync_v1';
const KNOWN_CLOUD_CPTP_KEY = 'ejurnal_known_cloud_cptp_v1';
export const SEED_CPTP_IDS = new Set([
  'CPTP-01',
  'CPTP-02',
  'CPTP-03',
  'CPTP-04',
  'CPTP-05',
  'CPTP-06',
  'CPTP-07',
  'CPTP-08',
]);

export function getDeletedSeedCptpIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CPTP_SEEDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addDeletedSeedCptpIds(ids: string[]): string[] {
  const existing = new Set(getDeletedSeedCptpIds());
  ids.forEach((id) => {
    if (SEED_CPTP_IDS.has(id)) {
      existing.add(id);
    }
  });
  const next = Array.from(existing).slice(0, 50);
  try {
    localStorage.setItem(DELETED_CPTP_SEEDS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

function cleanNipValue(nip?: string | null): string {
  if (!nip) return '-';
  const raw = String(nip).trim();
  if (raw === '' || raw === '-' || raw === 'null' || raw === 'undefined') return '-';
  return raw.replace(/\D/g, '') || '-';
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val : val == null ? fallback : String(val);
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function clampInt(val: unknown, min = 0, max = 500): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

const VALID_DL_LEVELS = new Set(['Sangat Terlihat', 'Terlihat', 'Cukup', 'Belum Terlihat']);
const VALID_KETERCAPAIAN = new Set(['Sangat Baik', 'Baik', 'Cukup', 'Perlu Tindak Lanjut']);
const VALID_STATUS = new Set(['Draft', 'Menunggu Validasi', 'Disetujui', 'Revisi']);

function sanitizeDeepLearning(dl?: DeepLearningData): DeepLearningData {
  return {
    mindful: VALID_DL_LEVELS.has(dl?.mindful || '') ? dl!.mindful : 'Terlihat',
    meaningful: VALID_DL_LEVELS.has(dl?.meaningful || '') ? dl!.meaningful : 'Terlihat',
    joyful: VALID_DL_LEVELS.has(dl?.joyful || '') ? dl!.joyful : 'Terlihat',
  };
}

/**
 * Sanitizes JurnalPembelajaran payload to guarantee:
 * 1) No `undefined` values
 * 2) Exact adherence to `firebase-blueprint.json` & `firestore.rules` types, keys, enums, and size bounds
 * 3) No raw base64/blob image strings stored inside Firestore documents
 */
export function sanitizeJurnalForFirestore(
  jurnal: JurnalPembelajaran
): JurnalPembelajaran & { _syncedAt: string } {
  const cleanId = clampString(jurnal.id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-');
  const todayStr = new Date().toISOString().slice(0, 10);
  const validTanggal = /^\d{4}-\d{2}-\d{2}$/.test(jurnal.tanggal || '') ? jurnal.tanggal : todayStr;

  const cleanDokumentasi = Array.isArray(jurnal.dokumentasi)
    ? jurnal.dokumentasi
        .filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
        .filter((d) => !d.startsWith('data:image') && !d.startsWith('blob:'))
        .slice(0, 5)
        .map((d) => clampString(d, 2000))
    : [];

  const cleanAktivitas = Array.isArray(jurnal.aktivitas)
    ? jurnal.aktivitas
        .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
        .slice(0, 15)
        .map((a) => clampString(a.trim(), 100))
    : [];

  const sanitized: JurnalPembelajaran & { _syncedAt: string } = {
    id: cleanId || `JRN-${todayStr.replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`,
    timestamp: clampString(jurnal.timestamp || new Date().toISOString(), 64),
    tanggal: validTanggal,
    guru_nip: clampString(cleanNipValue(jurnal.guru_nip), 32),
    guru_nama: clampString(jurnal.guru_nama || 'Guru SMKN 1 Sidayu', 200),
    mapel: clampString(jurnal.mapel || '-', 200),
    kelas: clampString(jurnal.kelas || '-', 100),
    materi: clampString(jurnal.materi || '-', 2000),
    cp: clampString(jurnal.cp || '', 4000),
    tp: clampString(jurnal.tp || '', 4000),
    atp: clampString(jurnal.atp || '', 4000),
    kehadiran: {
      hadir: clampInt(jurnal.kehadiran?.hadir, 0, 500),
      sakit: clampInt(jurnal.kehadiran?.sakit, 0, 500),
      izin: clampInt(jurnal.kehadiran?.izin, 0, 500),
      alpa: clampInt(jurnal.kehadiran?.alpa, 0, 500),
      total: clampInt(jurnal.kehadiran?.total, 0, 500),
      keterangan: clampString(jurnal.kehadiran?.keterangan || '', 500),
    },
    aktivitas: cleanAktivitas,
    deep_learning: sanitizeDeepLearning(jurnal.deep_learning),
    refleksi: {
      ketercapaian: VALID_KETERCAPAIAN.has(jurnal.refleksi?.ketercapaian || '')
        ? jurnal.refleksi.ketercapaian
        : 'Baik',
      kendala: clampString(jurnal.refleksi?.kendala || 'Tidak Ada', 500),
      tindak_lanjut: clampString(jurnal.refleksi?.tindak_lanjut || 'Penguatan', 500),
      catatan_guru: clampString(jurnal.refleksi?.catatan_guru || '', 2000),
      narasi_refleksi: clampString(jurnal.refleksi?.narasi_refleksi || '', 4000),
    },
    dokumentasi: cleanDokumentasi,
    status: VALID_STATUS.has(jurnal.status) ? jurnal.status : 'Menunggu Validasi',
    qr_token: clampString(
      jurnal.qr_token || `SMKN1SIDAYU-VAL-${cleanId}-${Date.now().toString(36).toUpperCase()}`,
      256
    ),
    _syncedAt: new Date().toISOString(),
  };

  if (typeof jurnal.jadwal_id === 'string') {
    sanitized.jadwal_id = clampString(jurnal.jadwal_id, 100);
  }
  if (typeof jurnal.catatan_supervisi === 'string' && jurnal.catatan_supervisi.length > 0) {
    sanitized.catatan_supervisi = clampString(jurnal.catatan_supervisi, 2000);
  }
  if (jurnal.supervisi_deep_learning) {
    sanitized.supervisi_deep_learning = sanitizeDeepLearning(jurnal.supervisi_deep_learning);
  }
  if (typeof jurnal.tanggal_validasi === 'string' && jurnal.tanggal_validasi.length > 0) {
    sanitized.tanggal_validasi = clampString(jurnal.tanggal_validasi, 64);
  }
  if (typeof jurnal.validator_nama === 'string' && jurnal.validator_nama.length > 0) {
    sanitized.validator_nama = clampString(jurnal.validator_nama, 200);
  }
  if (typeof jurnal.last_saved_by === 'string' && jurnal.last_saved_by.length > 0) {
    sanitized.last_saved_by = clampString(cleanNipValue(jurnal.last_saved_by), 64);
  }

  return sanitized;
}

function getPendingSyncQueue(): Record<string, JurnalPembelajaran> {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingSyncQueue(queue: Record<string, JurnalPembelajaran>): void {
  try {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function enqueuePendingSync(jurnal: JurnalPembelajaran): void {
  if (!jurnal?.id || SEED_JURNAL_IDS.has(jurnal.id)) return;
  const queue = getPendingSyncQueue();
  queue[jurnal.id] = jurnal;
  savePendingSyncQueue(queue);
}

function dequeuePendingSync(jurnalId: string): void {
  if (!jurnalId) return;
  const queue = getPendingSyncQueue();
  if (jurnalId in queue) {
    delete queue[jurnalId];
    savePendingSyncQueue(queue);
  }
}

export function removeIdsFromPendingSync(jurnalIds: string[]): void {
  if (!jurnalIds || jurnalIds.length === 0) return;
  const queue = getPendingSyncQueue();
  let changed = false;
  for (const id of jurnalIds) {
    if (id in queue) {
      delete queue[id];
      changed = true;
    }
  }
  if (changed) {
    savePendingSyncQueue(queue);
  }
}

export function clearPendingSyncQueue(): void {
  try {
    localStorage.removeItem(PENDING_QUEUE_KEY);
  } catch {}
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.toLowerCase().includes('quota exceeded') || msg.includes('resource-exhausted');
}

// Test connection on boot per reference guideline
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client sedang offline; mode cache offline aktif.');
      return false;
    }
    return true;
  }
}

// Save journal to Firestore in real time with offline retry queue
export async function syncJurnalToFirebase(jurnal: JurnalPembelajaran): Promise<boolean> {
  if (!jurnal || !jurnal.id) return false;

  const payload = sanitizeJurnalForFirestore(jurnal);
  enqueuePendingSync(payload);

  const path = `jurnals/${payload.id}`;
  try {
    const docRef = doc(db, 'jurnals', payload.id);
    await setDoc(docRef, payload, { merge: true });
    dequeuePendingSync(payload.id);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch {
        return false;
      }
    }
    if (isQuotaError(error)) {
      console.warn('[Firebase] Kuota harian Firestore tercapai, jurnal disimpan di antrean offline lokal.');
    }
    return false;
  }
}

// Batch write multiple journals atomically (used by Kepsek 1-click batch validation)
export async function syncJurnalsBatchToFirebase(jurnals: JurnalPembelajaran[]): Promise<number> {
  if (!jurnals || jurnals.length === 0) return 0;

  let syncedCount = 0;
  const CHUNK_SIZE = 400;

  for (let i = 0; i < jurnals.length; i += CHUNK_SIZE) {
    const chunk = jurnals.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    const sanitizedChunk: Array<JurnalPembelajaran & { _syncedAt: string }> = [];

    for (const item of chunk) {
      if (!item?.id) continue;
      const sanitized = sanitizeJurnalForFirestore(item);
      enqueuePendingSync(sanitized);
      sanitizedChunk.push(sanitized);
      batch.set(doc(db, 'jurnals', sanitized.id), sanitized, { merge: true });
    }

    try {
      await batch.commit();
      for (const s of sanitizedChunk) {
        dequeuePendingSync(s.id);
      }
      syncedCount += sanitizedChunk.length;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'jurnals');
        } catch {
          break;
        }
      }
      break;
    }
  }

  return syncedCount;
}

// Delete selected journals from Firestore in atomic batches
export async function deleteJurnalsFromFirebase(
  jurnalIds: string[]
): Promise<{ deletedCount: number; error?: string }> {
  if (!jurnalIds || jurnalIds.length === 0) return { deletedCount: 0 };

  removeIdsFromPendingSync(jurnalIds);
  const validIds = jurnalIds
    .map((id) => clampString(id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-'))
    .filter(Boolean);

  if (validIds.length === 0) return { deletedCount: 0 };

  let deletedCount = 0;
  const CHUNK_SIZE = 400;

  for (let i = 0; i < validIds.length; i += CHUNK_SIZE) {
    const chunk = validIds.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const id of chunk) {
      batch.delete(doc(db, 'jurnals', id));
    }

    try {
      await batch.commit();
      deletedCount += chunk.length;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        try {
          handleFirestoreError(error, OperationType.DELETE, 'jurnals');
        } catch (wrapped) {
          return {
            deletedCount,
            error: wrapped instanceof Error ? wrapped.message : msg,
          };
        }
      }
      return { deletedCount, error: msg };
    }
  }

  return { deletedCount };
}

// Delete all journals currently stored in Firestore collection (batched cleanup for Admin)
export async function deleteAllJurnalsFromFirebase(): Promise<{ deletedCount: number; error?: string }> {
  clearPendingSyncQueue();
  let totalDeleted = 0;
  const CHUNK_SIZE = 400;

  try {
    while (true) {
      const snap = await getDocs(
        query(
          collection(db, 'jurnals'),
          where('status', 'in', ['Draft', 'Menunggu Validasi', 'Disetujui', 'Revisi']),
          limit(CHUNK_SIZE)
        )
      );
      if (snap.empty) break;

      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      totalDeleted += snap.size;

      if (snap.size < CHUNK_SIZE) break;
    }
    return { deletedCount: totalDeleted };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.DELETE, 'jurnals');
      } catch (wrapped) {
        return {
          deletedCount: totalDeleted,
          error: wrapped instanceof Error ? wrapped.message : msg,
        };
      }
    }
    return { deletedCount: totalDeleted, error: msg };
  }
}

// Flush queued offline journals when network returns or app boots
export async function flushPendingJurnalSyncs(): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  const queue = getPendingSyncQueue();
  const items = Object.values(queue);
  if (items.length === 0) return 0;

  let flushed = 0;
  for (const item of items) {
    const ok = await syncJurnalToFirebase(item);
    if (ok) flushed++;
    else break; // Stop flushing if offline or quota reached
  }
  return flushed;
}

// Save user profile (role, mapel_diampu, never password) to Firestore users collection
export async function syncUserToFirebase(user: User): Promise<boolean> {
  if (!user || !user.id) return false;
  const cleanId = clampString(user.id, 128).replace(/[^a-zA-Z0-9_\-]/g, '-');
  const path = `users/${cleanId}`;

  const safePayload: Record<string, unknown> = {
    id: cleanId,
    username: clampString(user.username || cleanId, 100),
    nama: clampString(user.nama || '-', 200),
    role: (['guru', 'kepsek', 'admin'].includes(user.role) ? user.role : 'guru') as UserRole,
    nip: clampString(cleanNipValue(user.nip), 32),
    _updatedAt: new Date().toISOString(),
  };

  if (typeof user.kode_guru === 'number' && Number.isFinite(user.kode_guru)) {
    safePayload.kode_guru = user.kode_guru;
  }
  if (typeof user.gelar === 'string') {
    safePayload.gelar = clampString(user.gelar, 100);
  }
  if (typeof user.email === 'string') {
    safePayload.email = clampString(user.email, 200);
  }
  if (typeof user.avatar === 'string' && !user.avatar.startsWith('data:')) {
    safePayload.avatar = clampString(user.avatar, 2000);
  }
  if (Array.isArray(user.mapel_diampu)) {
    safePayload.mapel_diampu = user.mapel_diampu.slice(0, 30).map((m) => clampString(m, 100));
  }
  if (Array.isArray(user.jurusan)) {
    safePayload.jurusan = user.jurusan.slice(0, 20).map((j) => clampString(j, 100));
  }

  try {
    await setDoc(doc(db, 'users', cleanId), safePayload, { merge: true });
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Fetch updated user profiles/roles/mapel from Firestore without touching local passwords
export async function syncUsersFromFirebase(
  currentUsers: User[],
  saveUsersFn: (nextUsers: User[]) => void
): Promise<User[]> {
  const path = 'users';
  try {
    const q = query(
      collection(db, path),
      where('role', 'in', ['guru', 'kepsek', 'admin']),
      limit(150)
    );
    const snap = await getDocs(q);
    if (snap.empty) return currentUsers;

    const remoteMap = new Map<string, Partial<User>>();
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Partial<User>;
      if (data?.id) {
        remoteMap.set(data.id, data);
      }
    });

    if (remoteMap.size === 0) return currentUsers;

    let changed = false;
    const nextUsers = currentUsers.map((u) => {
      const remote = remoteMap.get(u.id);
      if (!remote) return u;
      changed = true;
      return {
        ...u,
        nama: remote.nama || u.nama,
        gelar: remote.gelar !== undefined ? remote.gelar : u.gelar,
        email: remote.email || u.email,
        role: remote.role || u.role,
        nip: remote.nip ? cleanNipValue(remote.nip) : u.nip,
        mapel_diampu: Array.isArray(remote.mapel_diampu) ? remote.mapel_diampu : u.mapel_diampu,
        jurusan: Array.isArray(remote.jurusan) ? remote.jurusan : u.jurusan,
      };
    });

    // Also include newly added teachers created by Admin on another device
    const localIds = new Set(nextUsers.map((u) => u.id));
    remoteMap.forEach((remote, id) => {
      if (!localIds.has(id) && remote.username && remote.nama && remote.role) {
        changed = true;
        nextUsers.push({
          id,
          kode_guru: remote.kode_guru,
          username: remote.username,
          password: remote.role === 'admin' ? 'admin123' : remote.role === 'kepsek' ? 'kepsek123' : 'guru123',
          nama: remote.nama,
          gelar: remote.gelar,
          email: remote.email || '',
          role: remote.role,
          nip: cleanNipValue(remote.nip),
          mapel_diampu: remote.mapel_diampu || [],
          jurusan: remote.jurusan || [],
        });
      }
    });

    if (changed) {
      saveUsersFn(nextUsers);
    }
    return nextUsers;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {}
    }
    return currentUsers;
  }
}

// Sync shared AppConfig (/config/main)
export async function syncConfigToFirebase(config: AppConfig): Promise<boolean> {
  const path = 'config/main';
  const payload: Record<string, unknown> = {
    sekolah: clampString(config.sekolah || 'SMKN 1 Sidayu Gresik', 200),
    kepala_sekolah: clampString(config.kepala_sekolah || 'Arni Sulistyowati, S.Pd., M.Pd', 200),
    nip_kepala_sekolah: clampString(cleanNipValue(config.nip_kepala_sekolah), 32),
    gas_web_app_url: clampString(config.gas_web_app_url || '', 500),
    spreadsheet_id: clampString(config.spreadsheet_id || '', 200),
    lock_timeout_ms: clampInt(config.lock_timeout_ms || 15000, 1000, 120000),
    tahun_ajaran: clampString(config.tahun_ajaran || '', 50),
    semester: clampString(config.semester || '', 30),
    _updatedAt: new Date().toISOString(),
  };

  if (typeof config.logo_url === 'string' && config.logo_url.length <= 340000) {
    payload.logo_url = config.logo_url;
  }
  if (typeof config.logo_jatim_url === 'string' && config.logo_jatim_url.length <= 340000) {
    payload.logo_jatim_url = config.logo_jatim_url;
  }
  if (typeof config.qr_code_ttd_url === 'string' && config.qr_code_ttd_url.length <= 340000) {
    payload.qr_code_ttd_url = config.qr_code_ttd_url;
  }
  if (Array.isArray(config.deleted_seed_ids)) {
    payload.deleted_seed_ids = config.deleted_seed_ids
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
      .slice(0, 20)
      .map((id) => clampString(id, 128));
  }
  if (Array.isArray(config.deleted_cptp_ids)) {
    payload.deleted_cptp_ids = config.deleted_cptp_ids
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
      .slice(0, 50)
      .map((id) => clampString(id, 128));
  }

  try {
    await setDoc(doc(db, 'config', 'main'), payload, { merge: true });
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function loadConfigFromFirebase(
  currentConfig: AppConfig,
  saveConfigFn: (partial: Partial<AppConfig>) => AppConfig
): Promise<AppConfig> {
  const path = 'config/main';
  try {
    const snap = await getDoc(doc(db, 'config', 'main'));
    if (!snap.exists()) return currentConfig;
    const remote = snap.data() as Partial<AppConfig>;
    const patch: Partial<AppConfig> = {};
    if (remote.sekolah) patch.sekolah = remote.sekolah;
    if (remote.kepala_sekolah) patch.kepala_sekolah = remote.kepala_sekolah;
    if (remote.nip_kepala_sekolah) patch.nip_kepala_sekolah = cleanNipValue(remote.nip_kepala_sekolah);
    if (remote.gas_web_app_url) patch.gas_web_app_url = remote.gas_web_app_url;
    if (remote.spreadsheet_id !== undefined) patch.spreadsheet_id = remote.spreadsheet_id;
    if (remote.tahun_ajaran) patch.tahun_ajaran = remote.tahun_ajaran;
    if (remote.semester) patch.semester = remote.semester;
    if (remote.logo_url) patch.logo_url = remote.logo_url;
    if (remote.logo_jatim_url) patch.logo_jatim_url = remote.logo_jatim_url;
    if (remote.qr_code_ttd_url) patch.qr_code_ttd_url = remote.qr_code_ttd_url;
    if (Array.isArray(remote.deleted_seed_ids)) {
      patch.deleted_seed_ids = remote.deleted_seed_ids;
      addDeletedSeedIds(remote.deleted_seed_ids);
    }
    if (Array.isArray(remote.deleted_cptp_ids)) {
      patch.deleted_cptp_ids = remote.deleted_cptp_ids;
      addDeletedSeedCptpIds(remote.deleted_cptp_ids);
    }
    return saveConfigFn(patch);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {}
    }
    return currentConfig;
  }
}

export interface JournalScope {
  role: UserRole;
  nip?: string;
  nama?: string;
  gelar?: string;
}

function getQueryLimitForScope(_scope: JournalScope): number {
  return 400;
}

function buildScopedJournalQuery(_scope: JournalScope): Query<DocumentData> {
  const colRef = collection(db, 'jurnals');
  return query(
    colRef,
    where('status', 'in', ['Draft', 'Menunggu Validasi', 'Disetujui', 'Revisi']),
    limit(400)
  );
}

function mergeCloudAndLocalJournals(
  localJournals: JurnalPembelajaran[],
  cloudJournals: JurnalPembelajaran[],
  options?: {
    isExhaustiveServerSnapshot?: boolean;
    removedIds?: Set<string>;
  }
): JurnalPembelajaran[] {
  const pendingQueue = getPendingSyncQueue();
  const deletedSeeds = new Set(getDeletedSeedIds());
  const cloudIds = new Set(cloudJournals.map((j) => j.id).filter(Boolean));
  const mergedMap = new Map<string, JurnalPembelajaran>();

  for (const lj of localJournals) {
    if (!lj?.id) continue;
    if (options?.removedIds?.has(lj.id)) continue;
    if (SEED_JURNAL_IDS.has(lj.id) && deletedSeeds.has(lj.id)) continue;

    if (options?.isExhaustiveServerSnapshot && !cloudIds.has(lj.id)) {
      const isPendingOffline = lj.id in pendingQueue;
      const isUndeletedSeed = SEED_JURNAL_IDS.has(lj.id) && !deletedSeeds.has(lj.id);
      if (!isPendingOffline && !isUndeletedSeed) {
        // Removed on Firestore (e.g. cleaned up by Admin)
        continue;
      }
    }

    mergedMap.set(lj.id, lj);
  }

  for (const cj of cloudJournals) {
    if (!cj?.id) continue;
    if (options?.removedIds?.has(cj.id)) continue;
    const localExisting = mergedMap.get(cj.id);
    if (!localExisting) {
      mergedMap.set(cj.id, cj);
      continue;
    }

    // If local item is waiting in offline sync queue and newer than cloud, keep local
    if (cj.id in pendingQueue) {
      const localTs = new Date(localExisting.timestamp || 0).getTime();
      const cloudTs = new Date(cj.timestamp || 0).getTime();
      if (localTs > cloudTs && cj.status === localExisting.status) {
        continue;
      }
    }

    const localTs = new Date(localExisting.timestamp || 0).getTime();
    const cloudTs = new Date(cj.timestamp || 0).getTime();
    const cloudHasValidation =
      (cj.status === 'Disetujui' || cj.status === 'Revisi') &&
      localExisting.status === 'Menunggu Validasi';

    if (cloudHasValidation || cloudTs >= localTs) {
      mergedMap.set(cj.id, cj);
    }
  }

  const merged = Array.from(mergedMap.values());
  merged.sort((a, b) => (b.timestamp || b.tanggal || '').localeCompare(a.timestamp || a.tanggal || ''));
  return merged;
}

// Scoped realtime listener for live updates across 100 teachers, Kepsek, and Admin
export function subscribeToFirestoreJurnals(
  scope: JournalScope,
  getLocalJournals: () => JurnalPembelajaran[],
  saveLocalJournals: (list: JurnalPembelajaran[]) => void,
  onUpdate: (updatedJournals: JurnalPembelajaran[]) => void
): () => void {
  const path = 'jurnals';
  const queryLimit = getQueryLimitForScope(scope);
  try {
    const q = buildScopedJournalQuery(scope);
    return onSnapshot(
      q,
      (snapshot) => {
        const cloudJournals: JurnalPembelajaran[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as JurnalPembelajaran;
          if (data && data.id) {
            cloudJournals.push(data);
          }
        });

        const removedIds = new Set<string>();
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            removedIds.add(change.doc.id);
          }
        });

        const isExhaustiveServerSnapshot =
          !snapshot.metadata.fromCache && cloudJournals.length < queryLimit;

        const merged = mergeCloudAndLocalJournals(getLocalJournals(), cloudJournals, {
          isExhaustiveServerSnapshot,
          removedIds,
        });
        saveLocalJournals(merged);
        onUpdate(merged);
      },
      (error) => {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch {}
        } else if (isQuotaError(error)) {
          console.warn('[Firebase] Kuota pembacaan harian Firestore tercapai; menampilkan cache lokal.');
        } else {
          console.warn('[Firebase] Realtime listener notice:', msg);
        }
      }
    );
  } catch (err) {
    console.warn('[Firebase] Gagal mengaktifkan realtime listener:', err);
    return () => {};
  }
}

// Keep backward-compatible manual sync helper if invoked explicitly
export async function syncLocalAndFirestoreJurnals(
  scope: JournalScope,
  getLocalJournals: () => JurnalPembelajaran[],
  saveLocalJournals: (list: JurnalPembelajaran[]) => void,
  onDataMerged?: (updatedJournals: JurnalPembelajaran[]) => void
): Promise<JurnalPembelajaran[]> {
  const path = 'jurnals';
  const queryLimit = getQueryLimitForScope(scope);
  try {
    await flushPendingJurnalSyncs();
    const q = buildScopedJournalQuery(scope);
    const snap = await getDocs(q);
    const cloudJournals: JurnalPembelajaran[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as JurnalPembelajaran;
      if (data && data.id) cloudJournals.push(data);
    });

    const merged = mergeCloudAndLocalJournals(getLocalJournals(), cloudJournals, {
      isExhaustiveServerSnapshot: cloudJournals.length < queryLimit,
    });
    saveLocalJournals(merged);
    if (onDataMerged) onDataMerged(merged);
    return merged;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {}
    }
    return getLocalJournals();
  }
}

// =====================================================================
// BANK CP, TP, ATP & MATERI POKOK (/cptp/{cptpId}) REALTIME SYNC
// =====================================================================

const VALID_CPTP_FASES = new Set(['E', 'F', 'E/F']);

export function sanitizeCPTPForFirestore(
  item: KurikulumCPTP
): KurikulumCPTP & { _updatedAt: string } {
  const cleanId = clampString(item.id || `CPTP-${Date.now()}`, 128).replace(/[^a-zA-Z0-9_\-]/g, '-');
  const faseVal = VALID_CPTP_FASES.has(item.fase) ? item.fase : 'F';

  const sanitized: KurikulumCPTP & { _updatedAt: string } = {
    id: cleanId || `CPTP-${Date.now()}`,
    mapel_kode: clampString((item.mapel_kode || 'UMUM').trim().toUpperCase(), 32) || 'UMUM',
    fase: faseVal,
    elemen: clampString((item.elemen || '').trim(), 300),
    cp: clampString((item.cp || '').trim(), 4000),
    tp: clampString((item.tp || '').trim(), 4000),
    atp: clampString((item.atp || '').trim(), 4000),
    _updatedAt: new Date().toISOString(),
  };

  if (typeof item.materi_pokok === 'string') {
    sanitized.materi_pokok = clampString(item.materi_pokok.trim(), 1000);
  }

  return sanitized;
}

function getPendingCptpQueue(): Record<string, KurikulumCPTP> {
  try {
    const raw = localStorage.getItem(PENDING_CPTP_QUEUE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingCptpQueue(queue: Record<string, KurikulumCPTP>): void {
  try {
    localStorage.setItem(PENDING_CPTP_QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

function enqueuePendingCptpSync(item: KurikulumCPTP): void {
  if (!item?.id) return;
  const queue = getPendingCptpQueue();
  queue[item.id] = item;
  savePendingCptpQueue(queue);
}

function dequeuePendingCptpSync(cptpId: string): void {
  if (!cptpId) return;
  const queue = getPendingCptpQueue();
  if (cptpId in queue) {
    delete queue[cptpId];
    savePendingCptpQueue(queue);
  }
}

function getKnownCloudCptpIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_CLOUD_CPTP_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function addKnownCloudCptpIds(ids: string[]): void {
  if (ids.length === 0) return;
  const known = getKnownCloudCptpIds();
  let changed = false;
  for (const id of ids) {
    if (!known.has(id)) {
      known.add(id);
      changed = true;
    }
  }
  if (changed) {
    try {
      localStorage.setItem(KNOWN_CLOUD_CPTP_KEY, JSON.stringify(Array.from(known).slice(-500)));
    } catch {}
  }
}

function removeKnownCloudCptpId(id: string): void {
  const known = getKnownCloudCptpIds();
  if (known.delete(id)) {
    try {
      localStorage.setItem(KNOWN_CLOUD_CPTP_KEY, JSON.stringify(Array.from(known)));
    } catch {}
  }
}

export async function syncCPTPToFirebase(item: KurikulumCPTP): Promise<boolean> {
  if (!item || !item.id) return false;
  const payload = sanitizeCPTPForFirestore(item);
  enqueuePendingCptpSync(payload);
  const path = `cptp/${payload.id}`;

  try {
    await setDoc(doc(db, 'cptp', payload.id), payload, { merge: true });
    dequeuePendingCptpSync(payload.id);
    addKnownCloudCptpIds([payload.id]);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function syncCPTPBatchToFirebase(items: KurikulumCPTP[]): Promise<number> {
  if (!items || items.length === 0) return 0;
  let synced = 0;
  const CHUNK_SIZE = 300;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    const sanitizedList: Array<KurikulumCPTP & { _updatedAt: string }> = [];

    for (const item of chunk) {
      if (!item?.id) continue;
      const clean = sanitizeCPTPForFirestore(item);
      sanitizedList.push(clean);
      batch.set(doc(db, 'cptp', clean.id), clean, { merge: true });
    }

    if (sanitizedList.length === 0) continue;

    try {
      await batch.commit();
      for (const item of sanitizedList) {
        dequeuePendingCptpSync(item.id);
      }
      addKnownCloudCptpIds(sanitizedList.map((s) => s.id));
      synced += sanitizedList.length;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'cptp');
        } catch {
          break;
        }
      }
      break;
    }
  }

  return synced;
}

export async function deleteCPTPFromFirebase(cptpId: string): Promise<boolean> {
  if (!cptpId) return false;
  dequeuePendingCptpSync(cptpId);
  removeKnownCloudCptpId(cptpId);

  const cleanId = clampString(cptpId, 128).replace(/[^a-zA-Z0-9_\-]/g, '-');
  if (!cleanId) return false;

  try {
    await deleteDoc(doc(db, 'cptp', cleanId));
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `cptp/${cleanId}`);
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function flushPendingCptpSyncs(): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  const queue = getPendingCptpQueue();
  const items = Object.values(queue);
  if (items.length === 0) return 0;

  let flushed = 0;
  for (const item of items) {
    const ok = await syncCPTPToFirebase(item);
    if (ok) flushed++;
    else break;
  }
  return flushed;
}

export function subscribeToFirestoreCPTP(
  getLocalList: () => KurikulumCPTP[],
  saveLocalList: (list: KurikulumCPTP[]) => void,
  onUpdate: (mergedList: KurikulumCPTP[]) => void
): () => void {
  const path = 'cptp';
  const queryLimit = 300;
  let unpushedBackfillTriggered = false;

  try {
    const q = query(
      collection(db, path),
      where('fase', 'in', ['E', 'F', 'E/F']),
      limit(queryLimit)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const cloudItems: (KurikulumCPTP & { _updatedAt?: string })[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as KurikulumCPTP & { _updatedAt?: string };
          if (data && data.id) {
            cloudItems.push(data);
          }
        });

        const removedIds = new Set<string>();
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            removedIds.add(change.doc.id);
            removeKnownCloudCptpId(change.doc.id);
          }
        });

        const cloudIds = new Set(cloudItems.map((c) => c.id));
        const pendingQueue = getPendingCptpQueue();
        const deletedSeeds = new Set(getDeletedSeedCptpIds());
        const knownCloudIds = getKnownCloudCptpIds();
        const isExhaustiveServerSnapshot =
          !snapshot.metadata.fromCache && cloudItems.length < queryLimit;

        if (!snapshot.metadata.fromCache && cloudItems.length > 0) {
          addKnownCloudCptpIds(cloudItems.map((c) => c.id));
        }

        const localItems = getLocalList();
        const mergedMap = new Map<string, KurikulumCPTP>();
        const unpushedLocalCustomItems: KurikulumCPTP[] = [];

        for (const li of localItems) {
          if (!li?.id) continue;
          if (removedIds.has(li.id)) continue;
          if (SEED_CPTP_IDS.has(li.id) && deletedSeeds.has(li.id)) continue;

          if (isExhaustiveServerSnapshot && !cloudIds.has(li.id)) {
            const isPending = li.id in pendingQueue;
            const isUndeletedSeed = SEED_CPTP_IDS.has(li.id) && !deletedSeeds.has(li.id);
            const wasPreviouslyOnCloud = knownCloudIds.has(li.id);
            if (wasPreviouslyOnCloud && !isPending && !isUndeletedSeed) {
              // Deleted from Firestore by Admin
              continue;
            }
            if (!SEED_CPTP_IDS.has(li.id) && !wasPreviouslyOnCloud) {
              unpushedLocalCustomItems.push(li);
            }
          }

          mergedMap.set(li.id, li);
        }

        for (const ci of cloudItems) {
          if (!ci?.id || removedIds.has(ci.id)) continue;
          if (ci.id in pendingQueue) {
            // Keep newer local pending edit until flushed
            continue;
          }
          const { _updatedAt: _ignored, ...cleanItem } = ci;
          mergedMap.set(ci.id, cleanItem);
        }

        const merged = Array.from(mergedMap.values());
        saveLocalList(merged);
        onUpdate(merged);

        // Automatically backfill custom local CPTP items that Admin saved before cloud sync was enabled
        if (
          !snapshot.metadata.fromCache &&
          !unpushedBackfillTriggered &&
          unpushedLocalCustomItems.length > 0
        ) {
          unpushedBackfillTriggered = true;
          syncCPTPBatchToFirebase(unpushedLocalCustomItems).catch(() => {});
        }
      },
      (error) => {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('Missing or insufficient permissions') || msg.includes('permission-denied')) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch {}
        } else if (isQuotaError(error)) {
          console.warn('[Firebase] Kuota pembacaan harian Firestore tercapai; menampilkan Bank Materi lokal.');
        } else {
          console.warn('[Firebase] CPTP listener notice:', msg);
        }
      }
    );
  } catch (err) {
    console.warn('[Firebase] Gagal mengaktifkan listener Bank CP/TP:', err);
    return () => {};
  }
}

// Initial connection check on boot
testFirestoreConnection();
