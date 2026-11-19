export type UserRole = 'guru' | 'kepsek' | 'admin';

export interface User {
  id: string;
  kode_guru?: number;
  username: string;
  password?: string;
  nama: string;
  gelar?: string;
  email: string;
  role: UserRole;
  nip: string;
  avatar?: string;
  mapel_diampu?: string[];
  jurusan?: string[];
}

export interface Guru {
  kode_guru: number;
  nip: string;
  nama: string;
  gelar?: string;
  email: string;
  mapel_diampu: string[];
  jurusan: string[];
}

export interface KelasItem {
  id: string;
  tingkat: 'X' | 'XI' | 'XII';
  jurusan: 'TKR' | 'TKJ' | 'APHPi' | 'TITL';
  nama: string;
  jumlah_siswa: number;
}

export interface MapelItem {
  kode: string;
  nama: string;
  kelompok?: 'Umum' | 'Kejuruan' | 'Bimbingan';
  jurusan?: string; // 'TKR' | 'TKJ' | 'APHPi' | 'TITL' | 'Semua'
  fase?: 'E' | 'F' | 'E/F';
}

export interface KurikulumCPTP {
  id: string;
  mapel_kode: string;
  fase: 'E' | 'F' | 'E/F';
  elemen: string;
  cp: string;
  tp: string;
  atp: string;
  materi_pokok?: string;
}

export interface JadwalMengajar {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  jam_ke: string; // e.g. "Jam 1-3 (07.00 - 09.15)"
  guru_nip: string;
  guru_nama: string;
  kelas: string;
  mapel_kode: string;
  mapel_nama: string;
  materi_pokok: string;
  cp: string;
  tp: string;
  atp: string;
}

export type DeepLearningLevel = 'Sangat Terlihat' | 'Terlihat' | 'Cukup' | 'Belum Terlihat';
export type KetercapaianRefleksi = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Tindak Lanjut';
export type StatusValidasi = 'Draft' | 'Menunggu Validasi' | 'Disetujui' | 'Revisi';

export interface KehadiranData {
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  total: number;
  keterangan?: string;
}

export interface DeepLearningData {
  mindful: DeepLearningLevel;
  meaningful: DeepLearningLevel;
  joyful: DeepLearningLevel;
}

export interface RefleksiData {
  ketercapaian: KetercapaianRefleksi;
  kendala: string;
  tindak_lanjut: string;
  catatan_guru: string;
  narasi_refleksi: string;
}

export interface JurnalPembelajaran {
  id: string; // e.g., "JRN-20261018-001"
  timestamp: string; // ISO string
  tanggal: string; // YYYY-MM-DD
  jadwal_id?: string;
  guru_nip: string;
  guru_nama: string;
  mapel: string;
  kelas: string;
  materi: string;
  cp: string;
  tp: string;
  atp: string;
  kehadiran: KehadiranData;
  aktivitas: string[];
  deep_learning: DeepLearningData;
  refleksi: RefleksiData;
  dokumentasi: string[]; // Base64 data URLs or Drive/Unsplash URLs (max 5)
  status: StatusValidasi;
  catatan_supervisi?: string;
  supervisi_deep_learning?: DeepLearningData;
  tanggal_validasi?: string;
  validator_nama?: string;
  qr_token: string;
  last_saved_by?: string;
}

export interface AppConfig {
  sekolah: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  logo_url: string; // Official SMKN 1 Sidayu emblem
  logo_jatim_url: string; // Official Jawa Timur provincial emblem
  qr_code_ttd_url: string; // Official QR Code barcode ttd
  gas_web_app_url?: string;
  spreadsheet_id?: string;
  lock_timeout_ms: number;
  tahun_ajaran?: string;
  semester?: string;
}
