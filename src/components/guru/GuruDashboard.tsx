import React from 'react';
import { User, JurnalPembelajaran, JadwalMengajar } from '../../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Eye,
  ArrowRight,
  Plus,
  Edit2,
} from 'lucide-react';
import { formatTanggalDMY } from '../../utils/dateFormatter';
import { formatNip } from '../../utils/nipFormatter';

interface GuruDashboardProps {
  currentUser: User;
  journals: JurnalPembelajaran[];
  jadwalList: JadwalMengajar[];
  onOpenNewJournal: (jadwalId?: string) => void;
  onViewJournal: (journal: JurnalPembelajaran) => void;
  onEditJournal: (journal: JurnalPembelajaran) => void;
}

const getStatusStyle = (status: JurnalPembelajaran['status']) => {
  switch (status) {
    case 'Disetujui':
      return { text: 'text-emerald-700', dot: 'bg-emerald-600', label: 'Disetujui' };
    case 'Menunggu Validasi':
      return { text: 'text-amber-700', dot: 'bg-amber-500', label: 'Menunggu Validasi' };
    case 'Revisi':
      return { text: 'text-rose-700', dot: 'bg-rose-600', label: 'Perlu Revisi' };
    default:
      return { text: 'text-slate-600', dot: 'bg-slate-400', label: 'Draft' };
  }
};

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  currentUser,
  journals,
  jadwalList,
  onOpenNewJournal,
  onViewJournal,
  onEditJournal,
}) => {
  const myJournals = journals.filter(
    (j) => j.guru_nip === currentUser.nip || j.guru_nama.includes(currentUser.nama)
  );

  const totalJurnal = myJournals.length;
  const disetujuiCount = myJournals.filter((j) => j.status === 'Disetujui').length;
  const menungguCount = myJournals.filter((j) => j.status === 'Menunggu Validasi').length;
  const revisiCount = myJournals.filter((j) => j.status === 'Revisi').length;

  const totalStudents = myJournals.reduce((acc, curr) => acc + (curr.kehadiran.total || 0), 0);
  const totalHadir = myJournals.reduce((acc, curr) => acc + (curr.kehadiran.hadir || 0), 0);
  const avgAttendance = totalStudents > 0 ? ((totalHadir / totalStudents) * 100).toFixed(1) : '100';

  const mySchedule = jadwalList.filter(
    (j) => j.guru_nip === currentUser.nip || j.guru_nama.includes(currentUser.nama)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Header Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>SMKN 1 Sidayu Gresik</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">NIP {formatNip(currentUser.nip)}</span>
            {currentUser.mapel_diampu && currentUser.mapel_diampu.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentUser.mapel_diampu.join(', ')}</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Selamat Datang, {currentUser.nama}
            {currentUser.gelar ? `, ${currentUser.gelar}` : ''}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pilih jadwal mengajar di bawah untuk langsung mengisi jurnal, atau lihat riwayat Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewJournal()}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jurnal Baru</span>
        </button>
      </div>

      {/* Revision Alert Banner */}
      {revisiCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-sm block text-rose-950">
                {revisiCount} Jurnal Memerlukan Perbaikan
              </span>
              Kepala Sekolah telah menambahkan catatan supervisi. Silakan periksa dan perbarui jurnal Anda.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const firstRev = myJournals.find((j) => j.status === 'Revisi');
              if (firstRev) onEditJournal(firstRev);
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shrink-0 self-end sm:self-auto cursor-pointer whitespace-nowrap"
          >
            Perbaiki Sekarang
          </button>
        </div>
      )}

      {/* 4-Column Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Jurnal</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {totalJurnal}
          </div>
          <div className="text-xs text-slate-500 mt-1">Tercatat di sistem</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kehadiran Siswa</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
            {avgAttendance}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Rata-rata seluruh kelas</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Disetujui Kepsek</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {disetujuiCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sudah tervalidasi QR</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Menunggu Validasi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono tabular-nums">
            {menungguCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Dalam antrean supervisi</div>
        </div>
      </div>

      {/* Jadwal Mengajar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Jadwal Mengajar Saya</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {mySchedule.length} Jadwal
          </span>
        </div>

        {mySchedule.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            Belum ada jadwal terdaftar untuk akun Anda. Anda tetap dapat mengisi jurnal secara langsung melalui tombol Buat Jurnal Baru.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {mySchedule.map((jadwal) => (
              <div
                key={jadwal.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-blue-700">{jadwal.kelas}</span>
                    <span className="text-slate-500 font-medium">
                      {jadwal.hari} · {jadwal.jam_ke}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-snug">
                    {jadwal.mapel_nama}
                  </div>
                  {jadwal.materi_pokok && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {jadwal.materi_pokok}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewJournal(jadwal.id)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Isi Jurnal Kelas Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Riwayat Jurnal Terbaru */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Jurnal Terbaru</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {myJournals.length} Total
          </span>
        </div>

        {myJournals.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Belum ada jurnal yang diisi. Mulai catat kegiatan mengajar Anda hari ini.
            </p>
            <button
              type="button"
              onClick={() => onOpenNewJournal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Jurnal Pertama</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myJournals.slice(0, 5).map((journal) => {
              const st = getStatusStyle(journal.status);
              return (
                <div
                  key={journal.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {formatTanggalDMY(journal.tanggal)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-blue-700">{journal.kelas}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{journal.mapel}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${st.text}`}>{st.label}</span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 truncate">
                      {journal.materi}
                    </div>

                    <div className="text-xs text-slate-500 tabular-nums">
                      Hadir {journal.kehadiran.hadir}/{journal.kehadiran.total} siswa
                      {journal.aktivitas.length > 0 && ` · ${journal.aktivitas.join(', ')}`}
                    </div>

                    {journal.catatan_supervisi && (
                      <div className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 mt-1.5">
                        <span className="font-semibold text-slate-900">Catatan Kepsek:</span>{' '}
                        {journal.catatan_supervisi}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {(journal.status === 'Revisi' || journal.status === 'Draft') && (
                      <button
                        type="button"
                        onClick={() => onEditJournal(journal)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{journal.status === 'Revisi' ? 'Perbaiki' : 'Lanjutkan'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewJournal(journal)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
