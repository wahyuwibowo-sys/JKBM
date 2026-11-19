import React from 'react';
import { JurnalPembelajaran, AppConfig } from '../../types';
import { X, QrCode, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';
import { formatNip } from '../../utils/nipFormatter';
import { formatTanggalDMY } from '../../utils/dateFormatter';
import { ResolvedPhotoImg } from './ResolvedPhotoImg';

interface JournalDetailModalProps {
  journal: JurnalPembelajaran | null;
  config: AppConfig;
  onClose: () => void;
  onOpenQRVerification: (journal: JurnalPembelajaran) => void;
}

const getStatusInfo = (status: JurnalPembelajaran['status']) => {
  switch (status) {
    case 'Disetujui':
      return { text: 'text-emerald-700', label: 'Disetujui Kepala Sekolah', Icon: CheckCircle2 };
    case 'Menunggu Validasi':
      return { text: 'text-amber-700', label: 'Menunggu Validasi', Icon: Clock };
    case 'Revisi':
      return { text: 'text-rose-700', label: 'Perlu Revisi', Icon: AlertTriangle };
    default:
      return { text: 'text-slate-600', label: 'Draft', Icon: FileText };
  }
};

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  journal,
  config,
  onClose,
  onOpenQRVerification,
}) => {
  if (!journal) return null;

  const statusInfo = getStatusInfo(journal.status);
  const StatusIcon = statusInfo.Icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative divide-y divide-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
              alt="Logo Jawa Timur"
              className="h-11 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
              }}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-slate-500 tabular-nums">{journal.id}</span>
                <span aria-hidden="true">·</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${statusInfo.text}`}>
                  <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusInfo.label}</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">
                {journal.materi}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{journal.mapel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup detail jurnal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informasi Umum */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Tanggal Mengajar</span>
            <span className="font-semibold text-slate-900 mt-0.5 block tabular-nums">
              {formatTanggalDMY(journal.tanggal)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Kelas</span>
            <span className="font-semibold text-blue-700 mt-0.5 block">{journal.kelas}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Guru Pengampu</span>
            <span className="font-semibold text-slate-900 mt-0.5 block truncate">
              {journal.guru_nama}
            </span>
            {journal.guru_nip && (
              <span className="text-[11px] text-slate-500 font-mono tabular-nums block">
                NIP {formatNip(journal.guru_nip)}
              </span>
            )}
          </div>
        </div>

        {/* Kehadiran & Aktivitas */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <span className="font-semibold text-slate-800 block mb-2">
              Kehadiran Siswa ({journal.kehadiran.total} Siswa)
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="py-2 px-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-700">Hadir</div>
                <div className="text-base font-bold text-emerald-800 font-mono tabular-nums">
                  {journal.kehadiran.hadir}
                </div>
              </div>
              <div className="py-2 px-2 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] text-amber-700">Sakit</div>
                <div className="text-base font-bold text-amber-800 font-mono tabular-nums">
                  {journal.kehadiran.sakit}
                </div>
              </div>
              <div className="py-2 px-2 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-[11px] text-blue-700">Izin</div>
                <div className="text-base font-bold text-blue-800 font-mono tabular-nums">
                  {journal.kehadiran.izin}
                </div>
              </div>
              <div className="py-2 px-2 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-[11px] text-rose-700">Alpa</div>
                <div className="text-base font-bold text-rose-800 font-mono tabular-nums">
                  {journal.kehadiran.alpa}
                </div>
              </div>
            </div>
          </div>

          {journal.aktivitas.length > 0 && (
            <div>
              <span className="font-semibold text-slate-800 block mb-1">
                Aktivitas Pembelajaran
              </span>
              <p className="text-slate-700">{journal.aktivitas.join(' · ')}</p>
            </div>
          )}

          <div>
            <span className="font-semibold text-slate-800 block mb-2">
              Evaluasi Pembelajaran Mendalam
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Mindful</span>
                <span className="font-semibold text-blue-700 mt-0.5 block">
                  {journal.deep_learning.mindful}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Meaningful</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">
                  {journal.deep_learning.meaningful}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Joyful</span>
                <span className="font-semibold text-amber-700 mt-0.5 block">
                  {journal.deep_learning.joyful}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refleksi Guru */}
        <div className="p-5 sm:p-6 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-800">Refleksi Guru</span>
            <span>Ketercapaian: {journal.refleksi.ketercapaian}</span>
          </div>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {journal.refleksi.narasi_refleksi}
          </p>
        </div>

        {/* Dokumentasi Foto */}
        {journal.dokumentasi && journal.dokumentasi.length > 0 && (
          <div className="p-5 sm:p-6 space-y-2 text-xs">
            <span className="font-semibold text-slate-800 block">Dokumentasi Kegiatan</span>
            <div className="w-full sm:w-72 aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <ResolvedPhotoImg
                src={journal.dokumentasi[0]}
                jurnalId={journal.id}
                alt="Dokumentasi Kegiatan Pembelajaran"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Supervisi Kepala Sekolah */}
        {(journal.catatan_supervisi || journal.supervisi_deep_learning) && (
          <div className="p-5 sm:p-6 bg-slate-50/70 space-y-2 text-xs">
            <span className="font-semibold text-slate-900 block">
              Catatan Supervisi Kepala Sekolah
            </span>
            {journal.catatan_supervisi && (
              <p className="text-slate-700 leading-relaxed">{journal.catatan_supervisi}</p>
            )}
            {journal.tanggal_validasi && (
              <div className="text-[11px] text-slate-500 font-mono tabular-nums pt-1">
                Divalidasi pada {formatTanggalDMY(journal.tanggal_validasi)} oleh{' '}
                {journal.validator_nama}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-5 sm:px-6 flex items-center justify-between gap-3 bg-white">
          {journal.status === 'Disetujui' ? (
            <button
              type="button"
              onClick={() => onOpenQRVerification(journal)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
              <span>Lihat Sertifikat QR</span>
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
