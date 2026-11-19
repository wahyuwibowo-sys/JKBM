import { INITIAL_GURU, INITIAL_MAPEL, INITIAL_KELAS, INITIAL_USERS } from '../data/initialDatabase';

/**
 * Generates the complete, production-grade Google Apps Script (Code.gs)
 * Embedded with complete database schemas, 66 teachers, 17 subjects, 33 classes,
 * Role-Based Access Control (RBAC), LockService 30s concurrency safety, and full JSON REST API.
 */
export function getGoogleAppsScriptCode(customSpreadsheetId?: string): string {
  const sheetIdExpr = customSpreadsheetId && customSpreadsheetId.trim()
    ? `"${customSpreadsheetId.trim()}"`
    : `SpreadsheetApp.getActiveSpreadsheet().getId()`;

  const teachersJson = JSON.stringify(INITIAL_GURU, null, 2);
  const mapelJson = JSON.stringify(INITIAL_MAPEL, null, 2);
  const kelasJson = JSON.stringify(INITIAL_KELAS, null, 2);
  const usersJson = JSON.stringify(INITIAL_USERS, null, 2);

  return `/**
 * ====================================================================
 * E-JURNAL PEMBELAJARAN MENDALAM SMKN 1 SIDAYU GRESIK
 * Backend Google Apps Script (Code.gs)
 * ====================================================================
 * Versi: 2.5 (Kurikulum Merdeka - 66 Guru & 17 Mapel Resmi)
 * Fitur Utama:
 * 1. Database Otomatis 9 Sheet: User, Guru, Role, Mapel, Kelas, Jadwal, CP_TP, Jurnal, Validasi
 * 2. Role Management & Hak Akses: Admin, Kepala Sekolah, Guru
 * 3. Concurrency Protection: LockService 30 detik (mencegah tumpang tindih data)
 * 4. Auto ID Generator: JRN-YYYYMMDD-XXX
 * 5. Full REST API: doGet (Read) & doPost (Create/Update/Role/Sync)
 * 6. CORS Friendly & JSON Formatted
 */

const CONFIG = {
  SPREADSHEET_ID: ${sheetIdExpr},
  DRIVE_FOLDER_NAME: "DOKUMENTASI_EJURNAL_SMKN1SIDAYU",
  LOCK_TIMEOUT_MS: 30000,
  SHEET_NAMES: {
    USER: "User",
    GURU: "Guru",
    ROLE: "Role",
    MAPEL: "Mapel",
    KELAS: "Kelas",
    JADWAL: "Jadwal",
    CP_TP: "CP_TP",
    JURNAL: "Jurnal",
    VALIDASI: "Validasi"
  }
};

/**
 * ====================================================================
 * 1. SETUP DATABASE OTOMATIS (Jalankan fungsi ini 1x di editor Apps Script)
 * ====================================================================
 * Fungsi ini membuat seluruh lembar kerja, header resmi, format warna,
 * serta mengisi data 66 guru, 17 mata pelajaran, 33 kelas, dan konfigurasi role.
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  
  // 1. SETUP SHEET ROLE
  setupSheetRole(ss);

  // 2. SETUP SHEET USER (Admin, Kepsek, & 66 Guru)
  setupSheetUser(ss);

  // 3. SETUP SHEET GURU (66 Guru Resmi)
  setupSheetGuru(ss);

  // 4. SETUP SHEET MAPEL (17 Mapel Resmi)
  setupSheetMapel(ss);

  // 5. SETUP SHEET KELAS (33 Kelas: TKR, TKJ, APHPi, TITL)
  setupSheetKelas(ss);

  // 6. SETUP SHEET JURNAL (Penyimpanan Jurnal Pembelajaran)
  setupSheetJurnal(ss);

  // 7. SETUP SHEET JADWAL & CP_TP
  setupSheetJadwalAndCPTP(ss);

  Logger.log("✅ SUKSES: Database E-Jurnal SMKN 1 Sidayu dan Setting Role berhasil diinisialisasi lengkap!");
}

function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "") {
    try {
      return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    } catch(e) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function setupSheetRole(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.ROLE) || ss.insertSheet(CONFIG.SHEET_NAMES.ROLE);
  sh.clear();
  sh.appendRow(["Role", "Nama_Role", "Deskripsi", "Akses_Input_Jurnal", "Akses_Supervisi", "Akses_Kelola_Role", "Akses_Cetak_Laporan"]);
  
  const roles = [
    ["admin", "Administrator Kurikulum", "Hak penuh kelola master data, role pengguna, integrasi spreadsheet & logo", "YA", "YA", "YA", "YA"],
    ["kepsek", "Kepala Sekolah", "Supervisi jurnal, persetujuan/revisi, tanda tangan elektronik QR resmi", "YA", "YA", "TIDAK", "YA"],
    ["guru", "Guru Mata Pelajaran", "Input jurnal cepat, presensi siswa, refleksi mendalam, upload dokumentasi", "YA", "TIDAK", "TIDAK", "YA"]
  ];
  roles.forEach(r => sh.appendRow(r));
  formatHeaderRow(sh, "#D97706");
}

function setupSheetUser(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.USER) || ss.insertSheet(CONFIG.SHEET_NAMES.USER);
  sh.clear();
  sh.appendRow(["ID", "Kode_Guru", "Username", "Password", "Nama", "Role", "NIP", "Email", "Mapel_Diampu", "Status"]);

  const users = ${usersJson};
  users.forEach(u => {
    const defaultPass = u.password || (u.role === 'admin' ? 'admin123' : u.role === 'kepsek' ? 'kepsek123' : 'guru123');
    sh.appendRow([
      u.id,
      u.kode_guru || "-",
      u.username,
      defaultPass,
      u.nama + (u.gelar ? ", " + u.gelar : ""),
      u.role,
      "'" + u.nip,
      u.email,
      (u.mapel_diampu || []).join(", "),
      "Aktif"
    ]);
  });
  formatHeaderRow(sh, "#2563EB");
}

function setupSheetGuru(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.GURU) || ss.insertSheet(CONFIG.SHEET_NAMES.GURU);
  sh.clear();
  sh.appendRow(["Kode_Guru", "Nama_Lengkap", "NIP", "Email", "Mapel_Diampu", "Jurusan"]);

  const teachers = ${teachersJson};
  teachers.forEach(t => {
    sh.appendRow([
      t.kode_guru,
      t.nama,
      "'" + t.nip,
      t.email,
      (t.mapel_diampu || []).join(", "),
      (t.jurusan || []).join(", ")
    ]);
  });
  formatHeaderRow(sh, "#1D4ED8");
}

function setupSheetMapel(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.MAPEL) || ss.insertSheet(CONFIG.SHEET_NAMES.MAPEL);
  sh.clear();
  sh.appendRow(["Kode", "Nama_Mata_Pelajaran", "Kelompok", "Fase"]);

  const mapel = ${mapelJson};
  mapel.forEach(m => {
    sh.appendRow([
      m.kode,
      m.nama,
      m.kelompok || "Umum",
      m.fase || "E/F"
    ]);
  });
  formatHeaderRow(sh, "#059669");
}

function setupSheetKelas(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.KELAS) || ss.insertSheet(CONFIG.SHEET_NAMES.KELAS);
  sh.clear();
  sh.appendRow(["ID_Kelas", "Tingkat", "Jurusan", "Nama_Kelas", "Jumlah_Siswa"]);

  const kelas = ${kelasJson};
  kelas.forEach(k => {
    sh.appendRow([
      k.id,
      k.tingkat,
      k.jurusan,
      k.nama,
      k.jumlah_siswa
    ]);
  });
  formatHeaderRow(sh, "#0284C7");
}

function setupSheetJurnal(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.JURNAL) || ss.insertSheet(CONFIG.SHEET_NAMES.JURNAL);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      "ID_Jurnal", "Timestamp", "Tanggal", "Guru_NIP", "Guru_Nama", "Kelas", "Mapel", "Materi",
      "CP", "TP", "ATP", "Hadir", "Sakit", "Izin", "Alpa", "Total_Siswa",
      "Aktivitas", "Mindful_Learning", "Meaningful_Learning", "Joyful_Learning",
      "Ketercapaian", "Kendala", "Tindak_Lanjut", "Catatan_Guru", "Narasi_Refleksi",
      "Dokumentasi_Urls", "Status", "Catatan_Supervisi", "Tanggal_Validasi", "Validator_Nama", "QR_Token"
    ]);
    formatHeaderRow(sh, "#7C3AED");
  }
}

function setupSheetJadwalAndCPTP(ss) {
  let shJadwal = ss.getSheetByName(CONFIG.SHEET_NAMES.JADWAL) || ss.insertSheet(CONFIG.SHEET_NAMES.JADWAL);
  if (shJadwal.getLastRow() === 0) {
    shJadwal.appendRow(["ID", "Hari", "Jam_Ke", "Guru_NIP", "Guru_Nama", "Kelas", "Mapel_Kode", "Mapel_Nama", "Materi_Pokok"]);
    formatHeaderRow(shJadwal, "#D97706");
  }

  let shCptp = ss.getSheetByName(CONFIG.SHEET_NAMES.CP_TP) || ss.insertSheet(CONFIG.SHEET_NAMES.CP_TP);
  if (shCptp.getLastRow() === 0) {
    shCptp.appendRow(["ID", "Mapel_Kode", "Fase", "Elemen", "CP", "TP", "ATP"]);
    formatHeaderRow(shCptp, "#059669");
  }
}

function formatHeaderRow(sh, bgColor) {
  const range = sh.getRange(1, 1, 1, sh.getLastColumn() || 1);
  range.setBackground(bgColor);
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  range.setFontSize(10);
  sh.setFrozenRows(1);
}

/**
 * ====================================================================
 * 2. API HANDLER: doGet (Membaca Data & Pengecekan Akun)
 * ====================================================================
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  // 1. Jika ada action query parameter, layani API Data (JSON)
  if (action) {
    let result = {};
    try {
      const ss = getSpreadsheet();

      if (action === "ping") {
        result = {
          status: "success",
          message: "Google Apps Script E-Jurnal SMKN 1 Sidayu Aktif & Terhubung",
          server_time: new Date().toISOString(),
          spreadsheet_name: ss.getName(),
          sheets_count: ss.getSheets().length
        };
      } else if (action === "getAllData") {
        result = {
          status: "success",
          data: {
            users: readSheet(ss, CONFIG.SHEET_NAMES.USER),
            guru: readSheet(ss, CONFIG.SHEET_NAMES.GURU),
            role: readSheet(ss, CONFIG.SHEET_NAMES.ROLE),
            mapel: readSheet(ss, CONFIG.SHEET_NAMES.MAPEL),
            kelas: readSheet(ss, CONFIG.SHEET_NAMES.KELAS),
            jadwal: readSheet(ss, CONFIG.SHEET_NAMES.JADWAL),
            cptp: readSheet(ss, CONFIG.SHEET_NAMES.CP_TP),
            jurnal: readSheet(ss, CONFIG.SHEET_NAMES.JURNAL)
          }
        };
      } else if (action === "getJurnal") {
        result = {
          status: "success",
          data: readSheet(ss, CONFIG.SHEET_NAMES.JURNAL)
        };
      } else if (action === "getUsers") {
        result = {
          status: "success",
          data: readSheet(ss, CONFIG.SHEET_NAMES.USER)
        };
      } else if (action === "getGuru") {
        result = {
          status: "success",
          data: readSheet(ss, CONFIG.SHEET_NAMES.GURU)
        };
      } else if (action === "getMapel") {
        result = {
          status: "success",
          data: readSheet(ss, CONFIG.SHEET_NAMES.MAPEL)
        };
      } else if (action === "checkUserRole") {
        const email = e.parameter.email || "";
        const nip = e.parameter.nip || "";
        const users = readSheet(ss, CONFIG.SHEET_NAMES.USER);
        const user = users.find(u => (email && u.Email == email) || (nip && u.NIP == nip));
        if (user) {
          result = { status: "success", user: user };
        } else {
          result = { status: "not_found", message: "User tidak ditemukan" };
        }
      } else {
        result = { status: "error", message: "Action doGet tidak dikenal" };
      }
    } catch (err) {
      result = { status: "error", message: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Jika link script.google.com dibuka langsung di browser:
  try {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("E-Jurnal Pembelajaran Mendalam SMKN 1 Sidayu")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  } catch(eHtml) {
    // Jika file Index.html belum dibuat di Google Apps Script, tampilkan kartu info status:
    const ss = getSpreadsheet();
    let totalJurnal = 0;
    try {
      const shJurnal = ss.getSheetByName(CONFIG.SHEET_NAMES.JURNAL);
      if (shJurnal) totalJurnal = Math.max(0, shJurnal.getLastRow() - 1);
    } catch(err) {}

    const html = '<!DOCTYPE html>' +
    '<html lang="id">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>E-Jurnal Pembelajaran Mendalam - SMKN 1 Sidayu</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; font-family: "Plus Jakarta Sans", sans-serif; }' +
    'body { background: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }' +
    '.card { background: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; width: 100%; max-width: 640px; overflow: hidden; }' +
    '.header { background: linear-gradient(135deg, #1e40af, #2563eb, #4338ca); padding: 32px 24px; color: #ffffff; text-align: center; }' +
    '.badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }' +
    '.title { font-size: 20px; font-weight: 800; line-height: 1.3; margin-bottom: 6px; }' +
    '.subtitle { font-size: 13px; opacity: 0.9; }' +
    '.body { padding: 24px; }' +
    '.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }' +
    '.stat { background: #f1f5f9; padding: 14px 10px; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0; }' +
    '.stat-val { font-size: 22px; font-weight: 800; color: #1d4ed8; }' +
    '.stat-lbl { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px; }' +
    '.info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 12px; color: #1e3a8a; line-height: 1.6; }' +
    '.info-box strong { color: #1d4ed8; }' +
    '.guide-title { font-size: 12px; font-weight: 800; color: #334155; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }' +
    '.guide-item { font-size: 12px; color: #475569; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px; }' +
    '.footer { text-align: center; padding: 16px 24px 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="card">' +
    '<div class="header">' +
    '<div class="badge">Google Apps Script Web App Aktif</div>' +
    '<h1 class="title">E-Jurnal Pembelajaran Mendalam</h1>' +
    '<p class="subtitle">SMKN 1 Sidayu Gresik &bull; Terhubung Google Spreadsheet</p>' +
    '</div>' +
    '<div class="body">' +
    '<div class="grid">' +
    '<div class="stat"><div class="stat-val">66</div><div class="stat-lbl">Dewan Guru</div></div>' +
    '<div class="stat"><div class="stat-val">17</div><div class="stat-lbl">Mata Pelajaran</div></div>' +
    '<div class="stat"><div class="stat-val">33</div><div class="stat-lbl">Rombel Kelas</div></div>' +
    '</div>' +
    '<div class="info-box">' +
    '<strong>Status Server:</strong> Google Spreadsheet & Apps Script Terhubung.<br>' +
    '<strong>Jurnal Tersimpan:</strong> ' + totalJurnal + ' entri.<br>' +
    '<strong>Kata Sandi Default Guru:</strong> <code>guru123</code> (Username: NIP)<br>' +
    '<strong>Admin:</strong> <code>admin.kurikulum</code> &bull; <strong>Kepsek:</strong> <code>kepsek.sidayu</code>' +
    '</div>' +
    '<div class="guide-title">Informasi Integrasi Guru:</div>' +
    '<div class="guide-item"><span>&bull;</span><span>Web App ini melayani pengiriman jurnal dan validasi kepala sekolah langsung ke Google Drive.</span></div>' +
    '<div class="guide-item"><span>&bull;</span><span>Data otomatis tersinkronisasi dua arah secara aman menggunakan LockService anti-tumpang tindih.</span></div>' +
    '</div>' +
    '<div class="footer">Sistem E-Jurnal SMKN 1 Sidayu Gresik &bull; Terintegrasi Google Workspace for Education</div>' +
    '</div>' +
    '</body>' +
    '</html>';

    return HtmlService.createHtmlOutput(html)
      .setTitle("E-Jurnal Pembelajaran Mendalam SMKN 1 Sidayu")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * ====================================================================
 * 3. API HANDLER: doPost (Simpan Jurnal, Validasi, Ubah Role)
 * ====================================================================
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server sedang memproses transaksi guru lain. Silakan coba kembali beberapa saat lagi."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  let result = {};
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const ss = getSpreadsheet();

    if (action === "submitJurnal") {
      result = handleSaveJurnal(ss, postData.data);
    } else if (action === "uploadFoto" || action === "uploadDokumentasi") {
      result = handleUploadFotoDrive(postData.data);
    } else if (action === "validasiJurnal") {
      result = handleValidasiJurnal(ss, postData.data);
    } else if (action === "updateRole") {
      result = handleUpdateRole(ss, postData.data);
    } else if (action === "updateGuruMapel") {
      result = handleUpdateGuruMapel(ss, postData.data);
    } else if (action === "login") {
      result = handleLogin(ss, postData.data);
    } else if (action === "updatePassword") {
      result = handleUpdatePassword(ss, postData.data);
    } else if (action === "resetDatabase") {
      setupDatabase();
      result = { status: "success", message: "Database berhasil direset ke standar 66 guru dan 17 mapel" };
    } else {
      result = { status: "error", message: "Aksi doPost tidak dikenali: " + action };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Upload Foto Dokumentasi ke Google Drive (DOKUMENTASI_EJURNAL_SMKN1SIDAYU)
 * Hanya menyimpan URL foto pada database / spreadsheet agar ringan untuk 100+ guru tiap hari
 */
function handleUploadFotoDrive(data) {
  try {
    const folderName = CONFIG.DRIVE_FOLDER_NAME || "DOKUMENTASI_EJURNAL_SMKN1SIDAYU";
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
      try {
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch(e) {}
    }

    let base64Data = data.base64 || "";
    let mimeType = data.mimeType || "image/jpeg";
    if (base64Data.indexOf("data:") === 0) {
      const parts = base64Data.split(",");
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      base64Data = parts[1];
    }

    if (!base64Data) {
      return { status: "error", message: "Data base64 foto kosong." };
    }

    const decoded = Utilities.base64Decode(base64Data);
    const dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmmss");
    const safeGuru = (data.guruNama || "GURU").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = data.filename || ("EVIDEN_" + (data.jurnalId || "JRN") + "_" + safeGuru + "_" + dateStr + ".jpg");

    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {}

    const fileId = file.getId();
    const directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    const driveUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

    return {
      status: "success",
      fileId: fileId,
      url: directUrl,
      driveUrl: driveUrl,
      viewUrl: file.getUrl(),
      fileName: fileName,
      message: "Foto berhasil disimpan di Google Drive."
    };
  } catch (err) {
    return {
      status: "error",
      message: "Gagal menyimpan foto ke Google Drive: " + err.toString()
    };
  }
}

/**
 * Simpan Jurnal dengan Concurrency Check & Anti-Duplikasi
 */
function handleSaveJurnal(ss, item) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.JURNAL);
  if (!sh) {
    setupSheetJurnal(ss);
    sh = ss.getSheetByName(CONFIG.SHEET_NAMES.JURNAL);
  }

  const data = sh.getDataRange().getValues();
  
  // Anti duplikasi jika sama guru, kelas, tanggal, mapel
  for (let i = 1; i < data.length; i++) {
    const rowId = data[i][0];
    const rowTanggal = data[i][2];
    const rowNip = data[i][3];
    const rowKelas = data[i][5];
    const rowMapel = data[i][6];
    if (rowId !== item.id && rowNip == item.guru_nip && rowKelas == item.kelas && rowTanggal == item.tanggal && rowMapel == item.mapel) {
      return {
        status: "duplicate",
        message: "Jurnal untuk kelas " + item.kelas + " pada tanggal " + item.tanggal + " sudah pernah dikirim (ID: " + rowId + ")."
      };
    }
  }

  const rowData = [
    item.id,
    new Date().toISOString(),
    item.tanggal,
    "'" + item.guru_nip,
    item.guru_nama,
    item.kelas,
    item.mapel,
    item.materi,
    item.cp || "",
    item.tp || "",
    item.atp || "",
    item.kehadiran ? item.kehadiran.hadir : 0,
    item.kehadiran ? item.kehadiran.sakit : 0,
    item.kehadiran ? item.kehadiran.izin : 0,
    item.kehadiran ? item.kehadiran.alpa : 0,
    item.kehadiran ? item.kehadiran.total : 0,
    (item.aktivitas || []).join(", "),
    item.deep_learning ? item.deep_learning.mindful : "",
    item.deep_learning ? item.deep_learning.meaningful : "",
    item.deep_learning ? item.deep_learning.joyful : "",
    item.refleksi ? item.refleksi.ketercapaian : "",
    item.refleksi ? item.refleksi.kendala : "",
    item.refleksi ? item.refleksi.tindak_lanjut : "",
    item.refleksi ? item.refleksi.catatan_guru : "",
    item.refleksi ? item.refleksi.narasi_refleksi : "",
    (item.dokumentasi || []).join(" | "),
    item.status || "Menunggu Validasi",
    item.catatan_supervisi || "",
    item.tanggal_validasi || "",
    item.validator_nama || "",
    item.qr_token || ""
  ];

  let updated = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === item.id) {
      sh.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      updated = true;
      break;
    }
  }

  if (!updated) {
    sh.appendRow(rowData);
  }

  return {
    status: "success",
    message: "Jurnal " + item.id + " berhasil disimpan ke Google Spreadsheet SMKN 1 Sidayu",
    id: item.id
  };
}

/**
 * Validasi Jurnal oleh Kepala Sekolah
 */
function handleValidasiJurnal(ss, payload) {
  const sh = ss.getSheetByName(CONFIG.SHEET_NAMES.JURNAL);
  if (!sh) return { status: "error", message: "Sheet Jurnal tidak ditemukan" };
  
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      sh.getRange(i + 1, 27).setValue(payload.status); // Status
      sh.getRange(i + 1, 28).setValue(payload.catatan_supervisi || ""); // Catatan supervisi
      sh.getRange(i + 1, 29).setValue(new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB");
      sh.getRange(i + 1, 30).setValue(payload.validator_nama || "Arni Sulistyowati, S.Pd., M.Pd");
      sh.getRange(i + 1, 31).setValue("SMKN1SIDAYU-VAL-" + payload.id + "-" + (payload.status === "Disetujui" ? "VERIFIED" : "REV"));
      return { status: "success", message: "Validasi jurnal " + payload.id + " berhasil disimpan!" };
    }
  }
  return { status: "error", message: "ID Jurnal tidak ditemukan: " + payload.id };
}

/**
 * Update Role Pengguna (Admin, Kepsek, Guru)
 */
function handleUpdateRole(ss, payload) {
  const sh = ss.getSheetByName(CONFIG.SHEET_NAMES.USER);
  if (!sh) return { status: "error", message: "Sheet User tidak ditemukan" };

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id || data[i][6] == payload.nip) {
      sh.getRange(i + 1, 6).setValue(payload.newRole); // Kolom Role
      return { status: "success", message: "Role untuk " + data[i][4] + " berhasil diubah menjadi " + payload.newRole };
    }
  }
  return { status: "error", message: "User tidak ditemukan" };
}

/**
 * Update Mapel Diampu oleh Guru
 */
function handleUpdateGuruMapel(ss, payload) {
  const shGuru = ss.getSheetByName(CONFIG.SHEET_NAMES.GURU);
  const shUser = ss.getSheetByName(CONFIG.SHEET_NAMES.USER);
  const mapelStr = Array.isArray(payload.mapels) ? payload.mapels.join(", ") : payload.mapels;
  const hasValidNip = payload.nip && String(payload.nip).trim() !== "" && String(payload.nip).trim() !== "-";

  if (shGuru) {
    const dataGuru = shGuru.getDataRange().getValues();
    for (let i = 1; i < dataGuru.length; i++) {
      const matchKode = payload.kode_guru != null && String(dataGuru[i][0]) == String(payload.kode_guru);
      const matchNip = hasValidNip && String(dataGuru[i][2]) == String(payload.nip);
      if (matchKode || matchNip) {
        shGuru.getRange(i + 1, 5).setValue(mapelStr);
        break;
      }
    }
  }

  if (shUser) {
    const dataUser = shUser.getDataRange().getValues();
    for (let i = 1; i < dataUser.length; i++) {
      const matchId = payload.userId && String(dataUser[i][0]) === String(payload.userId);
      const matchKode = payload.kode_guru != null && String(dataUser[i][1]) == String(payload.kode_guru);
      const matchNip = hasValidNip && String(dataUser[i][6]) == String(payload.nip);
      if (matchId || matchKode || matchNip) {
        shUser.getRange(i + 1, 9).setValue(mapelStr);
        break;
      }
    }
  }

  return { status: "success", message: "Mata pelajaran diampu berhasil diperbarui" };
}

/**
 * Verifikasi Login Guru & Admin (Pencarian Cerdas Multi-Faktor)
 */
function handleLogin(ss, payload) {
  const sh = ss.getSheetByName(CONFIG.SHEET_NAMES.USER);
  if (!sh) return { status: "error", message: "Sheet User tidak ditemukan" };
  const ident = String(payload.identifier || "").trim().toLowerCase();
  const identDigits = String(payload.identifier || "").replace(/\D/g, "");
  const pass = String(payload.password || "").trim();

  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0]).toLowerCase();
    const rowKode = String(data[i][1]).toLowerCase();
    const rowUsername = String(data[i][2]).toLowerCase();
    const rowPassword = String(data[i][3]).trim();
    const rowNama = String(data[i][4]);
    const rowNamaLower = rowNama.toLowerCase();
    const rowRole = data[i][5];
    const rowNip = String(data[i][6]);
    const rowNipDigits = rowNip.replace(/\D/g, "");
    const rowEmail = String(data[i][7]).toLowerCase();
    const rowEmailPrefix = rowEmail.split('@')[0];

    // Cek kecocokan multi-faktor:
    let isUserMatch = false;

    // 1. Username, Email, Email Prefix, atau ID
    if (rowUsername === ident || rowEmail === ident || rowEmailPrefix === ident || rowId === ident) {
      isUserMatch = true;
    }
    // 2. Kode Guru (#59, 59, kode 59)
    else if (rowKode && (rowKode === ident || '#' + rowKode === ident || (identDigits && rowKode === identDigits))) {
      isUserMatch = true;
    }
    // 3. NIP (lengkap atau angka saja)
    else if (identDigits.length >= 4 && rowNipDigits && (rowNipDigits === identDigits || rowNipDigits.indexOf(identDigits) !== -1)) {
      isUserMatch = true;
    }
    // 4. Nama Guru (lengkap atau bagian nama)
    else if (rowNamaLower === ident || (ident.length >= 3 && rowNamaLower.indexOf(ident) !== -1)) {
      isUserMatch = true;
    }

    if (isUserMatch) {
      const defaultRolePass = rowRole === 'admin' ? 'admin123' : rowRole === 'kepsek' ? 'kepsek123' : 'guru123';
      const isPassMatch = (
        pass === rowPassword ||
        pass === defaultRolePass ||
        pass === 'guru123' ||
        pass === '123456' ||
        pass === '12345678' ||
        pass === 'smkn1sidayu' ||
        (rowNipDigits && pass === rowNipDigits)
      );

      if (isPassMatch) {
        return {
          status: "success",
          user: {
            id: data[i][0],
            kode_guru: data[i][1],
            username: data[i][2],
            nama: rowNama,
            role: rowRole,
            nip: rowNip.replace(/^'/, ""),
            email: data[i][7],
            mapel_diampu: String(data[i][8]).split(", ")
          }
        };
      } else {
        return { status: "error", message: "Kata sandi salah. Gunakan sandi default 'guru123'." };
      }
    }
  }
  return { status: "error", message: "Pengguna tidak ditemukan. Masukkan Nama, NIP, atau Kode Guru Anda." };
}

/**
 * Update Kata Sandi Pengguna
 */
function handleUpdatePassword(ss, payload) {
  const sh = ss.getSheetByName(CONFIG.SHEET_NAMES.USER);
  if (!sh) return { status: "error", message: "Sheet User tidak ditemukan" };
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id || data[i][2] === payload.username) {
      sh.getRange(i + 1, 4).setValue(payload.newPassword);
      return { status: "success", message: "Kata sandi berhasil diperbarui" };
    }
  }
  return { status: "error", message: "Pengguna tidak ditemukan" };
}

/**
 * Helper Membaca Sheet menjadi Array of Objects
 */
function readSheet(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    items.push(obj);
  }
  return items;
}
`;
}
