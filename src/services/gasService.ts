import { JurnalPembelajaran, UserRole } from '../types';

export interface GasPingResponse {
  status: 'success' | 'error';
  message: string;
  server_time?: string;
  spreadsheet_name?: string;
  sheets_count?: number;
}

export class GasService {
  /**
   * Test live connection to Google Apps Script Web App
   */
  static async testConnection(webAppUrl: string): Promise<GasPingResponse> {
    if (!webAppUrl || !webAppUrl.trim()) {
      throw new Error('URL Google Apps Script Web App belum diisi.');
    }

    const cleanUrl = webAppUrl.trim();
    const url = cleanUrl.includes('?') ? `${cleanUrl}&action=ping` : `${cleanUrl}?action=ping`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Gagal terhubung ke Apps Script (HTTP ${res.status}). Pastikan Web App di-deploy dengan akses 'Anyone' (Siapa Saja).`);
    }

    const data = await res.json();
    return data;
  }

  /**
   * Fetch all data from Google Apps Script
   */
  static async fetchAllData(webAppUrl: string): Promise<any> {
    const cleanUrl = webAppUrl.trim();
    const url = cleanUrl.includes('?') ? `${cleanUrl}&action=getAllData` : `${cleanUrl}?action=getAllData`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Gagal membaca data dari Apps Script (HTTP ${res.status})`);
    }
    const json = await res.json();
    if (json.status !== 'success') {
      throw new Error(json.message || 'Gagal memuat data dari Spreadsheet');
    }
    return json.data;
  }

  /**
   * Submit journal to Apps Script backend
   */
  static async submitJournal(webAppUrl: string, journal: JurnalPembelajaran): Promise<any> {
    const res = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // text/plain prevents CORS preflight in Apps Script
      },
      body: JSON.stringify({
        action: 'submitJurnal',
        data: journal,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengirim jurnal ke Apps Script (HTTP ${res.status})`);
    }
    return res.json();
  }

  /**
   * Validate journal via Apps Script
   */
  static async validateJournal(
    webAppUrl: string,
    payload: { id: string; status: 'Disetujui' | 'Revisi'; catatan_supervisi: string; validator_nama: string }
  ): Promise<any> {
    const res = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'validasiJurnal',
        data: payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gagal menyimpan validasi ke Apps Script (HTTP ${res.status})`);
    }
    return res.json();
  }

  /**
   * Update User Role in Google Apps Script
   */
  static async updateUserRole(
    webAppUrl: string,
    payload: { id: string; nip: string; newRole: UserRole }
  ): Promise<any> {
    const res = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'updateRole',
        data: payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengubah role di Apps Script (HTTP ${res.status})`);
    }
    return res.json();
  }

  /**
   * Update Mapel Diampu oleh Guru in Google Apps Script
   */
  static async updateGuruMapel(
    webAppUrl: string,
    payload: { userId?: string; kode_guru?: number; nip?: string; mapels: string[] }
  ): Promise<any> {
    const res = await fetch(webAppUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'updateGuruMapel',
        data: payload,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gagal memperbarui mapel guru di Apps Script (HTTP ${res.status})`);
    }
    return res.json();
  }

  /**
   * Upload foto dokumentasi ke Google Drive melalui Google Apps Script Web App
   */
  static async uploadPhoto(
    webAppUrl: string,
    payload: { base64: string; filename?: string; jurnalId?: string; guruNama?: string },
    timeoutMs: number = 7000
  ): Promise<{ status: string; url?: string; driveUrl?: string; fileId?: string; message?: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'uploadFoto',
          data: payload,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Gagal upload foto ke Google Drive (HTTP ${res.status})`);
      }
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

