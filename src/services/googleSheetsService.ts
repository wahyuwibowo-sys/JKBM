import { JurnalPembelajaran, User, Guru, KelasItem, MapelItem, JadwalMengajar } from '../types';

export class GoogleSheetsService {
  static async createDatabaseSpreadsheet(
    accessToken: string,
    title: string = 'E-JURNAL PEMBELAJARAN MENDALAM SMKN 1 SIDAYU'
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const payload = {
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Jurnal' } },
        { properties: { title: 'User' } },
        { properties: { title: 'Guru' } },
        { properties: { title: 'Role' } },
        { properties: { title: 'Mapel' } },
        { properties: { title: 'Kelas' } },
        { properties: { title: 'Jadwal' } },
        { properties: { title: 'Validasi' } },
      ],
    };

    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat Google Spreadsheet (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    };
  }

  static async populateAllSheets(
    spreadsheetId: string,
    data: {
      journals: JurnalPembelajaran[];
      users: User[];
      teachers: Guru[];
      kelasList: KelasItem[];
      mapelList: MapelItem[];
      jadwalList: JadwalMengajar[];
    },
    accessToken: string
  ): Promise<void> {
    const journalRows = [
      [
        'ID_Jurnal',
        'Timestamp',
        'Tanggal',
        'Guru_NIP',
        'Guru_Nama',
        'Kelas',
        'Mapel',
        'Materi',
        'CP',
        'TP',
        'ATP',
        'Hadir',
        'Sakit',
        'Izin',
        'Alpa',
        'Total_Siswa',
        'Aktivitas',
        'Mindful_Learning',
        'Meaningful_Learning',
        'Joyful_Learning',
        'Ketercapaian',
        'Kendala',
        'Tindak_Lanjut',
        'Catatan_Guru',
        'Narasi_Refleksi',
        'Dokumentasi_Urls',
        'Status',
        'Catatan_Supervisi',
        'Tanggal_Validasi',
        'Validator_Nama',
        'QR_Token',
      ],
      ...data.journals.map((j) => [
        j.id,
        j.timestamp,
        j.tanggal,
        j.guru_nip,
        j.guru_nama,
        j.kelas,
        j.mapel,
        j.materi,
        j.cp,
        j.tp,
        j.atp,
        j.kehadiran.hadir,
        j.kehadiran.sakit,
        j.kehadiran.izin,
        j.kehadiran.alpa,
        j.kehadiran.total,
        (j.aktivitas || []).join(', '),
        j.deep_learning.mindful,
        j.deep_learning.meaningful,
        j.deep_learning.joyful,
        j.refleksi.ketercapaian,
        j.refleksi.kendala,
        j.refleksi.tindak_lanjut,
        j.refleksi.catatan_guru,
        j.refleksi.narasi_refleksi,
        (j.dokumentasi || []).join(' | '),
        j.status,
        j.catatan_supervisi || '',
        j.tanggal_validasi || '',
        j.validator_nama || '',
        j.qr_token || '',
      ]),
    ];

    const userRows = [
      ['ID', 'Kode_Guru', 'Username', 'Nama', 'Role', 'NIP', 'Email', 'Mapel_Diampu'],
      ...data.users.map((u) => [
        u.id,
        u.kode_guru || '',
        u.username,
        u.nama,
        u.role,
        u.nip,
        u.email,
        (u.mapel_diampu || []).join(', '),
      ]),
    ];

    const guruRows = [
      ['Kode_Guru', 'Nama', 'NIP', 'Email', 'Mapel_Diampu', 'Jurusan'],
      ...data.teachers.map((g) => [
        g.kode_guru,
        g.nama,
        g.nip,
        g.email,
        (g.mapel_diampu || []).join(', '),
        (g.jurusan || []).join(', '),
      ]),
    ];

    const roleRows = [
      ['Role', 'Deskripsi'],
      ['guru', 'Guru Mata Pelajaran (Input Jurnal, Presensi, Refleksi, Dokumentasi)'],
      ['kepsek', 'Kepala Sekolah (Supervisi, Validasi, Tanda Tangan QR, Rekap Laporan)'],
      ['admin', 'Administrator (Kelola Master Data, Kelola Role & Pengguna, Logo & QR, Database Spreadsheet, Apps Script)'],
    ];

    const mapelRows = [
      ['Kode', 'Nama', 'Kelompok', 'Fase'],
      ...data.mapelList.map((m) => [m.kode, m.nama, m.kelompok || 'Umum', m.fase || 'E/F']),
    ];

    const kelasRows = [
      ['ID', 'Tingkat', 'Jurusan', 'Nama_Kelas', 'Jumlah_Siswa'],
      ...data.kelasList.map((k) => [k.id, k.tingkat, k.jurusan, k.nama, k.jumlah_siswa]),
    ];

    const jadwalRows = [
      ['ID', 'Hari', 'Jam_Ke', 'Guru_NIP', 'Guru_Nama', 'Kelas', 'Mapel_Kode', 'Mapel_Nama', 'Materi_Pokok', 'CP', 'TP', 'ATP'],
      ...data.jadwalList.map((j) => [
        j.id,
        j.hari,
        j.jam_ke,
        j.guru_nip,
        j.guru_nama,
        j.kelas,
        j.mapel_kode,
        j.mapel_nama,
        j.materi_pokok,
        j.cp,
        j.tp,
        j.atp,
      ]),
    ];

    const validasiRows = [
      ['ID_Jurnal', 'Tanggal', 'Guru_Nama', 'Kelas', 'Mapel', 'Status', 'Catatan_Supervisi', 'Tanggal_Validasi', 'Validator_Nama', 'QR_Token'],
      ...data.journals.map((j) => [
        j.id,
        j.tanggal,
        j.guru_nama,
        j.kelas,
        j.mapel,
        j.status,
        j.catatan_supervisi || '',
        j.tanggal_validasi || '',
        j.validator_nama || '',
        j.qr_token || '',
      ]),
    ];

    const updatePayload = {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'Jurnal!A1', values: journalRows },
        { range: 'User!A1', values: userRows },
        { range: 'Guru!A1', values: guruRows },
        { range: 'Role!A1', values: roleRows },
        { range: 'Mapel!A1', values: mapelRows },
        { range: 'Kelas!A1', values: kelasRows },
        { range: 'Jadwal!A1', values: jadwalRows },
        { range: 'Validasi!A1', values: validasiRows },
      ],
    };

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menyinkronkan data ke Google Sheets (HTTP ${res.status})`);
    }
  }

  static async appendJournalToSheet(
    spreadsheetId: string,
    journal: JurnalPembelajaran,
    accessToken: string
  ): Promise<void> {
    const row = [
      journal.id,
      journal.timestamp,
      journal.tanggal,
      journal.guru_nip,
      journal.guru_nama,
      journal.kelas,
      journal.mapel,
      journal.materi,
      journal.cp,
      journal.tp,
      journal.atp,
      journal.kehadiran.hadir,
      journal.kehadiran.sakit,
      journal.kehadiran.izin,
      journal.kehadiran.alpa,
      journal.kehadiran.total,
      (journal.aktivitas || []).join(', '),
      journal.deep_learning.mindful,
      journal.deep_learning.meaningful,
      journal.deep_learning.joyful,
      journal.refleksi.ketercapaian,
      journal.refleksi.kendala,
      journal.refleksi.tindak_lanjut,
      journal.refleksi.catatan_guru,
      journal.refleksi.narasi_refleksi,
      (journal.dokumentasi || []).join(' | '),
      journal.status,
      journal.catatan_supervisi || '',
      journal.tanggal_validasi || '',
      journal.validator_nama || '',
      journal.qr_token || '',
    ];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Jurnal!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menambahkan jurnal ke Google Sheets (HTTP ${res.status})`);
    }
  }

  static async readRange(
    spreadsheetId: string,
    range: string,
    accessToken: string
  ): Promise<any[][]> {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membaca Google Sheets (HTTP ${res.status})`);
    }

    const data = await res.json();
    return data.values || [];
  }
}
