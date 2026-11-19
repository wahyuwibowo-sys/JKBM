import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, JurnalPembelajaran, Guru, KelasItem } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatNip } from '../../utils/nipFormatter';
import { formatTanggalDMY } from '../../utils/dateFormatter';
import {
  School,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Eye,
  Zap,
  CheckCheck,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';

interface KepsekDashboardProps {
  currentUser: User;
  journals: JurnalPembelajaran[];
  teachers: Guru[];
  kelasList: KelasItem[];
  onOpenValidation: (journal: JurnalPembelajaran) => void;
  onSelectTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const KepsekDashboard: React.FC<KepsekDashboardProps> = ({
  currentUser,
  journals,
  teachers,
  onOpenValidation,
  onSelectTab,
  onRefreshData,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalJurnal = journals.length;
  const pendingJurnal = journals.filter((j) => j.status === 'Menunggu Validasi');
  const disetujuiJurnal = journals.filter((j) => j.status === 'Disetujui');
  const revisiJurnal = journals.filter((j) => j.status === 'Revisi');

  // Jurnal masuk hari ini
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPendingJurnal = pendingJurnal.filter((j) => j.tanggal === todayStr);

  const mindfulHigh = journals.filter((j) => j.deep_learning.mindful === 'Sangat Terlihat' || j.deep_learning.mindful === 'Terlihat').length;
  const meaningfulHigh = journals.filter((j) => j.deep_learning.meaningful === 'Sangat Terlihat' || j.deep_learning.meaningful === 'Terlihat').length;
  const joyfulHigh = journals.filter((j) => j.deep_learning.joyful === 'Sangat Terlihat' || j.deep_learning.joyful === 'Terlihat').length;

  const handleInstantBatchValidate = (mode: 'today' | 'all') => {
    const targetJournals = mode === 'today' ? (todayPendingJurnal.length > 0 ? todayPendingJurnal : pendingJurnal) : pendingJurnal;
    if (targetJournals.length === 0) return;

    const confirmMsg = mode === 'today' && todayPendingJurnal.length > 0
      ? `Validasi & tanda tangani 1-klik ${todayPendingJurnal.length} jurnal guru masuk hari ini (${todayStr})?`
      : `Validasi & tanda tangani 1-klik seluruh ${pendingJurnal.length} jurnal guru yang menunggu supervisi?`;

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    const ids = targetJournals.map((j) => j.id);
    const kepsekNameWithTitle = `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`;

    const res = StorageService.batchUpdateJurnalValidasi(
      ids,
      'Disetujui',
      'Pembelajaran telah disupervisi dan disetujui secara resmi oleh Kepala Sekolah.',
      kepsekNameWithTitle
    );
    setIsProcessing(false);

    if (res.success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      setSuccessToast(
        `⚡ Berhasil! ${res.updatedCount} Jurnal Pembelajaran berhasil divalidasi dan ditandatangani elektronik dalam 1-Klik!`
      );
      setTimeout(() => setSuccessToast(null), 6000);
      if (onRefreshData) onRefreshData();
    } else {
      alert(res.error || 'Gagal memproses validasi.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notifikasi 1-Klik */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Kepala Sekolah */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/10">
            <School className="w-3.5 h-3.5 text-purple-300" />
            <span>Dashboard Supervisi Kepala Sekolah SMKN 1 Sidayu Gresik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ibu {currentUser.nama} {currentUser.gelar ? `, ${currentUser.gelar}` : ''}
          </h2>
          <p className="mt-2 text-sm text-purple-100 leading-relaxed font-mono">
            NIP: {formatNip(currentUser.nip)} • Tanda Tangan Elektronik & Supervisi Pembelajaran Mendalam Terverifikasi QR Resmi.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectTab('kepsek-validasi')}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Daftar Validasi Jurnal ({pendingJurnal.length} Menunggu)</span>
            </button>
            <button
              onClick={() => onSelectTab('laporan')}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Lihat Rekap Laporan PDF / Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* BANNER 1-KLIK AUTO VALIDASI SEMUA JURNAL HARIAN */}
      {pendingJurnal.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">
                  ⚡ Tombol Tambahan: Validasi Auto 1-Klik Harian
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wide">
                  1-Klik Selesai
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-1 max-w-xl">
                Cukup 1 kali klik, seluruh jurnal guru yang masuk hari ini langsung tervalidasi, ditandatangani elektronik, dan diterbitkan QR Code resmi tanpa membuka satu per satu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {todayPendingJurnal.length > 0 && (
              <button
                disabled={isProcessing}
                onClick={() => handleInstantBatchValidate('today')}
                className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>⚡ 1-Klik Jurnal Hari Ini ({todayPendingJurnal.length})</span>
              </button>
            )}

            <button
              disabled={isProcessing}
              onClick={() => handleInstantBatchValidate('all')}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-purple-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 ring-2 ring-white/50"
            >
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>⚡ 1-Klik Validasi SEMUA ({pendingJurnal.length})</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Jurnal</span>
            <FileCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalJurnal}</div>
          <div className="text-[11px] text-slate-500 mt-1">Seluruh guru mata pelajaran</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs ring-1 ring-amber-300/40">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu Validasi</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600">{pendingJurnal.length}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold">
            {todayPendingJurnal.length > 0 ? `${todayPendingJurnal.length} jurnal masuk hari ini` : 'Perlu supervisi & tanda tangan'}
          </div>
          {pendingJurnal.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                disabled={isProcessing}
                onClick={() => handleInstantBatchValidate(todayPendingJurnal.length > 0 ? 'today' : 'all')}
                className="w-full py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>
                  ⚡ 1-Klik Validasi {todayPendingJurnal.length > 0 ? `Hari Ini (${todayPendingJurnal.length})` : `Semua (${pendingJurnal.length})`}
                </span>
              </button>
              <button
                onClick={() => onSelectTab('kepsek-validasi')}
                className="w-full py-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline decoration-dotted text-center cursor-pointer"
              >
                Buka Rincian Antrean &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Disetujui</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{disetujuiJurnal.length}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">Telah ditandatangani elektronik</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Revisi Guru</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600">{revisiJurnal.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Diberikan catatan supervisi</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Ketercapaian Pembelajaran Mendalam
              </h3>
            </div>
            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
              Kurikulum Merdeka
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Mindful Learning (Fokus & Kesadaran)</span>
                <span className="text-blue-700 font-mono">
                  {totalJurnal > 0 ? Math.round((mindfulHigh / totalJurnal) * 100) : 0}% Terlihat
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${totalJurnal > 0 ? (mindfulHigh / totalJurnal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Meaningful Learning (Kebermaknaan Industri)</span>
                <span className="text-emerald-700 font-mono">
                  {totalJurnal > 0 ? Math.round((meaningfulHigh / totalJurnal) * 100) : 0}% Terlihat
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full"
                  style={{ width: `${totalJurnal > 0 ? (meaningfulHigh / totalJurnal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-800">Joyful Learning (Suasana Menyenangkan)</span>
                <span className="text-amber-700 font-mono">
                  {totalJurnal > 0 ? Math.round((joyfulHigh / totalJurnal) * 100) : 0}% Terlihat
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${totalJurnal > 0 ? (joyfulHigh / totalJurnal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Statistik Guru Mengajar</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{teachers.length} Guru Aktif</span>
          </div>
          <div className="space-y-3">
            {teachers.map((teacher) => {
              const count = journals.filter((j) => j.guru_nip === teacher.nip).length;
              const approved = journals.filter(
                (j) => j.guru_nip === teacher.nip && j.status === 'Disetujui'
              ).length;
              return (
                <div
                  key={`${teacher.kode_guru}-${teacher.nip}`}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {teacher.nama}, {teacher.gelar}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Jurusan: {teacher.jurusan.join(', ')} • NIP {formatNip(teacher.nip)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-blue-700">{count} Jurnal</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">
                      {approved} Disetujui
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-slate-900">
              Antrean Jurnal Menunggu Validasi ({pendingJurnal.length})
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('kepsek-validasi')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>Lihat Semua Validasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingJurnal.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            🎉 Tidak ada jurnal yang menunggu validasi. Semua jurnal telah disupervisi!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingJurnal.map((journal) => (
              <div
                key={journal.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-500">{journal.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-blue-900">{journal.guru_nama}</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-bold">
                      {journal.kelas}
                    </span>
                    <span className="text-slate-400">{formatTanggalDMY(journal.tanggal)}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{journal.materi}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {journal.mapel} • Hadir {journal.kehadiran.hadir}/{journal.kehadiran.total} Siswa
                  </div>
                </div>
                <button
                  onClick={() => onOpenValidation(journal)}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Supervisi & Validasi</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
