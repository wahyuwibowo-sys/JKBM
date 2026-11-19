import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { User, JurnalPembelajaran, AppConfig, DeepLearningLevel } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Search,
  X,
  QrCode,
  Image as ImageIcon,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Zap,
  Calendar,
} from 'lucide-react';
import { DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';
import { formatNip } from '../../utils/nipFormatter';
import { formatTanggalDMY } from '../../utils/dateFormatter';
import {
  generateCatatanSupervisi,
  generateBatchCatatanSupervisi,
  SUPERVISI_PRESETS,
} from '../../utils/narrativeGenerator';
import { ResolvedPhotoImg } from '../common/ResolvedPhotoImg';

interface KepsekValidationListProps {
  currentUser: User;
  journals: JurnalPembelajaran[];
  config: AppConfig;
  onRefreshData: () => void;
  onOpenQRVerification: (journal: JurnalPembelajaran) => void;
  selectedJournalForReview?: JurnalPembelajaran | null;
  onCloseReviewModal?: () => void;
}

export const KepsekValidationList: React.FC<KepsekValidationListProps> = ({
  currentUser,
  journals,
  config,
  onRefreshData,
  onOpenQRVerification,
  selectedJournalForReview,
  onCloseReviewModal,
}) => {
  const [activeTab, setActiveTab] = useState<'Menunggu Validasi' | 'Disetujui' | 'Revisi' | 'Semua'>('Menunggu Validasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewingJournal, setReviewingJournal] = useState<JurnalPembelajaran | null>(
    selectedJournalForReview || null
  );
  const [catatanSupervisi, setCatatanSupervisi] = useState<string>('');
  const [supervisiMindful, setSupervisiMindful] = useState<DeepLearningLevel>('Terlihat');
  const [supervisiMeaningful, setSupervisiMeaningful] = useState<DeepLearningLevel>('Sangat Terlihat');
  const [supervisiJoyful, setSupervisiJoyful] = useState<DeepLearningLevel>('Sangat Terlihat');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Batch Validation State for Kepala Sekolah
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchTarget, setBatchTarget] = useState<'all' | 'today'>('today');
  const [batchCatatan, setBatchCatatan] = useState<string>(
    'Pembelajaran telah disupervisi dan disetujui sesuai standar kurikulum SMK Negeri 1 Sidayu Gresik.'
  );
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchToast, setBatchToast] = useState<string | null>(null);

  const pendingJournals = journals.filter((j) => j.status === 'Menunggu Validasi');
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPendingJournals = pendingJournals.filter((j) => j.tanggal === todayStr);

  const activeBatchList = batchTarget === 'today' && todayPendingJournals.length > 0
    ? todayPendingJournals
    : pendingJournals;

  React.useEffect(() => {
    if (selectedJournalForReview) {
      setReviewingJournal(selectedJournalForReview);
      setCatatanSupervisi(selectedJournalForReview.catatan_supervisi || '');
      setSupervisiMindful(selectedJournalForReview.supervisi_deep_learning?.mindful || 'Terlihat');
      setSupervisiMeaningful(selectedJournalForReview.supervisi_deep_learning?.meaningful || 'Sangat Terlihat');
      setSupervisiJoyful(selectedJournalForReview.supervisi_deep_learning?.joyful || 'Sangat Terlihat');
    }
  }, [selectedJournalForReview]);

  const filtered = journals.filter((j) => {
    const matchesTab = activeTab === 'Semua' ? true : j.status === activeTab;
    const matchesQuery =
      searchQuery === '' ||
      j.guru_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.materi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  // Direct 1-Click batch validation (Instant)
  const handleInstantBatchApprove = (target: 'today' | 'all') => {
    const listToApprove = target === 'today' ? (todayPendingJournals.length > 0 ? todayPendingJournals : pendingJournals) : pendingJournals;
    if (listToApprove.length === 0) return;

    const confirmMsg = target === 'today' && todayPendingJournals.length > 0
      ? `Validasi & terbitkan tanda tangan elektronik 1-klik untuk ${todayPendingJournals.length} jurnal guru masuk hari ini (${todayStr})?`
      : `Validasi & terbitkan tanda tangan elektronik 1-klik untuk seluruh ${pendingJournals.length} jurnal yang menunggu supervisi?`;

    if (!window.confirm(confirmMsg)) return;

    setIsBatchProcessing(true);
    const pendingIds = listToApprove.map((j) => j.id);
    const kepsekNameWithTitle = `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`;

    const res = StorageService.batchUpdateJurnalValidasi(
      pendingIds,
      'Disetujui',
      'Pembelajaran telah disupervisi dan disetujui sesuai standar kurikulum SMK Negeri 1 Sidayu Gresik.',
      kepsekNameWithTitle,
      {
        mindful: 'Terlihat',
        meaningful: 'Sangat Terlihat',
        joyful: 'Sangat Terlihat',
      }
    );
    setIsBatchProcessing(false);

    if (res.success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      setBatchToast(`⚡ Sukses! ${res.updatedCount} Jurnal Pembelajaran berhasil divalidasi dan disetujui dalam 1-Klik!`);
      setTimeout(() => setBatchToast(null), 6000);
      onRefreshData();
    } else {
      alert(res.error || 'Gagal memproses validasi.');
    }
  };

  const handleBatchApprove = async () => {
    if (activeBatchList.length === 0) return;
    setIsBatchProcessing(true);
    const pendingIds = activeBatchList.map((j) => j.id);
    const kepsekNameWithTitle = `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`;

    const res = StorageService.batchUpdateJurnalValidasi(
      pendingIds,
      'Disetujui',
      batchCatatan || 'Pembelajaran telah disupervisi dan disetujui secara resmi oleh Kepala Sekolah.',
      kepsekNameWithTitle,
      {
        mindful: 'Terlihat',
        meaningful: 'Sangat Terlihat',
        joyful: 'Sangat Terlihat',
      }
    );
    setIsBatchProcessing(false);

    if (res.success) {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.5 },
      });
      setShowBatchModal(false);
      setBatchToast(`⚡ Sukses! ${res.updatedCount} Jurnal Pembelajaran berhasil divalidasi dan disetujui sekaligus.`);
      setTimeout(() => setBatchToast(null), 6000);
      onRefreshData();
    } else {
      alert(res.error || 'Gagal memproses validasi massal.');
    }
  };

  const handleApprove = async () => {
    if (!reviewingJournal) return;
    setIsProcessing(true);
    const res = StorageService.updateJurnalValidasi(
      reviewingJournal.id,
      'Disetujui',
      catatanSupervisi || 'Pembelajaran telah disupervisi dan disetujui sesuai standar kurikulum.',
      `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`,
      {
        mindful: supervisiMindful,
        meaningful: supervisiMeaningful,
        joyful: supervisiJoyful,
      }
    );
    setIsProcessing(false);
    if (res.success) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setReviewingJournal(null);
      if (onCloseReviewModal) onCloseReviewModal();
      onRefreshData();
    } else {
      alert(res.error || 'Gagal memvalidasi jurnal.');
    }
  };

  const handleRequestRevision = async () => {
    if (!reviewingJournal) return;
    if (!catatanSupervisi.trim()) {
      alert('Mohon cantumkan Catatan Supervisi untuk menjelaskan bagian apa yang perlu direvisi oleh guru.');
      return;
    }
    setIsProcessing(true);
    const res = StorageService.updateJurnalValidasi(
      reviewingJournal.id,
      'Revisi',
      catatanSupervisi,
      `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`,
      {
        mindful: supervisiMindful,
        meaningful: supervisiMeaningful,
        joyful: supervisiJoyful,
      }
    );
    setIsProcessing(false);
    if (res.success) {
      setReviewingJournal(null);
      if (onCloseReviewModal) onCloseReviewModal();
      onRefreshData();
    } else {
      alert(res.error || 'Gagal memproses revisi.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notifikasi Validasi Massal */}
      {batchToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{batchToast}</span>
          </div>
          <button
            onClick={() => setBatchToast(null)}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner Validasi 1-Klik */}
      {pendingJournals.length > 0 && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-slate-900">
                {pendingJournals.length} Jurnal Menunggu Validasi
              </span>
              <span className="text-xs font-semibold text-purple-700">
                · Validasi cepat 1-klik tersedia
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Validasi seluruh jurnal masuk dengan satu klik, atau tinjau satu per satu jika ingin memberi catatan khusus.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {todayPendingJournals.length > 0 && (
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => handleInstantBatchApprove('today')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Validasi Hari Ini ({todayPendingJournals.length})</span>
              </button>
            )}
            <button
              type="button"
              disabled={isBatchProcessing}
              onClick={() => handleInstantBatchApprove('all')}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Validasi Semua ({pendingJournals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBatchTarget(todayPendingJournals.length > 0 ? 'today' : 'all');
                setShowBatchModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              Tinjau &amp; Catatan Khusus
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Validasi &amp; Supervisi Jurnal
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Periksa laporan mengajar guru, tambahkan catatan supervisi, dan sahkan dengan QR resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
          {(['Menunggu Validasi', 'Disetujui', 'Revisi', 'Semua'] as const).map((tab) => {
            const count =
              tab === 'Semua'
                ? journals.length
                : journals.filter((j) => j.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama guru, kelas (misal XI TKJ 1), mapel, atau materi..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada jurnal yang sesuai dengan filter saat ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((j) => (
              <div
                key={j.id}
                className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatTanggalDMY(j.tanggal)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-blue-700">{j.kelas}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        j.status === 'Disetujui'
                          ? 'text-emerald-700'
                          : j.status === 'Menunggu Validasi'
                          ? 'text-amber-700'
                          : j.status === 'Revisi'
                          ? 'text-rose-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {j.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-slate-400">{j.id}</span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {j.materi}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 tabular-nums">
                    <span className="font-semibold text-slate-800">{j.guru_nama}</span>
                    <span aria-hidden="true">·</span>
                    <span>{j.mapel}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Hadir {j.kehadiran.hadir}/{j.kehadiran.total} siswa
                    </span>
                    {j.dokumentasi && j.dokumentasi.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto tersedia</span>
                        </span>
                      </>
                    )}
                  </div>

                  {j.catatan_supervisi && (
                    <div className="mt-2 text-xs bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-900">Catatan Supervisi:</span>{' '}
                      {j.catatan_supervisi}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {j.status === 'Disetujui' && (
                    <button
                      type="button"
                      onClick={() => onOpenQRVerification(j)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      title="Lihat Sertifikat QR Code Verifikasi"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-700" />
                      <span>QR Validasi</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReviewingJournal(j);
                      setCatatanSupervisi(j.catatan_supervisi || '');
                      setSupervisiMindful(j.supervisi_deep_learning?.mindful || 'Terlihat');
                      setSupervisiMeaningful(
                        j.supervisi_deep_learning?.meaningful || 'Sangat Terlihat'
                      );
                      setSupervisiJoyful(
                        j.supervisi_deep_learning?.joyful || 'Sangat Terlihat'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {j.status === 'Menunggu Validasi' ? 'Supervisi & Validasi' : 'Detail'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewingJournal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                  alt="Logo Jawa Timur"
                  className="h-10 w-auto"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                  }}
                />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    Supervisi Jurnal Pembelajaran
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {reviewingJournal.id} • Tanggal: {formatTanggalDMY(reviewingJournal.tanggal)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setReviewingJournal(null);
                  if (onCloseReviewModal) onCloseReviewModal();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Guru Pengampu</span>
                <span className="font-bold text-slate-900 block truncate">{reviewingJournal.guru_nama}</span>
                {reviewingJournal.guru_nip && (
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    NIP. {formatNip(reviewingJournal.guru_nip)}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kelas</span>
                <span className="font-bold text-blue-900">{reviewingJournal.kelas}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mapel</span>
                <span className="font-bold text-slate-900">{reviewingJournal.mapel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <span className="font-bold text-purple-700 uppercase">{reviewingJournal.status}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
              <span className="font-bold text-blue-950 block text-sm">
                Materi: {reviewingJournal.materi}
              </span>
            </div>

            {/* Foto Dokumentasi */}
            {reviewingJournal.dokumentasi && reviewingJournal.dokumentasi.length > 0 && (
              <div>
                <span className="font-bold text-xs text-slate-800 block mb-2">
                  Foto Dokumentasi Kelas ({reviewingJournal.dokumentasi.length} Foto):
                </span>
                <div className="flex flex-wrap gap-2">
                  {reviewingJournal.dokumentasi.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxImage(photo)}
                      className="w-48 aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity bg-slate-50 flex items-center justify-center"
                    >
                      <ResolvedPhotoImg
                        src={photo}
                        jurnalId={reviewingJournal.id}
                        alt={`Dokumentasi ${i + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-900">
                    Catatan Supervisi Kepala Sekolah:
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Bisa diketik manual secara bebas, atau gunakan rekomendasi AI generatif di bawah:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (reviewingJournal) {
                      const note = generateCatatanSupervisi(reviewingJournal, 'apresiasi');
                      setCatatanSupervisi(note);
                    }
                  }}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Generate otomatis catatan supervisi kontekstual berdasarkan isi materi, refleksi, & Deep Learning"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ Auto-Generate AI</span>
                </button>
              </div>

              {/* Generative Category Preset Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {SUPERVISI_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (reviewingJournal) {
                        const note = generateCatatanSupervisi(reviewingJournal, preset.id);
                        setCatatanSupervisi(note);
                      }
                    }}
                    title={preset.description}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={catatanSupervisi}
                onChange={(e) => setCatatanSupervisi(e.target.value)}
                placeholder="Tuliskan catatan apresiasi, evaluasi, atau instruksi perbaikan (bisa manual mengetik atau klik pilihan AI di atas)..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white leading-relaxed"
              />

              {/* Menu Koreksi Pengamatan Deep Learning oleh Kepala Sekolah */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                    <span className="text-xs font-bold text-purple-950">
                      Koreksi Deep Learning (Pengamatan Kepala Sekolah):
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-medium">
                    Menu koreksi jika hasil pengamatan di kelas tidak sesuai isian guru
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-purple-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Mindful:</label>
                      <span className="text-[9px] text-slate-400 font-mono">Guru: {reviewingJournal.deep_learning.mindful}</span>
                    </div>
                    <select
                      value={supervisiMindful}
                      onChange={(e) => setSupervisiMindful(e.target.value as DeepLearningLevel)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-blue-900 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Sangat Terlihat">Sangat Terlihat</option>
                      <option value="Terlihat">Terlihat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Belum Terlihat">Belum Terlihat</option>
                    </select>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-purple-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Meaningful:</label>
                      <span className="text-[9px] text-slate-400 font-mono">Guru: {reviewingJournal.deep_learning.meaningful}</span>
                    </div>
                    <select
                      value={supervisiMeaningful}
                      onChange={(e) => setSupervisiMeaningful(e.target.value as DeepLearningLevel)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-emerald-900 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Sangat Terlihat">Sangat Terlihat</option>
                      <option value="Terlihat">Terlihat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Belum Terlihat">Belum Terlihat</option>
                    </select>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-purple-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Joyful:</label>
                      <span className="text-[9px] text-slate-400 font-mono">Guru: {reviewingJournal.deep_learning.joyful}</span>
                    </div>
                    <select
                      value={supervisiJoyful}
                      onChange={(e) => setSupervisiJoyful(e.target.value as DeepLearningLevel)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-amber-900 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Sangat Terlihat">Sangat Terlihat</option>
                      <option value="Terlihat">Terlihat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Belum Terlihat">Belum Terlihat</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const koreksiText = `Hasil Pengamatan Supervisi Deep Learning -> Mindful: ${supervisiMindful}, Meaningful: ${supervisiMeaningful}, Joyful: ${supervisiJoyful}.`;
                      if (catatanSupervisi && !catatanSupervisi.includes('Hasil Pengamatan Supervisi Deep Learning')) {
                        setCatatanSupervisi(`${catatanSupervisi}\n${koreksiText}`);
                      } else if (!catatanSupervisi) {
                        setCatatanSupervisi(koreksiText);
                      }
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Sisipkan Koreksi Deep Learning ke Catatan Teks</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Tip: Anda bebas mengedit, menghapus, atau menambahkan ketikan manual.</span>
                {catatanSupervisi && (
                  <button
                    type="button"
                    onClick={() => setCatatanSupervisi('')}
                    className="text-slate-400 hover:text-rose-500 text-[11px] underline cursor-pointer"
                  >
                    Kosongkan teks
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setReviewingJournal(null);
                  if (onCloseReviewModal) onCloseReviewModal();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRequestRevision}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Minta Revisi Guru</span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui & Tanda Tangani Jurnal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Validasi Massal Semua Jurnal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Validasi Massal Jurnal Guru ({activeBatchList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Persetujuan & Tanda Tangan Elektronik Kepala Sekolah SMKN 1 Sidayu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pilihan Target Validasi */}
            <div className="flex rounded-2xl bg-slate-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setBatchTarget('today')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  batchTarget === 'today'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Jurnal Masuk Hari Ini ({todayPendingJournals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchTarget('all')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  batchTarget === 'all'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Semua Jurnal Menunggu ({pendingJournals.length})</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Konfirmasi Supervisi Sekaligus:
              </div>
              <p>
                Anda akan menyetujui <strong>{activeBatchList.length} jurnal pembelajaran</strong> ({batchTarget === 'today' ? 'Jurnal Masuk Hari Ini' : 'Seluruh Antrean Menunggu'}) secara serentak dalam 1 kali klik. Setiap jurnal akan langsung berstatus <strong>Disetujui</strong> dan diterbitkan sertifikat QR Code Verifikasi resmi.
              </p>
            </div>

            {/* Ringkasan Jurnal yang Divalidasi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Daftar Jurnal yang Akan Divalidasi ({activeBatchList.length}):
              </label>
              <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50 p-1">
                {activeBatchList.map((pj) => (
                  <div key={pj.id} className="p-2.5 text-xs flex items-center justify-between gap-3 hover:bg-white rounded-xl transition-colors">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{pj.materi}</div>
                      <div className="text-[11px] text-slate-500">
                        {pj.guru_nama} • {pj.mapel} ({pj.kelas}) • {formatTanggalDMY(pj.tanggal)}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      {pj.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Catatan Supervisi Massal */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-900">
                    Catatan Supervisi / Rekomendasi Kepala Sekolah (Semua Jurnal):
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Diterapkan ke seluruh jurnal yang divalidasi. Bisa diketik manual atau dipilih cepat via AI:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchCatatan(generateBatchCatatanSupervisi(activeBatchList.length, 'apresiasi'))}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  title="Generate otomatis rekomendasi supervisi massal"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ AI Catatan Massal</span>
                </button>
              </div>

              {/* Preset Pilihan Cepat Catatan Massal */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBatchCatatan(generateBatchCatatanSupervisi(activeBatchList.length, 'standar'))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
                >
                  📋 Standar Mutu Resmi
                </button>
                <button
                  type="button"
                  onClick={() => setBatchCatatan(generateBatchCatatanSupervisi(activeBatchList.length, 'apresiasi'))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
                >
                  🌟 Apresiasi KBM & Deep Learning
                </button>
                <button
                  type="button"
                  onClick={() => setBatchCatatan(generateBatchCatatanSupervisi(activeBatchList.length, 'kejuruan'))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
                >
                  🎯 Penguatan Vokasi & Industri
                </button>
                <button
                  type="button"
                  onClick={() => setBatchCatatan(generateBatchCatatanSupervisi(activeBatchList.length, 'tindak_lanjut'))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
                >
                  💡 Disposisi Tindak Lanjut Siswa
                </button>
              </div>

              <textarea
                rows={3}
                value={batchCatatan}
                onChange={(e) => setBatchCatatan(e.target.value)}
                placeholder="Tuliskan catatan supervisi umum atau gunakan generator AI di atas..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Tip: Anda bebas mengedit manual secara leluasa kapan saja.</span>
                {batchCatatan && (
                  <button
                    type="button"
                    onClick={() => setBatchCatatan('')}
                    className="text-slate-400 hover:text-rose-500 text-[11px] underline cursor-pointer"
                  >
                    Kosongkan teks
                  </button>
                )}
              </div>
            </div>

            {/* Informasi Penandatangan */}
            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <div className="text-xs text-purple-950">
                <div className="font-bold">
                  Penandatangan: {currentUser.nama}{currentUser.gelar ? ', ' + currentUser.gelar : ''}
                </div>
                <div className="text-[11px] text-purple-700 font-mono mt-0.5">
                  NIP. {formatNip(currentUser.nip)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => setShowBatchModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isBatchProcessing || activeBatchList.length === 0}
                onClick={handleBatchApprove}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isBatchProcessing
                    ? 'Sedang Memproses...'
                    : `Setujui & Validasi 1-Klik (${activeBatchList.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <ResolvedPhotoImg
            src={lightboxImage}
            jurnalId={reviewingJournal?.id}
            alt="Dokumentasi Zoom"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
