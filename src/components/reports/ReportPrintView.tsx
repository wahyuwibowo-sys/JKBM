import React, { useState } from 'react';
import { JurnalPembelajaran, Guru, KelasItem, MapelItem, AppConfig, User } from '../../types';
import { StorageService } from '../../services/storageService';
import { OfficialQRCode } from '../common/OfficialQRCode';
import { VerificationModal } from '../verification/VerificationModal';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  ArrowLeftRight,
  Camera,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_LOGO_SIDAYU, DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';
import { formatNip } from '../../utils/nipFormatter';
import { formatTanggalDMY, getNamaBulan } from '../../utils/dateFormatter';
import { ResolvedPhotoImg } from '../common/ResolvedPhotoImg';

interface ReportPrintViewProps {
  journals: JurnalPembelajaran[];
  teachers: Guru[];
  kelasList: KelasItem[];
  mapelList: MapelItem[];
  config: AppConfig;
  currentUser?: User;
}

/**
 * Memformat teks TP (Tujuan Pembelajaran) jika terdapat penomoran 1. ... 2. ... 3. ...
 * menjadi list baris bernomor rapi ke bawah (1. ..., 2. ..., 3. ...).
 */
export function parseTpItems(tpText?: string | null): string[] {
  if (!tpText) return [];
  const clean = tpText.trim();
  if (!clean) return [];

  // Jika sudah terpisah baris baru (newline)
  if (clean.includes('\n')) {
    const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) return lines;
  }

  // Jika formatnya satu baris berurutan: "1. Menerapkan ... 2. Mengevaluasi ... 3. Menerapkan ..."
  // Regex mencari pola nomor seperti " 1. ", " 2. ", " 3. ", dsb.
  const regex = /(?:^|\s+)(\d+[\.\)])\s+/g;
  const matches = Array.from(clean.matchAll(regex));

  if (matches.length >= 2) {
    const items: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const startIdx = matches[i].index! + matches[i][0].length;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index! : clean.length;
      const numLabel = matches[i][1].replace(')', '.');
      const text = clean.substring(startIdx, endIdx).trim();
      items.push(`${numLabel} ${text}`);
    }
    return items;
  }

  return [clean];
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({
  journals,
  teachers,
  kelasList,
  mapelList,
  config,
  currentUser,
}) => {
  // Filters
  const isGuruRole = currentUser?.role === 'guru';
  const [filterGuru, setFilterGuru] = useState<string>(
    isGuruRole ? (currentUser?.nip || currentUser?.nama || 'SEMUA') : 'SEMUA'
  );
  const [filterMapel, setFilterMapel] = useState<string>('SEMUA');
  const [filterKelas, setFilterKelas] = useState<string>('SEMUA');
  const [filterBulan, setFilterBulan] = useState<string>('10');
  const [filterSemester, setFilterSemester] = useState<string>('Ganjil');
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [verificationJournal, setVerificationJournal] = useState<JurnalPembelajaran | null>(null);
  const [positionMode, setPositionMode] = useState<'kepsek-left' | 'guru-left'>('kepsek-left');

  // Print Mode: 'rekap-lengkap' (Rekap + Lampiran Dokumentasi) | 'per-pertemuan' (Lembar Jurnal Detail)
  const [printLayoutMode, setPrintLayoutMode] = useState<'rekap-lengkap' | 'per-pertemuan'>('rekap-lengkap');
  const [selectedSingleJournalId, setSelectedSingleJournalId] = useState<string>('ALL');
  const [includePhotosInPrint, setIncludePhotosInPrint] = useState<boolean>(true);
  const [photoSize, setPhotoSize] = useState<'compact' | 'normal' | 'large'>('compact');
  const [paperSize, setPaperSize] = useState<'F4' | 'A4'>('F4');

  // Filter application - Strictly isolate journals for teachers
  const filteredJournals = journals.filter((j) => {
    const matchGuru = isGuruRole
      ? (j.guru_nip === currentUser?.nip || j.guru_nama.includes(currentUser?.nama || ''))
      : (filterGuru === 'SEMUA' || j.guru_nip === filterGuru || j.guru_nama.includes(filterGuru));
    const matchMapel = filterMapel === 'SEMUA' || j.mapel === filterMapel;
    const matchKelas = filterKelas === 'SEMUA' || j.kelas === filterKelas;
    let matchMonth = true;
    if (filterBulan !== 'SEMUA') {
      const jMonth = j.tanggal ? j.tanggal.split('-')[1] : '';
      matchMonth = jMonth === filterBulan;
    }
    return matchGuru && matchMapel && matchKelas && matchMonth;
  });

  // Journals with documentation photos
  const journalsWithPhotos = filteredJournals.filter(
    (j) => j.dokumentasi && j.dokumentasi.length > 0
  );
  const totalPhotosCount = journalsWithPhotos.reduce(
    (acc, j) => acc + (j.dokumentasi?.length || 0),
    0
  );

  // Attendance aggregates
  const totalStudents = filteredJournals.reduce((acc, curr) => acc + (curr.kehadiran.total || 0), 0);
  const totalHadir = filteredJournals.reduce((acc, curr) => acc + (curr.kehadiran.hadir || 0), 0);
  const totalSakit = filteredJournals.reduce((acc, curr) => acc + (curr.kehadiran.sakit || 0), 0);
  const totalIzin = filteredJournals.reduce((acc, curr) => acc + (curr.kehadiran.izin || 0), 0);
  const totalAlpa = filteredJournals.reduce((acc, curr) => acc + (curr.kehadiran.alpa || 0), 0);
  const attendanceRate = totalStudents > 0 ? ((totalHadir / totalStudents) * 100).toFixed(1) : '100';

  // Deep Learning aggregates
  const dlMindful = filteredJournals.filter(
    (j) => j.deep_learning.mindful === 'Sangat Terlihat' || j.deep_learning.mindful === 'Terlihat'
  ).length;
  const dlMeaningful = filteredJournals.filter(
    (j) => j.deep_learning.meaningful === 'Sangat Terlihat' || j.deep_learning.meaningful === 'Terlihat'
  ).length;
  const dlJoyful = filteredJournals.filter(
    (j) => j.deep_learning.joyful === 'Sangat Terlihat' || j.deep_learning.joyful === 'Terlihat'
  ).length;

  const selectedTeacherObj = teachers.find((t) => t.nip === filterGuru);
  const displayTeacherName = selectedTeacherObj
    ? (selectedTeacherObj.gelar ? `${selectedTeacherObj.nama}, ${selectedTeacherObj.gelar}` : selectedTeacherObj.nama)
    : currentUser && currentUser.role === 'guru'
    ? `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`
    : 'Ahmad Heru Wahyu Wibowo, S.Pd';

  // Journals to show in 'per-pertemuan' mode
  const singleModeJournals =
    selectedSingleJournalId === 'ALL'
      ? filteredJournals
      : filteredJournals.filter((j) => j.id === selectedSingleJournalId);

  // Generates PDF filename conforming to: ejurnal_waktu(tahun-bulan-tgl)_kelas_nama guru
  const generatePdfFileName = () => {
    let waktuStr = new Date().toISOString().slice(0, 10);
    let kelasStr = filterKelas !== 'SEMUA' ? filterKelas : 'Semua Kelas';
    let guruStr = selectedTeacherObj
      ? selectedTeacherObj.nama
      : (currentUser?.role === 'guru' ? currentUser.nama : 'Ahmad Heru Wahyu Wibowo');

    if (printLayoutMode === 'per-pertemuan') {
      if (singleModeJournals.length === 1 && singleModeJournals[0]) {
        const j = singleModeJournals[0];
        if (j.tanggal) waktuStr = j.tanggal;
        if (j.kelas) kelasStr = j.kelas;
        if (j.guru_nama) {
          guruStr = j.guru_nama.split(',')[0].trim();
        }
      } else if (filteredJournals.length > 0) {
        if (filterKelas !== 'SEMUA') {
          kelasStr = filterKelas;
        } else {
          const uniqueClasses = Array.from(new Set(filteredJournals.map((j) => j.kelas)));
          if (uniqueClasses.length === 1) kelasStr = uniqueClasses[0];
        }
      }
    } else {
      if (filterKelas !== 'SEMUA') {
        kelasStr = filterKelas;
      }
    }

    const cleanKelas = kelasStr.replace(/[\/\\?%*:|"<>]/g, '-').trim();
    const cleanGuru = guruStr.replace(/[\/\\?%*:|"<>]/g, '').trim();

    return `ejurnal_${waktuStr}_${cleanKelas}_${cleanGuru}`;
  };

  React.useEffect(() => {
    const origTitle = document.title;
    const pdfName = generatePdfFileName();
    document.title = pdfName;

    return () => {
      document.title = origTitle;
    };
  }, [
    printLayoutMode,
    filterKelas,
    filterGuru,
    filterBulan,
    selectedSingleJournalId,
    displayTeacherName,
    singleModeJournals,
  ]);

  const handlePrint = () => {
    const pdfName = generatePdfFileName();
    document.title = pdfName;
    window.print();
  };

  const handleExcelExport = () => {
    StorageService.exportToExcel(filteredJournals, config);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* INJECT DYNAMIC PRINT MEDIA RULE FOR SELECTED PAPER SIZE */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize === 'F4' ? '215mm 330mm' : '210mm 297mm'};
            margin: 5mm 7mm 5mm 7mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-one-page {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-before: auto !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: auto !important;
            max-height: ${paperSize === 'F4' ? '320mm' : '287mm'} !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print-one-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          /* Tighten elements in print */
          .print-one-page * {
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* FILTER & ACTIONS BAR (Hidden on Print) */}
      <div className="no-print bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cetak &amp; Ekspor Jurnal
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Pilih filter data, ukuran kertas, dan format laporan sebelum mencetak PDF atau mengunduh Excel.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPositionMode((prev) => (prev === 'kepsek-left' ? 'guru-left' : 'kepsek-left'))}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Tukar posisi tanda tangan Guru dan Kepala Sekolah"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span>{positionMode === 'kepsek-left' ? 'TTD: Kepsek Kiri' : 'TTD: Guru Kiri'}</span>
            </button>
            <button
              type="button"
              onClick={handleExcelExport}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              title={`Cetak atau simpan PDF: ${generatePdfFileName()}.pdf`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Layout Mode, Paper Size & Photo Options */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">Format:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 font-semibold">
              <button
                type="button"
                onClick={() => setPrintLayoutMode('rekap-lengkap')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  printLayoutMode === 'rekap-lengkap'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Bulanan
              </button>
              <button
                type="button"
                onClick={() => setPrintLayoutMode('per-pertemuan')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  printLayoutMode === 'per-pertemuan'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Pertemuan (1 Lembar)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Kertas:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 font-semibold">
                <button
                  type="button"
                  onClick={() => setPaperSize('F4')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    paperSize === 'F4' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  F4 / Folio
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    paperSize === 'A4' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  A4
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includePhotosInPrint}
                onChange={(e) => setIncludePhotosInPrint(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Sertakan Foto ({totalPhotosCount})</span>
            </label>

            {includePhotosInPrint && (
              <select
                value={photoSize}
                onChange={(e) => setPhotoSize(e.target.value as 'compact' | 'normal' | 'large')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                aria-label="Ukuran foto cetak"
              >
                <option value="compact">Foto Kecil (Pas 1 Lembar)</option>
                <option value="normal">Foto Sedang</option>
                <option value="large">Foto Besar</option>
              </select>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guru</label>
            {isGuruRole ? (
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 truncate">
                {currentUser?.nama || 'Akun Guru'}
              </div>
            ) : (
              <select
                value={filterGuru}
                onChange={(e) => setFilterGuru(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="SEMUA">Semua Guru</option>
                {teachers.map((t) => (
                  <option key={`${t.kode_guru}-${t.nip}`} value={t.nip}>
                    #{t.kode_guru} {t.nama}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Mapel</option>
              {mapelList.map((m) => (
                <option key={m.kode} value={m.nama}>
                  {m.kode} - {m.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEMUA">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        {/* If in single journal mode, allow selecting specific meeting */}
        {printLayoutMode === 'per-pertemuan' && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Pilih Pertemuan:</span>
            <select
              value={selectedSingleJournalId}
              onChange={(e) => setSelectedSingleJournalId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white max-w-full"
            >
              <option value="ALL">Semua Pertemuan ({filteredJournals.length} Jurnal)</option>
              {filteredJournals.map((j) => (
                <option key={j.id} value={j.id}>
                  {formatTanggalDMY(j.tanggal)} · {j.kelas} · {j.materi.substring(0, 45)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODE 1: REKAPITULASI JURNAL + LAMPIRAN FOTO DOKUMENTASI  */}
      {/* ======================================================== */}
      {printLayoutMode === 'rekap-lengkap' && (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-lg max-w-5xl mx-auto print:p-0 print:border-none print:shadow-none print:rounded-none print:max-w-none">
          {/* KOP SURAT RESMI */}
          <div className="flex items-center justify-between pb-4 border-b-4 border-double border-slate-900 gap-4">
            <div className="shrink-0 w-24 flex items-center justify-center">
              <img
                src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                alt="Logo Resmi Provinsi Jawa Timur"
                className="h-24 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                }}
              />
            </div>
            <div
              className="text-center flex-1 px-2 font-formal"
              style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
            >
              <h4
                className="text-sm font-semibold tracking-wider text-slate-900 uppercase"
                style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
              >
                PEMERINTAH PROVINSI JAWA TIMUR
              </h4>
              <h4
                className="text-sm font-bold tracking-wider text-slate-900 uppercase"
                style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
              >
                DINAS PENDIDIKAN
              </h4>
              <h3
                className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase mt-0.5"
                style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
              >
                SMK NEGERI 1 SIDAYU GRESIK
              </h3>
              <p
                className="text-[12px] text-slate-900 font-bold mt-1 leading-snug"
                style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
              >
                Jalan Raya Wadeng Kec. Sidayu Kab. Gresik Jawa Tmur 61153
              </p>
              <p
                className="text-[11px] text-slate-900 font-bold leading-snug"
                style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
              >
                Telp. 08113199901, Laman: www.smkn1sidayu.sch.id. Pos-el: smkn1sidayugresik@gmail.com
              </p>
            </div>
            <div className="shrink-0 w-24 hidden sm:block" aria-hidden="true" />
          </div>

          {/* Judul Laporan */}
          <div className="text-center my-6">
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-wide underline decoration-2 underline-offset-4">
              REKAPITULASI JURNAL PEMBELAJARAN MENDALAM
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Tahun Ajaran 2026/2027 • Semester {filterSemester} • Bulan: {filterBulan === 'SEMUA' ? 'Semua Bulan' : `${getNamaBulan(filterBulan)} 2026`}
            </p>
          </div>

          {/* Identitas Filter Laporan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold">GURU:</span>
              <span className="font-bold text-slate-900 block truncate">{filterGuru === 'SEMUA' ? 'Semua Guru' : displayTeacherName}</span>
              {filterGuru !== 'SEMUA' && (
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                  NIP. {formatNip(selectedTeacherObj?.nip || (isGuruRole ? currentUser?.nip : filterGuru))}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold">MATA PELAJARAN:</span>
              <span className="font-bold text-slate-900">{filterMapel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold">KELAS:</span>
              <span className="font-bold text-blue-900">{filterKelas}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold">TOTAL JURNAL:</span>
              <span className="font-bold text-emerald-800">{filteredJournals.length} Pertemuan</span>
            </div>
          </div>

          {/* 1. TABEL REKAP JURNAL */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>1. Rekapitulasi Jurnal Pembelajaran Guru</span>
              </div>
              <span className="text-[10px] font-normal text-slate-500 normal-case">
                Tercatat lengkap dengan dokumentasi foto &amp; evaluasi Deep Learning
              </span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[10px]">
                  <tr className="border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-300 w-24">Tanggal</th>
                    <th className="p-2 border-r border-slate-300 w-20">Kelas</th>
                    <th className="p-2 border-r border-slate-300">Materi Pokok &amp; Aktivitas</th>
                    <th className="p-2 border-r border-slate-300 w-20 text-center">Kehadiran</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Deep Learning</th>
                    {includePhotosInPrint && (
                      <th className="p-2 border-r border-slate-300 w-28 text-center">Dokumentasi</th>
                    )}
                    <th className="p-2 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredJournals.map((j, idx) => (
                    <tr key={j.id} className="hover:bg-slate-50/50">
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[11px]">{formatTanggalDMY(j.tanggal)}</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-blue-900">{j.kelas}</td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{j.materi}</div>
                        <div className="text-[10px] text-slate-500 italic mt-0.5">
                          Aktivitas: {j.aktivitas.join(', ')}
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center">
                        <span className="font-bold text-emerald-800">{j.kehadiran.hadir}</span>/
                        <span className="text-slate-500">{j.kehadiran.total}</span>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-[10px] leading-tight">
                        <div>M: <span className="font-semibold">{j.deep_learning.mindful}</span></div>
                        <div>Mn: <span className="font-semibold">{j.deep_learning.meaningful}</span></div>
                        <div>J: <span className="font-semibold">{j.deep_learning.joyful}</span></div>
                      </td>
                      {/* Dokumentasi in table */}
                      {includePhotosInPrint && (
                        <td className="p-2 border-r border-slate-200 text-center">
                          {j.dokumentasi && j.dokumentasi.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-16 aspect-[16/10] rounded border border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                                <ResolvedPhotoImg
                                  src={j.dokumentasi[0]}
                                  jurnalId={j.id}
                                  alt="Foto Dokumentasi"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              {j.dokumentasi.length > 1 && (
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  +{j.dokumentasi.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">-</span>
                          )}
                        </td>
                      )}
                      <td className="p-2 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                            j.status === 'Disetujui'
                              ? 'bg-emerald-100 text-emerald-800'
                              : j.status === 'Revisi'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. REKAP KEHADIRAN & 3. REKAP DEEP LEARNING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 text-xs">
              <h5 className="font-extrabold uppercase text-slate-900 mb-2">2. Rekapitulasi Kehadiran Siswa</h5>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Total Kehadiran Siswa:</span>
                  <span className="font-bold text-emerald-700">{totalHadir} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span>Sakit:</span>
                  <span className="font-bold text-amber-700">{totalSakit} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span>Izin:</span>
                  <span className="font-bold text-blue-700">{totalIzin} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span>Alpa:</span>
                  <span className="font-bold text-rose-700">{totalAlpa} Siswa</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>Rata-Rata Persentase Hadir:</span>
                  <span className="text-emerald-800 font-mono text-sm">{attendanceRate}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 text-xs">
              <h5 className="font-extrabold uppercase text-slate-900 mb-2">3. Rekapitulasi Pembelajaran Mendalam</h5>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Mindful Learning (Fokus & Atensi):</span>
                    <span className="font-bold text-blue-800">{dlMindful} / {filteredJournals.length} Jurnal</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${filteredJournals.length > 0 ? (dlMindful / filteredJournals.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Meaningful Learning (Relevansi Nyata):</span>
                    <span className="font-bold text-emerald-800">{dlMeaningful} / {filteredJournals.length} Jurnal</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${filteredJournals.length > 0 ? (dlMeaningful / filteredJournals.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span>Joyful Learning (Suasana Menyenangkan):</span>
                    <span className="font-bold text-amber-800">{dlJoyful} / {filteredJournals.length} Jurnal</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full"
                      style={{ width: `${filteredJournals.length > 0 ? (dlJoyful / filteredJournals.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. BAGIAN UTAMA: LAMPIRAN DOKUMENTASI FOTO KEGIATAN PEMBELAJARAN (TERCETAK) */}
          {/* ========================================================================= */}
          {includePhotosInPrint && journalsWithPhotos.length > 0 && (
            <div className="mb-8 pt-4 border-t-2 border-dashed border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-600" />
                  <span>4. Lampiran Dokumentasi Pembelajaran (Bukti Foto KBM &amp; Praktik Kejuruan)</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {totalPhotosCount} Foto Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
                Berikut adalah bukti otentik dokumentasi foto kegiatan pembelajaran mendalam (mindful, meaningful, joyful)
                yang telah diunggah guru dan disupervisi oleh Kepala Sekolah SMKN 1 Sidayu Gresik:
              </p>

              {/* Gallery of photos per journal */}
              <div className="space-y-4">
                {journalsWithPhotos.map((j) => (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 break-inside-avoid"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                          {j.id}
                        </span>
                        <span className="font-bold text-slate-800">{j.kelas}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700">{formatTanggalDMY(j.tanggal)}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{j.mapel}</span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {j.dokumentasi.length} Foto Terlampir
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mb-2.5">
                      Materi: <span className="text-slate-800 font-semibold">{j.materi}</span>
                    </div>

                    {/* Photo Grid (Proporsional & Presisi) */}
                    <div className="flex flex-wrap gap-3">
                      {j.dokumentasi.slice(0, 1).map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          className={`rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xs flex flex-col ${
                            photoSize === 'large'
                              ? 'w-72 print:w-[70mm]'
                              : photoSize === 'normal'
                              ? 'w-60 print:w-[58mm]'
                              : 'w-52 print:w-[50mm]'
                          }`}
                        >
                          <div className="w-full aspect-[16/10] overflow-hidden bg-slate-50 flex items-center justify-center">
                            <ResolvedPhotoImg
                              src={photo}
                              jurnalId={j.id}
                              alt={`Dokumentasi ${j.id} Foto ${pIdx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 text-[10px] text-slate-700 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800">Foto {pIdx + 1}</span>
                            <span className="text-slate-500 font-mono text-[9px] truncate">{j.kelas} • {formatTanggalDMY(j.tanggal)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TANDA TANGAN ELEKTRONIK & QR CODE RESMI */}
          <div className="pt-6 border-t border-slate-300 break-inside-avoid">
            <div className="grid grid-cols-2 gap-8 text-xs text-center">
              {positionMode === 'kepsek-left' ? (
                <>
                  <div className="flex flex-col items-center">
                    <div className="h-14 flex flex-col justify-end items-center mb-2">
                      <p className="text-slate-700 text-xs font-semibold leading-tight">Mengetahui,</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">
                        Kepala SMKN 1 Sidayu Gresik
                      </p>
                    </div>
                    <div className="my-2 flex flex-col items-center justify-center">
                      <div
                        onClick={() => {
                          setVerificationJournal(null);
                          setIsVerificationOpen(true);
                        }}
                        className="cursor-pointer group inline-block p-1 bg-white rounded-xl"
                        title="Klik untuk melihat hasil pindai Barcode TTD Kepala Sekolah"
                      >
                        <OfficialQRCode
                          guruNama={displayTeacherName}
                          kepsekNama={config.kepala_sekolah}
                          semester={filterSemester}
                          size={108}
                          logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-bold text-slate-900 underline text-xs">{config.kepala_sekolah}</p>
                      <p className="text-[11px] text-slate-600">NIP. {formatNip(config.nip_kepala_sekolah)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-14 flex flex-col justify-end items-center mb-2">
                      <p className="text-slate-600 text-[11px] leading-tight mb-0.5">
                        Gresik, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="font-bold text-slate-800 text-xs leading-tight">
                        Guru Mata Pelajaran,
                      </p>
                    </div>
                    <div className="my-2 flex flex-col items-center justify-center">
                      <div
                        onClick={() => {
                          setVerificationJournal(null);
                          setIsVerificationOpen(true);
                        }}
                        className="cursor-pointer group inline-block p-1 bg-white rounded-xl"
                        title="Klik untuk melihat hasil pindai Barcode TTD Guru"
                      >
                        <OfficialQRCode
                          guruNama={displayTeacherName}
                          kepsekNama={config.kepala_sekolah}
                          semester={filterSemester}
                          size={108}
                          logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-bold text-slate-900 underline text-xs">{displayTeacherName}</p>
                      <p className="text-[11px] text-slate-600">
                        NIP. {formatNip(selectedTeacherObj?.nip || (currentUser?.role === 'guru' ? currentUser.nip : '198312162024211002'))}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <div className="h-14 flex flex-col justify-end items-center mb-2">
                      <p className="font-bold text-slate-800 text-xs leading-tight">
                        Guru Mata Pelajaran,
                      </p>
                    </div>
                    <div className="my-2 flex flex-col items-center justify-center">
                      <div
                        onClick={() => {
                          setVerificationJournal(null);
                          setIsVerificationOpen(true);
                        }}
                        className="cursor-pointer group inline-block p-1 bg-white rounded-xl"
                        title="Klik untuk melihat hasil pindai Barcode TTD Guru"
                      >
                        <OfficialQRCode
                          guruNama={displayTeacherName}
                          kepsekNama={config.kepala_sekolah}
                          semester={filterSemester}
                          size={108}
                          logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-bold text-slate-900 underline text-xs">{displayTeacherName}</p>
                      <p className="text-[11px] text-slate-600">
                        NIP. {formatNip(selectedTeacherObj?.nip || (currentUser?.role === 'guru' ? currentUser.nip : '198312162024211002'))}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-14 flex flex-col justify-end items-center mb-2">
                      <p className="text-slate-600 text-[11px] leading-tight mb-0.5">
                        Sidayu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-slate-700 text-xs font-semibold leading-tight">Mengetahui,</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">
                        Kepala SMKN 1 Sidayu Gresik
                      </p>
                    </div>
                    <div className="my-2 flex flex-col items-center justify-center">
                      <div
                        onClick={() => {
                          setVerificationJournal(null);
                          setIsVerificationOpen(true);
                        }}
                        className="cursor-pointer group inline-block p-1 bg-white rounded-xl"
                        title="Klik untuk melihat hasil pindai Barcode TTD Kepala Sekolah"
                      >
                        <OfficialQRCode
                          guruNama={displayTeacherName}
                          kepsekNama={config.kepala_sekolah}
                          semester={filterSemester}
                          size={108}
                          logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-bold text-slate-900 underline text-xs">{config.kepala_sekolah}</p>
                      <p className="text-[11px] text-slate-600">NIP. {formatNip(config.nip_kepala_sekolah)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: LEMBAR JURNAL DETAIL PER PERTEMUAN (PAS 1 LEMBAR UTUH F4/A4)  */}
      {/* ===================================================================== */}
      {printLayoutMode === 'per-pertemuan' && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {singleModeJournals.map((jurnal, idx) => (
            <div
              key={`${jurnal.id}-${idx}`}
              className={`bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg print:p-0 print:border-none print:shadow-none print:rounded-none print:max-w-none print-one-page print:break-inside-avoid print:overflow-hidden flex flex-col justify-between ${
                idx < singleModeJournals.length - 1 ? 'page-break break-after-page' : ''
              }`}
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                pageBreakAfter: idx < singleModeJournals.length - 1 ? 'always' : 'auto',
                breakAfter: idx < singleModeJournals.length - 1 ? 'page' : 'auto',
              }}
            >
              <div className="w-full">
                {/* KOP RESMI DINAS (LOGO PEMPROV JATIM DI KIRI, TEKS RESMI DI TENGAH, TANPA LOGO KANAN) */}
                <div className="flex items-center pb-2.5 print:pb-1.5 border-b-2 print:border-b-4 border-double border-slate-900 gap-3 break-inside-avoid">
                  <div className="shrink-0 w-16 sm:w-20 print:w-16 flex items-center justify-center">
                    <img
                      src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                      alt="Logo Provinsi Jawa Timur"
                      className="h-16 sm:h-20 print:h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                      }}
                    />
                  </div>
                  <div
                    className="text-center flex-1 px-1 font-formal"
                    style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                  >
                    <h4
                      className="text-xs sm:text-sm print:text-[11.5px] font-bold tracking-wider text-slate-900 uppercase leading-snug"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      PEMERINTAH PROVINSI JAWA TIMUR
                    </h4>
                    <h4
                      className="text-xs sm:text-sm print:text-[11.5px] font-bold tracking-wider text-slate-900 uppercase leading-snug"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      DINAS PENDIDIKAN
                    </h4>
                    <h3
                      className="text-base sm:text-lg print:text-[14px] font-black tracking-tight text-slate-900 uppercase mt-0.5 leading-snug"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      SMK NEGERI 1 SIDAYU GRESIK
                    </h3>
                    <p
                      className="text-[11px] sm:text-xs print:text-[9.5px] text-slate-900 font-semibold mt-0.5 leading-tight"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      Jalan Raya Wadeng Kec. Sidayu Kab. Gresik Jawa Timur 61153
                    </p>
                    <p
                      className="text-[10px] sm:text-[11px] print:text-[9px] text-slate-900 font-medium leading-tight mt-0.5"
                      style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
                    >
                      Telp. 08113199901, Laman: www.smkn1sidayu.sch.id. Pos-el: smkn1sidayugresik@gmail.com
                    </p>
                  </div>
                  {/* Spacer penyeimbang simetris agar teks kop tepat di tengah */}
                  <div className="shrink-0 w-16 sm:w-20 print:w-16 hidden sm:block print:block" aria-hidden="true" />
                </div>

                {/* Judul Lembar Jurnal */}
                <div className="text-center my-2.5 print:my-1.5 break-inside-avoid">
                  <h2 className="text-sm sm:text-base print:text-[12.5px] font-black uppercase text-slate-900 tracking-wide underline">
                    LEMBAR JURNAL PEMBELAJARAN MENDALAM
                  </h2>
                  <div className="text-xs print:text-[9.5px] text-slate-600 font-mono mt-0.5">
                    ID Jurnal: {jurnal.id} • Tanggal: {formatTanggalDMY(jurnal.tanggal)} • Status Validasi: {jurnal.status}
                  </div>
                </div>

                {/* Data Identitas Pertemuan */}
                <div className="border border-slate-300 rounded-xl overflow-hidden mb-2.5 print:mb-1.5 text-xs print:text-[9.5px] break-inside-avoid shadow-2xs">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800 w-36 print:w-28">Guru Pengampu</td>
                        <td className="p-2 print:py-1 print:px-2.5 font-bold text-slate-900">{jurnal.guru_nama}</td>
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800 w-28 print:w-20">Kelas</td>
                        <td className="p-2 print:py-1 print:px-2.5 font-bold text-blue-900">{jurnal.kelas}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">NIP</td>
                        <td className="p-2 print:py-1 print:px-2.5 font-mono text-slate-800 font-semibold">{formatNip(jurnal.guru_nip)}</td>
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">Tanggal</td>
                        <td className="p-2 print:py-1 print:px-2.5 font-mono">{formatTanggalDMY(jurnal.tanggal)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">Mata Pelajaran</td>
                        <td colSpan={3} className="p-2 print:py-1 print:px-2.5 font-medium text-slate-800">{jurnal.mapel}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">Materi Pokok</td>
                        <td colSpan={3} className="p-2 print:py-1 print:px-2.5 font-bold text-slate-900">{jurnal.materi}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">Presensi Siswa</td>
                        <td colSpan={3} className="p-2 print:py-1 print:px-2.5">
                          <span className="font-bold text-emerald-800">Hadir: {jurnal.kehadiran.hadir}</span> •{' '}
                          <span>Sakit: {jurnal.kehadiran.sakit}</span> •{' '}
                          <span>Izin: {jurnal.kehadiran.izin}</span> •{' '}
                          <span>Alpa: {jurnal.kehadiran.alpa}</span> •{' '}
                          <span className="text-slate-600 font-semibold">Total: {jurnal.kehadiran.total} Siswa</span>
                          {jurnal.kehadiran.keterangan && (
                            <span className="italic text-slate-500 ml-2">({jurnal.kehadiran.keterangan})</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 print:py-1 print:px-2.5 bg-slate-100/80 font-bold text-slate-800">Aktivitas KBM</td>
                        <td colSpan={3} className="p-2 print:py-1 print:px-2.5 text-slate-800 font-medium leading-relaxed">
                          {jurnal.aktivitas.join(', ')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Kurikulum CP, TP, ATP */}
                <div className="p-2.5 print:py-1.5 print:px-2.5 rounded-xl border border-slate-300 bg-slate-50/60 print:bg-white text-xs print:text-[9.5px] print:leading-snug mb-2.5 print:mb-1.5 space-y-1 print:space-y-0.5 break-inside-avoid shadow-2xs">
                  <div>
                    <strong className="text-slate-900 font-bold">Capaian Pembelajaran (CP):</strong>{' '}
                    <span className="text-slate-700">{jurnal.cp}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold block mb-0.5">Tujuan Pembelajaran (TP):</strong>
                    {(() => {
                      const tpList = parseTpItems(jurnal.tp);
                      if (tpList.length > 1) {
                        return (
                          <div className="pl-2 space-y-0.5">
                            {tpList.map((item, tpIdx) => (
                              <div key={tpIdx} className="text-slate-700 leading-snug">
                                {item}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return <span className="text-slate-700">{jurnal.tp}</span>;
                    })()}
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold">Alur Tujuan Pembelajaran (ATP):</strong>{' '}
                    <span className="text-slate-700">{jurnal.atp}</span>
                  </div>
                </div>

                {/* Deep Learning */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2.5 print:mb-1.5 text-xs print:text-[9.5px] break-inside-avoid">
                  <div className="p-2 print:py-1.5 print:px-2 rounded-xl border border-slate-300 bg-blue-50/30 print:bg-white text-center shadow-2xs">
                    <span className="text-[9.5px] print:text-[8px] text-slate-500 block font-semibold mb-0.5">Mindful Learning</span>
                    <span className="font-black text-blue-900 text-xs print:text-[10.5px]">{jurnal.deep_learning.mindful}</span>
                  </div>
                  <div className="p-2 print:py-1.5 print:px-2 rounded-xl border border-slate-300 bg-emerald-50/30 print:bg-white text-center shadow-2xs">
                    <span className="text-[9.5px] print:text-[8px] text-slate-500 block font-semibold mb-0.5">Meaningful Learning</span>
                    <span className="font-black text-emerald-900 text-xs print:text-[10.5px]">{jurnal.deep_learning.meaningful}</span>
                  </div>
                  <div className="p-2 print:py-1.5 print:px-2 rounded-xl border border-slate-300 bg-amber-50/30 print:bg-white text-center shadow-2xs">
                    <span className="text-[9.5px] print:text-[8px] text-slate-500 block font-semibold mb-0.5">Joyful Learning</span>
                    <span className="font-black text-amber-900 text-xs print:text-[10.5px]">{jurnal.deep_learning.joyful}</span>
                  </div>
                </div>

                {/* Narasi Refleksi */}
                <div className="p-2.5 print:py-1.5 print:px-2.5 rounded-xl border border-purple-200 print:border-slate-300 bg-purple-50/30 print:bg-white text-xs print:text-[9.5px] mb-2.5 print:mb-1.5 break-inside-avoid shadow-2xs">
                  <span className="font-bold text-purple-950 block mb-0.5">Narasi Refleksi Guru:</span>
                  <p className="text-slate-800 leading-snug italic">"{jurnal.refleksi.narasi_refleksi}"</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 pt-1 text-xs print:text-[9px] text-slate-700 font-semibold border-t border-purple-100 print:border-slate-200">
                    <span>Ketercapaian: {jurnal.refleksi.ketercapaian}</span>
                    <span>Kendala: {jurnal.refleksi.kendala}</span>
                    <span>Tindak Lanjut: {jurnal.refleksi.tindak_lanjut}</span>
                  </div>
                </div>

                {/* Catatan Supervisi Kepala Sekolah */}
                {(jurnal.catatan_supervisi || jurnal.supervisi_deep_learning) && (
                  <div className="p-2.5 print:py-1.5 print:px-2.5 rounded-xl border border-purple-300 print:border-slate-300 bg-purple-100/50 print:bg-white text-xs print:text-[9.5px] mb-2.5 print:mb-1.5 break-inside-avoid shadow-2xs">
                    <span className="font-bold text-purple-950 block mb-0.5">Catatan Supervisi Kepala Sekolah:</span>
                    {jurnal.catatan_supervisi && (
                      <p className="text-purple-900 leading-snug font-medium">{jurnal.catatan_supervisi}</p>
                    )}
                    <div className="mt-1 pt-1 border-t border-purple-200 print:border-slate-300 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs print:text-[9px]">
                      <span className="font-bold text-purple-950">Pengamatan Deep Learning:</span>
                      <span className="text-slate-800">
                        Mindful: <strong className="text-purple-950 font-bold">{jurnal.supervisi_deep_learning?.mindful || 'Terlihat'}</strong>
                      </span>
                      <span className="text-slate-800">
                        Meaningful: <strong className="text-purple-950 font-bold">{jurnal.supervisi_deep_learning?.meaningful || 'Sangat Terlihat'}</strong>
                      </span>
                      <span className="text-slate-800">
                        Joyful: <strong className="text-purple-950 font-bold">{jurnal.supervisi_deep_learning?.joyful || 'Sangat Terlihat'}</strong>
                      </span>
                    </div>
                    {jurnal.tanggal_validasi && (
                      <span className="text-[9.5px] print:text-[8.5px] text-purple-700 font-mono mt-1 block">
                        Divalidasi: {formatTanggalDMY(jurnal.tanggal_validasi)} oleh {jurnal.validator_nama}
                      </span>
                    )}
                  </div>
                )}

                {/* FOTO DOKUMENTASI PEMBELAJARAN (1 FOTO - PROPORSIONAL PRESISI TIDAK MEMANJANG & PAS 1 LEMBAR) */}
                {includePhotosInPrint && jurnal.dokumentasi && jurnal.dokumentasi.length > 0 && (
                  <div className="mb-2 print:mb-1.5 p-2 print:py-1.5 print:px-2.5 rounded-xl border border-slate-300 bg-slate-50/50 print:bg-white break-inside-avoid shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5 print:mb-1">
                      <h4 className="text-xs print:text-[9.5px] font-black uppercase text-slate-900 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-600" />
                        <span>Dokumentasi Foto Pembelajaran (1 Foto)</span>
                      </h4>
                      <span className="text-[10px] print:text-[8px] text-slate-500 font-mono">
                        Bukti Fisik Terverifikasi
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="rounded-lg overflow-hidden border border-slate-300 bg-white shadow-2xs break-inside-avoid inline-flex flex-col items-center">
                        <div
                          className={`bg-slate-50 overflow-hidden flex items-center justify-center ${
                            photoSize === 'large'
                              ? 'w-[280px] sm:w-[320px] print:w-[82mm] aspect-[16/10]'
                              : photoSize === 'normal'
                              ? 'w-[240px] sm:w-[270px] print:w-[70mm] aspect-[16/10]'
                              : 'w-[200px] sm:w-[220px] print:w-[58mm] aspect-[16/10]'
                          }`}
                        >
                          <ResolvedPhotoImg
                            src={jurnal.dokumentasi[0]}
                            jurnalId={jurnal.id}
                            alt="Dokumentasi Foto Pembelajaran"
                            className="w-full h-full object-contain bg-slate-50"
                          />
                        </div>
                        <div className="w-full py-0.5 px-2.5 text-center text-[10px] print:text-[8px] font-bold text-slate-700 bg-white border-t border-slate-200">
                          Foto Dokumentasi Kegiatan Pembelajaran di Kelas / Bengkel
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BAGIAN TANDA TANGAN ELEKTRONIK & FOOTER DOKUMEN */}
                <div className="pt-3.5 print:pt-3 border-t-2 border-slate-300 break-inside-avoid mt-2">
                  <div className="grid grid-cols-2 gap-6 print:gap-4 text-xs print:text-[10px] text-center mb-3 print:mb-2">
                    {positionMode === 'kepsek-left' ? (
                      <>
                        <div className="flex flex-col items-center">
                          <p className="text-slate-700 text-xs print:text-[9.5px] font-semibold mb-0.5">Mengetahui,</p>
                          <p className="font-bold text-slate-900 text-xs print:text-[10px] mb-1">
                            Kepala SMKN 1 Sidayu Gresik
                          </p>
                          <div
                            onClick={() => {
                              setVerificationJournal(jurnal);
                              setIsVerificationOpen(true);
                            }}
                            className="my-1 cursor-pointer"
                            title="Klik untuk melihat verifikasi tanda tangan elektronik"
                          >
                            <OfficialQRCode
                              guruNama={jurnal.guru_nama}
                              kepsekNama={config.kepala_sekolah}
                              semester={filterSemester}
                              size={72}
                              logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                            />
                          </div>
                          <p className="font-bold text-slate-900 underline text-xs print:text-[10.5px] mt-1">{config.kepala_sekolah}</p>
                          <p className="text-[10px] print:text-[9px] text-slate-600">NIP. {formatNip(config.nip_kepala_sekolah)}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <p className="text-slate-600 text-[10.5px] print:text-[9px] mb-0.5">
                            Gresik, {formatTanggalDMY(jurnal.tanggal)}
                          </p>
                          <p className="font-bold text-slate-800 text-xs print:text-[10px] mb-1">
                            Guru Mata Pelajaran,
                          </p>
                          <div
                            onClick={() => {
                              setVerificationJournal(jurnal);
                              setIsVerificationOpen(true);
                            }}
                            className="my-1 cursor-pointer"
                            title="Klik untuk melihat verifikasi tanda tangan elektronik"
                          >
                            <OfficialQRCode
                              guruNama={jurnal.guru_nama}
                              kepsekNama={config.kepala_sekolah}
                              semester={filterSemester}
                              size={72}
                              logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                            />
                          </div>
                          <p className="font-bold text-slate-900 underline text-xs print:text-[10.5px] mt-1">{jurnal.guru_nama}</p>
                          <p className="text-[10px] print:text-[9px] text-slate-600">NIP. {formatNip(jurnal.guru_nip)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center">
                          <p className="text-slate-600 text-[10.5px] print:text-[9px] mb-0.5">
                            Gresik, {formatTanggalDMY(jurnal.tanggal)}
                          </p>
                          <p className="font-bold text-slate-800 text-xs print:text-[10px] mb-1">
                            Guru Mata Pelajaran,
                          </p>
                          <div
                            onClick={() => {
                              setVerificationJournal(jurnal);
                              setIsVerificationOpen(true);
                            }}
                            className="my-1 cursor-pointer"
                            title="Klik untuk melihat verifikasi tanda tangan elektronik"
                          >
                            <OfficialQRCode
                              guruNama={jurnal.guru_nama}
                              kepsekNama={config.kepala_sekolah}
                              semester={filterSemester}
                              size={72}
                              logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                            />
                          </div>
                          <p className="font-bold text-slate-900 underline text-xs print:text-[10.5px] mt-1">{jurnal.guru_nama}</p>
                          <p className="text-[10px] print:text-[9px] text-slate-600">NIP. {formatNip(jurnal.guru_nip)}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <p className="text-slate-700 text-xs print:text-[9.5px] font-semibold mb-0.5">Mengetahui,</p>
                          <p className="font-bold text-slate-900 text-xs print:text-[10px] mb-1">
                            Kepala SMKN 1 Sidayu Gresik
                          </p>
                          <div
                            onClick={() => {
                              setVerificationJournal(jurnal);
                              setIsVerificationOpen(true);
                            }}
                            className="my-1 cursor-pointer"
                            title="Klik untuk melihat verifikasi tanda tangan elektronik"
                          >
                            <OfficialQRCode
                              guruNama={jurnal.guru_nama}
                              kepsekNama={config.kepala_sekolah}
                              semester={filterSemester}
                              size={72}
                              logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
                            />
                          </div>
                          <p className="font-bold text-slate-900 underline text-xs print:text-[10.5px] mt-1">{config.kepala_sekolah}</p>
                          <p className="text-[10px] print:text-[9px] text-slate-600">NIP. {formatNip(config.nip_kepala_sekolah)}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* RUNNING FOOTER DOKUMEN RESMI RESMI */}
                  <div className="pt-2 print:pt-1.5 border-t border-slate-300 flex items-center justify-between text-[10px] print:text-[8.5px] text-slate-500 font-mono">
                    <span>E-JURNAL KBM • SMKN 1 SIDAYU GRESIK • No. Jurnal: {jurnal.id}</span>
                    <span>Dokumen Sah Elektronik • Hal. 1 / 1</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barcode TTD Scan Verification Modal */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => {
          setIsVerificationOpen(false);
          setVerificationJournal(null);
        }}
        journal={verificationJournal}
        semester={filterSemester}
        guruNama={displayTeacherName}
        config={config}
      />
    </div>
  );
};
