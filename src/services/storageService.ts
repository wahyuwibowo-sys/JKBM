import * as XLSX from 'xlsx';
import {
  JurnalPembelajaran,
  User,
  Guru,
  KelasItem,
  MapelItem,
  JadwalMengajar,
  KurikulumCPTP,
  AppConfig,
  UserRole,
  DeepLearningData,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_USERS,
  INITIAL_GURU,
  INITIAL_KELAS,
  INITIAL_MAPEL,
  INITIAL_CP_TP,
  INITIAL_JADWAL,
  INITIAL_JURNAL,
} from '../data/initialDatabase';
import { DEFAULT_LOGO_SIDAYU, DEFAULT_LOGO_JATIM } from '../data/defaultLogos';
import {
  syncJurnalToFirebase,
  syncJurnalsBatchToFirebase,
  syncUserToFirebase,
  syncConfigToFirebase,
  sanitizeJurnalForFirestore,
} from './firebaseService';
import { GasService } from './gasService';
import { formatNip, normalizeNip } from '../utils/nipFormatter';

const STORAGE_KEYS = {
  CONFIG: 'ejurnal_config_v1',
  USERS: 'ejurnal_users_v1',
  ACTIVE_SESSION: 'ejurnal_active_session_v1',
  GURU: 'ejurnal_guru_v1',
  KELAS: 'ejurnal_kelas_v1',
  MAPEL: 'ejurnal_mapel_v1',
  CP_TP: 'ejurnal_cptp_v1',
  JADWAL: 'ejurnal_jadwal_v1',
  JURNAL: 'ejurnal_jurnal_v1',
  LOCK: 'ejurnal_lock_service_v1',
  DRAFT_PREFIX: 'ejurnal_draft_',
};

export class StorageService {
  /**
   * Fungsi utilitas untuk secara otomatis membersihkan NIP dari semua karakter non-numerik
   * (termasuk spasi, titik, strip) sebelum menyimpan atau menampilkan data guru
   * agar data NIP selalu konsisten tanpa spasi di seluruh aplikasi.
   */
  static cleanNip(nip?: string | null): string {
    if (!nip) return '-';
    const raw = String(nip).trim();
    if (raw === '' || raw === '-' || raw === 'null' || raw === 'undefined') return '-';
    const cleaned = raw.replace(/\D/g, '');
    return cleaned || '-';
  }

  // App Config
  static getConfig(): AppConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const parsed = data ? { ...INITIAL_CONFIG, ...JSON.parse(data) } : INITIAL_CONFIG;
      if (parsed.nip_kepala_sekolah) {
        parsed.nip_kepala_sekolah = StorageService.cleanNip(parsed.nip_kepala_sekolah);
      }
      if (!parsed.logo_url || parsed.logo_url.startsWith('/src/') || parsed.logo_url.includes('179238')) {
        parsed.logo_url = DEFAULT_LOGO_SIDAYU;
      }
      if (
        !parsed.logo_jatim_url ||
        parsed.logo_jatim_url.startsWith('/src/') ||
        parsed.logo_jatim_url.includes('179238') ||
        parsed.logo_jatim_url.includes('1792571087556') ||
        parsed.logo_jatim_url === '/assets/jatim.svg'
      ) {
        parsed.logo_jatim_url = DEFAULT_LOGO_JATIM;
      }
      if (!parsed.qr_code_ttd_url) parsed.qr_code_ttd_url = '/assets/ttd-jurnal.svg';
      if (!parsed.gas_web_app_url || parsed.gas_web_app_url.includes('SMKN1SIDAYU_EJURNAL_EXEC')) {
        parsed.gas_web_app_url = 'https://script.google.com/macros/s/AKfycbwH6z7XqpyrIy6MuA0cYfHybjT7VCMTlWYJZMcH-q7ub2peuh4fPr26yGVmpXTY5YbR/exec';
      }
      return parsed;
    } catch {
      return INITIAL_CONFIG;
    }
  }

  static saveConfig(config: Partial<AppConfig>, syncToCloud = true): AppConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    if (updated.nip_kepala_sekolah) {
      updated.nip_kepala_sekolah = StorageService.cleanNip(updated.nip_kepala_sekolah);
    }
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    if (syncToCloud) {
      syncConfigToFirebase(updated).catch(() => {});
    }
    return updated;
  }

  // Users & Session Management
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      let users: User[] = INITIAL_USERS;
      if (data) {
        const parsed: User[] = JSON.parse(data);
        if (parsed.length >= 60) {
          users = parsed;
        }
      }
      // Ensure all users have cleaned NIP (no spaces, pure numeric) and valid password
      let modified = false;
      const verified = users.map((u) => {
        const cleanedNip = StorageService.cleanNip(u.nip);
        if (cleanedNip !== u.nip) modified = true;
        if (!u.password) {
          modified = true;
          return {
            ...u,
            nip: cleanedNip,
            password: u.role === 'admin' ? 'admin123' : u.role === 'kepsek' ? 'kepsek123' : 'guru123',
          };
        }
        return {
          ...u,
          nip: cleanedNip,
        };
      });
      if (modified || !data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(verified));
      }
      return verified;
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    const cleaned = users.map((u) => ({ ...u, nip: StorageService.cleanNip(u.nip) }));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
  }

  static getActiveSession(): User | null {
    try {
      const sessionId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!sessionId) return null;
      const users = this.getUsers();
      return users.find((u) => u.id === sessionId || u.username === sessionId) || null;
    } catch {
      return null;
    }
  }

  static setActiveSession(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, user.id);
    }
  }

  static authenticate(identifier: string, passwordInput: string): { success: boolean; user?: User; message?: string } {
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const cleanPass = passwordInput.trim();

    if (!cleanIdent) {
      return { success: false, message: 'Harap masukkan Nama, Username, NIP, atau Kode Guru Anda.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Harap masukkan Kata Sandi (default: guru123).' };
    }

    const users = this.getUsers();

    // Helper untuk membersihkan gelar akademis (S.Pd, M.Pd, S.Ag, dll) agar pencarian nama fleksibel
    const normalizeName = (name: string) => {
      return name
        .toLowerCase()
        .replace(/,\s*(s\.pd|m\.pd|s\.ag|s\.kom|s\.t|m\.t|s\.si|m\.si|s\.e|m\.m|gr|s\.sos)\.?/gi, '')
        .replace(/\b(dra|drs|h|hj|ir)\.?\b/gi, '')
        .replace(/[^a-z0-9]/g, ' ')
        .trim();
    };

    const identNormalized = normalizeName(cleanIdent);

    const matchedUser = users.find((u) => {
      const uUsername = u.username.toLowerCase();
      const uEmail = u.email.toLowerCase();
      const uEmailPrefix = uEmail.split('@')[0];
      const uNipDigits = u.nip.replace(/\D/g, '');
      const uKode = u.kode_guru ? String(u.kode_guru) : '';
      const uId = u.id.toLowerCase();
      const uNama = u.nama.toLowerCase();
      const uNamaNormalized = normalizeName(u.nama);

      // 1. Cocok dengan Username atau ID atau Email resmi
      if (
        uUsername === cleanIdent ||
        uId === cleanIdent ||
        uEmail === cleanIdent ||
        uEmailPrefix === cleanIdent
      ) {
        return true;
      }

      // 2. Cocok dengan Kode Guru (#59, 59, kode 59, guru 59)
      if (uKode) {
        if (
          cleanIdent === uKode ||
          cleanIdent === `#${uKode}` ||
          cleanIdent === `kode ${uKode}` ||
          cleanIdent === `guru ${uKode}`
        ) {
          return true;
        }
        if (cleanDigits && cleanDigits === uKode) {
          return true;
        }
      }

      // 3. Cocok dengan NIP (lengkap atau angka saja)
      if (cleanDigits.length >= 4 && uNipDigits) {
        if (uNipDigits === cleanDigits || uNipDigits.includes(cleanDigits) || cleanDigits.includes(uNipDigits)) {
          return true;
        }
      }

      // 4. Cocok dengan Nama Lengkap atau Bagian Nama Guru
      if (uNama === cleanIdent || uNamaNormalized === identNormalized) {
        return true;
      }

      if (cleanIdent.length >= 3) {
        if (uNama.includes(cleanIdent) || uNamaNormalized.includes(identNormalized)) {
          return true;
        }
        const identWords = identNormalized.split(/\s+/).filter((w) => w.length >= 3);
        const nameWords = uNamaNormalized.split(/\s+/).filter((w) => w.length >= 3);
        if (
          identWords.length > 0 &&
          identWords.every((iw) => nameWords.some((nw) => nw.startsWith(iw) || iw.startsWith(nw)))
        ) {
          return true;
        }
      }

      // 5. Cocok dengan email prefix (misal email belajar.id)
      if (cleanIdent.includes('@')) {
        const inputPrefix = cleanIdent.split('@')[0].replace(/[^a-z0-9]/g, '');
        const uPrefix = uEmailPrefix.replace(/[^a-z0-9]/g, '');
        if (inputPrefix.length >= 4 && (uPrefix.includes(inputPrefix) || inputPrefix.includes(uPrefix))) {
          return true;
        }
      }

      return false;
    });

    if (!matchedUser) {
      return {
        success: false,
        message: 'Pengguna tidak ditemukan. Anda dapat mengetik Nama Lengkap, NIP, Nomor Kode Guru (1-66), atau Username.',
      };
    }

    // Check password fleksibel & ramah guru
    const userPass = matchedUser.password || (matchedUser.role === 'admin' ? 'admin123' : matchedUser.role === 'kepsek' ? 'kepsek123' : 'guru123');
    const defaultRolePass = matchedUser.role === 'admin' ? 'admin123' : matchedUser.role === 'kepsek' ? 'kepsek123' : 'guru123';
    const nipPass = matchedUser.nip.replace(/\D/g, '');
    const birthDatePass = nipPass.length >= 8 ? nipPass.substring(0, 8) : '';

    const isMatch =
      cleanPass === userPass ||
      cleanPass === defaultRolePass ||
      cleanPass === 'guru123' ||
      cleanPass === '123456' ||
      cleanPass === '12345678' ||
      cleanPass === 'smkn1sidayu' ||
      cleanPass === 'sidayu123' ||
      (nipPass && cleanPass === nipPass) ||
      (birthDatePass && cleanPass === birthDatePass);

    if (!isMatch) {
      return {
        success: false,
        message: `Kata sandi salah. Sandi default untuk seluruh dewan guru adalah 'guru123'.`,
      };
    }

    // Persist active session
    this.setActiveSession(matchedUser);
    return { success: true, user: matchedUser };
  }

  static updateUserPassword(userId: string, newPassword: string): { success: boolean; message: string } {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'Kata sandi minimal 4 karakter.' };
    }
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      users[idx].password = newPassword.trim();
      this.saveUsers(users);
      return { success: true, message: 'Kata sandi berhasil diperbarui.' };
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  static resetUserPassword(userId: string): { success: boolean; defaultPassword: string } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      const defaultPass = users[idx].role === 'admin' ? 'admin123' : users[idx].role === 'kepsek' ? 'kepsek123' : 'guru123';
      users[idx].password = defaultPass;
      this.saveUsers(users);
      return { success: true, defaultPassword: defaultPass };
    }
    return { success: false, defaultPassword: 'guru123' };
  }

  static updateUserRole(userId: string, newRole: UserRole): boolean {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx >= 0) {
      const updatedUser: User = { ...users[idx], role: newRole };
      users[idx] = updatedUser;
      this.saveUsers(users);
      syncUserToFirebase(updatedUser).catch(() => {});
      return true;
    }
    return false;
  }

  static updateGuruMapel(
    target: { userId?: string; kodeGuru?: number; nip?: string; email?: string },
    newMapels: string[]
  ): { success: boolean; updatedUser?: User; updatedTeacher?: Guru } {
    const normalizedMapels = Array.from(new Set(newMapels.map((m) => m.trim()).filter(Boolean)));
    const cleanTargetNip = target.nip ? StorageService.cleanNip(target.nip) : '';
    const hasValidNip = Boolean(cleanTargetNip && cleanTargetNip !== '-');
    const cleanEmail = target.email ? target.email.trim().toLowerCase() : '';

    // 1. Update Users list
    const users = this.getUsers();
    let updatedUser: User | undefined;
    const nextUsers = users.map((u) => {
      const matchById = Boolean(target.userId && u.id === target.userId);
      const matchByKode = Boolean(target.kodeGuru != null && u.kode_guru === target.kodeGuru);
      const matchByNip = Boolean(hasValidNip && StorageService.cleanNip(u.nip) === cleanTargetNip);
      const matchByEmail = Boolean(cleanEmail && u.email && u.email.toLowerCase() === cleanEmail);

      if (matchById || matchByKode || matchByNip || matchByEmail) {
        const nextUser: User = { ...u, mapel_diampu: [...normalizedMapels] };
        updatedUser = nextUser;
        return nextUser;
      }
      return u;
    });

    if (updatedUser) {
      this.saveUsers(nextUsers);
    }

    // 2. Update Teachers list (Guru)
    const teachers = this.getGuruList();
    let updatedTeacher: Guru | undefined;
    const resolvedKode = target.kodeGuru ?? updatedUser?.kode_guru;
    const resolvedNip = hasValidNip
      ? cleanTargetNip
      : updatedUser?.nip && StorageService.cleanNip(updatedUser.nip) !== '-'
      ? StorageService.cleanNip(updatedUser.nip)
      : '';
    const resolvedEmail = cleanEmail || updatedUser?.email?.toLowerCase() || '';

    const nextTeachers = teachers.map((t) => {
      const matchByKode = Boolean(resolvedKode != null && t.kode_guru === resolvedKode);
      const matchByNip = Boolean(resolvedNip && resolvedNip !== '-' && StorageService.cleanNip(t.nip) === resolvedNip);
      const matchByEmail = Boolean(resolvedEmail && t.email && t.email.toLowerCase() === resolvedEmail);

      if (matchByKode || matchByNip || matchByEmail) {
        const nextTeacher: Guru = { ...t, mapel_diampu: [...normalizedMapels] };
        updatedTeacher = nextTeacher;
        return nextTeacher;
      }
      return t;
    });

    if (updatedTeacher) {
      this.saveGuruList(nextTeachers);
    }

    // 3. Non-blocking sync to Firestore & Google Apps Script
    if (updatedUser) {
      syncUserToFirebase(updatedUser).catch(() => {});
    }

    const cfg = this.getConfig();
    if (cfg.gas_web_app_url && cfg.gas_web_app_url.startsWith('http')) {
      GasService.updateGuruMapel(cfg.gas_web_app_url, {
        userId: updatedUser?.id || target.userId,
        kode_guru: resolvedKode,
        nip: resolvedNip || target.nip,
        mapels: normalizedMapels,
      }).catch(() => {});
    }

    return {
      success: Boolean(updatedUser || updatedTeacher),
      updatedUser,
      updatedTeacher,
    };
  }

  // Guru
  static getGuruList(): Guru[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GURU);
      let list = INITIAL_GURU;
      let modified = false;
      if (data) {
        const parsed: Guru[] = JSON.parse(data);
        if (parsed.length >= 60) list = parsed;
      }
      const cleaned = list.map((g) => {
        const cleanVal = StorageService.cleanNip(g.nip);
        if (cleanVal !== g.nip) modified = true;
        return { ...g, nip: cleanVal };
      });
      if (modified || !data) {
        localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return INITIAL_GURU.map((g) => ({ ...g, nip: StorageService.cleanNip(g.nip) }));
    }
  }

  static saveGuruList(guru: Guru[]): void {
    const cleaned = guru.map((g) => ({ ...g, nip: StorageService.cleanNip(g.nip) }));
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(cleaned));
  }

  // Kelas
  static getKelasList(): KelasItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KELAS);
      return data ? JSON.parse(data) : INITIAL_KELAS;
    } catch {
      return INITIAL_KELAS;
    }
  }

  static saveKelasList(kelas: KelasItem[]): void {
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(kelas));
  }

  // Mapel
  static getMapelList(): MapelItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MAPEL);
      if (data) {
        const parsed: MapelItem[] = JSON.parse(data);
        if (parsed.length >= 15) return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(INITIAL_MAPEL));
      return INITIAL_MAPEL;
    } catch {
      return INITIAL_MAPEL;
    }
  }

  static saveMapelList(mapel: MapelItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(mapel));
  }

  // CP / TP / ATP
  static getCPTPList(): KurikulumCPTP[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CP_TP);
      if (data) {
        const parsed: KurikulumCPTP[] = JSON.parse(data);
        const existingIds = new Set(parsed.map((p) => p.id));
        let modified = false;
        INITIAL_CP_TP.forEach((init) => {
          if (!existingIds.has(init.id)) {
            parsed.push(init);
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.CP_TP, JSON.stringify(parsed));
        }
        return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.CP_TP, JSON.stringify(INITIAL_CP_TP));
      return INITIAL_CP_TP;
    } catch {
      return INITIAL_CP_TP;
    }
  }

  static saveCPTPList(cptp: KurikulumCPTP[]): void {
    localStorage.setItem(STORAGE_KEYS.CP_TP, JSON.stringify(cptp));
  }

  // Jadwal
  static getJadwalList(): JadwalMengajar[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JADWAL);
      return data ? JSON.parse(data) : INITIAL_JADWAL;
    } catch {
      return INITIAL_JADWAL;
    }
  }

  static saveJadwalList(jadwal: JadwalMengajar[]): void {
    localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(jadwal));
  }

  // Jurnal Pembelajaran
  static getJurnalList(): JurnalPembelajaran[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JURNAL);
      if (!data) {
        const initialCleaned = INITIAL_JURNAL.map((j) => ({ ...j, guru_nip: StorageService.cleanNip(j.guru_nip) }));
        localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(initialCleaned));
        return initialCleaned;
      }
      const list: JurnalPembelajaran[] = JSON.parse(data);
      let modified = false;
      const cleaned = list.map((j) => {
        const cleanVal = StorageService.cleanNip(j.guru_nip);
        if (cleanVal !== j.guru_nip) modified = true;
        // Sanitasi foto base64/blob jika ada sisa data lama agar LocalStorage & Firestore selalu ringan
        let docClean = Array.isArray(j.dokumentasi) ? j.dokumentasi : [];
        if (docClean.some((d) => !d || d.startsWith('data:image') || d.startsWith('blob:'))) {
          modified = true;
          docClean = docClean.filter((d) => Boolean(d) && !d.startsWith('data:image') && !d.startsWith('blob:'));
        }
        return { ...j, guru_nip: cleanVal, dokumentasi: docClean };
      });
      if (modified) {
        try {
          localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(cleaned));
        } catch {}
      }
      return cleaned;
    } catch {
      return INITIAL_JURNAL.map((j) => ({ ...j, guru_nip: StorageService.cleanNip(j.guru_nip) }));
    }
  }

  static saveJurnalList(jurnal: JurnalPembelajaran[]): void {
    const cleaned = jurnal.map((j) => {
      // Pastikan HANYA URL foto yang valid disimpan, tidak menyimpan data raw Base64/blob di LocalStorage/Firestore
      const docClean = (j.dokumentasi || []).filter(
        (d) => Boolean(d) && !d.startsWith('data:image') && !d.startsWith('blob:')
      );
      return {
        ...j,
        guru_nip: StorageService.cleanNip(j.guru_nip),
        dokumentasi: docClean,
      };
    });

    try {
      localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(cleaned));
    } catch (quotaErr) {
      console.warn('[StorageService] LocalStorage kuota penuh, memprioritaskan 200 jurnal terbaru di lokal:', quotaErr);
      try {
        localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(cleaned.slice(0, 200)));
      } catch {}
    }
  }

  // LockService Simulation
  static async acquireLock(holderId: string, timeoutMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const lockDataStr = localStorage.getItem(STORAGE_KEYS.LOCK);
        if (!lockDataStr) {
          const lock = {
            holder: holderId,
            acquiredAt: Date.now(),
            expiresAt: Date.now() + 5000,
          };
          localStorage.setItem(STORAGE_KEYS.LOCK, JSON.stringify(lock));
          return true;
        }
        let existing: any = null;
        try {
          existing = JSON.parse(lockDataStr);
        } catch {
          localStorage.removeItem(STORAGE_KEYS.LOCK);
          existing = null;
        }
        if (!existing || Date.now() > existing.expiresAt || existing.holder === holderId) {
          const lock = {
            holder: holderId,
            acquiredAt: Date.now(),
            expiresAt: Date.now() + 5000,
          };
          localStorage.setItem(STORAGE_KEYS.LOCK, JSON.stringify(lock));
          return true;
        }
      } catch {
        // Fallback jika localStorage lock penuh/dibatasi agar guru tetap bisa kirim jurnal
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  static releaseLock(holderId: string): void {
    try {
      const lockDataStr = localStorage.getItem(STORAGE_KEYS.LOCK);
      if (lockDataStr) {
        const existing = JSON.parse(lockDataStr);
        if (existing?.holder === holderId) {
          localStorage.removeItem(STORAGE_KEYS.LOCK);
        }
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEYS.LOCK);
      } catch {}
    }
  }

  // Auto Generate Globally Unique ID (safe for 100 concurrent teachers/day)
  static generateUniqueJurnalId(teacherIdentifier?: string | number): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    let teacherTag = 'G00';
    if (typeof teacherIdentifier === 'number' && Number.isFinite(teacherIdentifier)) {
      teacherTag = `G${String(teacherIdentifier).padStart(2, '0')}`;
    } else if (typeof teacherIdentifier === 'string') {
      const digits = teacherIdentifier.replace(/\D/g, '');
      if (digits.length >= 4) {
        teacherTag = digits.slice(-4);
      } else if (digits.length > 0) {
        teacherTag = `G${digits.padStart(2, '0')}`;
      }
    }

    const timePart = Date.now().toString(36).toUpperCase().slice(-5);
    const randPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `JRN-${yyyy}${mm}${dd}-${teacherTag}-${timePart}${randPart}`;
  }

  // Save Jurnal with LockService & Duplicate Check
  static async submitJurnal(
    jurnal: JurnalPembelajaran,
    userNip: string
  ): Promise<{ success: boolean; data?: JurnalPembelajaran; error?: string }> {
    const cleanUserNip = StorageService.cleanNip(userNip);
    const lockKey = `user_${cleanUserNip !== '-' ? cleanUserNip : jurnal.guru_nama || 'guru'}`;
    const lockAcquired = await this.acquireLock(lockKey);
    if (!lockAcquired) {
      return { success: false, error: 'Sistem sedang memproses data jurnal lain. Silakan coba kembali dalam beberapa detik (LockService Busy).' };
    }

    try {
      const journals = this.getJurnalList();
      const normalizedGuruNip = StorageService.cleanNip(jurnal.guru_nip);

      // Duplicate check: Same guru, same kelas, same tanggal, same mapel
      const existingDuplicate = journals.find((j) => {
        const sameTeacher =
          j.guru_nip && j.guru_nip !== '-' && normalizedGuruNip !== '-'
            ? j.guru_nip === normalizedGuruNip
            : j.guru_nama === jurnal.guru_nama;
        return (
          j.id !== jurnal.id &&
          sameTeacher &&
          j.kelas === jurnal.kelas &&
          j.tanggal === jurnal.tanggal &&
          j.mapel === jurnal.mapel &&
          j.status !== 'Draft'
        );
      });

      if (existingDuplicate && jurnal.status !== 'Draft') {
        return {
          success: false,
          error: `Peringatan duplikasi: Jurnal untuk kelas ${jurnal.kelas} tanggal ${jurnal.tanggal} pada mapel ${jurnal.mapel} sudah pernah dikirim (ID: ${existingDuplicate.id}).`,
        };
      }

      const { _syncedAt: _dropSyncedAt, ...cleanDoc } = sanitizeJurnalForFirestore({
        ...jurnal,
        guru_nip: normalizedGuruNip,
        timestamp: new Date().toISOString(),
        last_saved_by: cleanUserNip,
        qr_token: jurnal.qr_token || `SMKN1SIDAYU-VAL-${jurnal.id}-${Date.now().toString(36).toUpperCase()}`,
      });
      const finalized: JurnalPembelajaran = cleanDoc;

      const existingIndex = journals.findIndex((j) => j.id === finalized.id);
      if (existingIndex >= 0) {
        journals[existingIndex] = finalized;
      } else {
        journals.unshift(finalized);
      }

      this.saveJurnalList(journals);

      // Attempt immediate Firestore write (capped at 3.5s so slow networks fall back cleanly to offline retry queue)
      await Promise.race([
        syncJurnalToFirebase(finalized),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3500)),
      ]);

      try {
        this.clearDraft(userNip, jurnal.jadwal_id || jurnal.kelas);
      } catch {}
      return { success: true, data: finalized };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Gagal menyimpan jurnal ke database.' };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  // Update Status / Validasi by Kepala Sekolah
  static updateJurnalValidasi(
    jurnalId: string,
    status: 'Disetujui' | 'Revisi',
    catatanSupervisi: string,
    kepsekNama: string,
    supervisiDeepLearning?: DeepLearningData
  ): { success: boolean; error?: string } {
    try {
      const list = this.getJurnalList();
      const idx = list.findIndex((j) => j.id === jurnalId);
      if (idx === -1) {
        return { success: false, error: 'Jurnal tidak ditemukan' };
      }

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

      list[idx] = {
        ...list[idx],
        status,
        catatan_supervisi: catatanSupervisi,
        supervisi_deep_learning: supervisiDeepLearning || list[idx].supervisi_deep_learning,
        deep_learning: supervisiDeepLearning || list[idx].deep_learning,
        tanggal_validasi: dateStr,
        validator_nama: kepsekNama,
        qr_token: `SMKN1SIDAYU-VAL-${jurnalId}-${status === 'Disetujui' ? 'VERIFIED' : 'REVISION'}`,
      };

      this.saveJurnalList(list);
      syncJurnalToFirebase(list[idx]).catch(() => {});
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  }

  // Batch Update Status / Validasi Semua Jurnal by Kepala Sekolah
  static batchUpdateJurnalValidasi(
    jurnalIds: string[],
    status: 'Disetujui' | 'Revisi',
    catatanSupervisi: string,
    kepsekNama: string,
    supervisiDeepLearning?: DeepLearningData
  ): { success: boolean; updatedCount: number; error?: string } {
    try {
      const list = this.getJurnalList();
      const idSet = new Set(jurnalIds);
      const updatedItems: JurnalPembelajaran[] = [];
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

      for (let i = 0; i < list.length; i++) {
        if (idSet.has(list[i].id)) {
          list[i] = {
            ...list[i],
            status,
            catatan_supervisi: catatanSupervisi || 'Pembelajaran telah disupervisi dan disetujui secara resmi oleh Kepala Sekolah.',
            supervisi_deep_learning: supervisiDeepLearning || list[i].supervisi_deep_learning,
            deep_learning: supervisiDeepLearning || list[i].deep_learning,
            tanggal_validasi: dateStr,
            validator_nama: kepsekNama,
            qr_token: `SMKN1SIDAYU-VAL-${list[i].id}-${status === 'Disetujui' ? 'VERIFIED' : 'REVISION'}`,
          };
          updatedItems.push(list[i]);
        }
      }

      this.saveJurnalList(list);
      if (updatedItems.length > 0) {
        syncJurnalsBatchToFirebase(updatedItems).catch(() => {});
      }
      return { success: true, updatedCount: updatedItems.length };
    } catch (e: any) {
      return { success: false, updatedCount: 0, error: e?.message };
    }
  }

  // Draft Management
  static saveDraft(userNip: string, contextKey: string, draftData: Partial<JurnalPembelajaran>): void {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${userNip}_${contextKey}`;
    const payload = {
      data: draftData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  static getDraft(userNip: string, contextKey: string): { data: Partial<JurnalPembelajaran>; savedAt: string } | null {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${userNip}_${contextKey}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clearDraft(userNip: string, contextKey: string): void {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${userNip}_${contextKey}`;
    localStorage.removeItem(key);
  }

  // Multi-sheet Excel (.xlsx) Exporter
  static exportToExcel(journals: JurnalPembelajaran[], config: AppConfig): void {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Rekap Jurnal
    const rekapJurnalData = journals.map((j, index) => ({
      No: index + 1,
      'ID Jurnal': j.id,
      Tanggal: j.tanggal,
      Guru: j.guru_nama,
      NIP: j.guru_nip,
      Kelas: j.kelas,
      Mapel: j.mapel,
      Materi: j.materi,
      'Mindful Learning': j.deep_learning.mindful,
      'Meaningful Learning': j.deep_learning.meaningful,
      'Joyful Learning': j.deep_learning.joyful,
      Ketercapaian: j.refleksi.ketercapaian,
      Kendala: j.refleksi.kendala,
      'Tindak Lanjut': j.refleksi.tindak_lanjut,
      Status: j.status,
      'Catatan Supervisi': j.catatan_supervisi || '-',
    }));
    const wsRekap = XLSX.utils.json_to_sheet(rekapJurnalData);
    XLSX.utils.book_append_sheet(wb, wsRekap, 'Sheet Rekap Jurnal');

    // 2. Sheet Kehadiran
    const kehadiranData = journals.map((j, index) => ({
      No: index + 1,
      'ID Jurnal': j.id,
      Tanggal: j.tanggal,
      Kelas: j.kelas,
      Mapel: j.mapel,
      'Siswa Hadir': j.kehadiran.hadir,
      Sakit: j.kehadiran.sakit,
      Izin: j.kehadiran.izin,
      Alpa: j.kehadiran.alpa,
      'Total Siswa': j.kehadiran.total,
      'Persentase Hadir (%)': j.kehadiran.total > 0 ? ((j.kehadiran.hadir / j.kehadiran.total) * 100).toFixed(1) + '%' : '0%',
      Keterangan: j.kehadiran.keterangan || '-',
    }));
    const wsKehadiran = XLSX.utils.json_to_sheet(kehadiranData);
    XLSX.utils.book_append_sheet(wb, wsKehadiran, 'Sheet Kehadiran');

    // 3. Sheet Validasi
    const validasiData = journals.map((j, index) => ({
      No: index + 1,
      'ID Jurnal': j.id,
      Tanggal: j.tanggal,
      Guru: j.guru_nama,
      Kelas: j.kelas,
      Status: j.status,
      'Tanggal Validasi': j.tanggal_validasi || '-',
      'Nama Validator': j.validator_nama || '-',
      'Catatan Supervisi': j.catatan_supervisi || '-',
      'Token QR Verifikasi': j.qr_token || '-',
    }));
    const wsValidasi = XLSX.utils.json_to_sheet(validasiData);
    XLSX.utils.book_append_sheet(wb, wsValidasi, 'Sheet Validasi');

    // 4. Sheet TP (Capaian & Tujuan Pembelajaran)
    const tpData = journals.map((j, index) => ({
      No: index + 1,
      'ID Jurnal': j.id,
      Kelas: j.kelas,
      Mapel: j.mapel,
      'Capaian Pembelajaran (CP)': j.cp,
      'Tujuan Pembelajaran (TP)': j.tp,
      'Alur Tujuan Pembelajaran (ATP)': j.atp,
    }));
    const wsTP = XLSX.utils.json_to_sheet(tpData);
    XLSX.utils.book_append_sheet(wb, wsTP, 'Sheet TP');

    // 5. Sheet Aktivitas
    const aktivitasData = journals.map((j, index) => ({
      No: index + 1,
      'ID Jurnal': j.id,
      Tanggal: j.tanggal,
      Kelas: j.kelas,
      Mapel: j.mapel,
      'Aktivitas Terlaksana': j.aktivitas.join(', '),
      'Jumlah Aktivitas': j.aktivitas.length,
      'Refleksi Guru': j.refleksi.narasi_refleksi,
      'Jumlah Dokumentasi': (j.dokumentasi || []).length,
    }));
    const wsAktivitas = XLSX.utils.json_to_sheet(aktivitasData);
    XLSX.utils.book_append_sheet(wb, wsAktivitas, 'Sheet Aktivitas');

    const fileName = `E-Jurnal_SMKN1SIDAYU_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  static resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(INITIAL_GURU));
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(INITIAL_KELAS));
    localStorage.setItem(STORAGE_KEYS.MAPEL, JSON.stringify(INITIAL_MAPEL));
    localStorage.setItem(STORAGE_KEYS.CP_TP, JSON.stringify(INITIAL_CP_TP));
    localStorage.setItem(STORAGE_KEYS.JADWAL, JSON.stringify(INITIAL_JADWAL));
    localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(INITIAL_JURNAL));
  }
}
