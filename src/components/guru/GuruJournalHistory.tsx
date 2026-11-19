import React, { useState } from 'react';
import { User, JurnalPembelajaran } from '../../types';
import { Search, Eye, Edit2, Plus, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { formatTanggalDMY } from '../../utils/dateFormatter';

interface GuruJournalHistoryProps {
  currentUser: User;
  journals: JurnalPembelajaran[];
  onViewJournal: (journal: JurnalPembelajaran) => void;
  onEditJournal: (journal: JurnalPembelajaran) => void;
  onNewJournal: () => void;
}

const STATUS_OPTIONS = ['SEMUA', 'Disetujui', 'Menunggu Validasi', 'Revisi', 'Draft'] as const;

const getStatusBadge = (status: JurnalPembelajaran['status']) => {
  switch (status) {
    case 'Disetujui':
      return {
        label: 'Disetujui',
        className: 'text-emerald-700',
        Icon: CheckCircle2,
      };
    case 'Menunggu Validasi':
      return {
        label: 'Menunggu Validasi',
        className: 'text-amber-700',
        Icon: Clock,
      };
    case 'Revisi':
      return {
        label: 'Perlu Revisi',
        className: 'text-rose-700',
        Icon: AlertTriangle,
      };
    default:
      return {
        label: 'Draft',
        className: 'text-slate-600',
        Icon: FileText,
      };
  }
};

export const GuruJournalHistory: React.FC<GuruJournalHistoryProps> = ({
  currentUser,
  journals,
  onViewJournal,
  onEditJournal,
  onNewJournal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const myJournals = journals.filter(
    (j) => j.guru_nip === currentUser.nip || j.guru_nama.includes(currentUser.nama)
  );

  const filtered = myJournals.filter((j) => {
    const matchStatus = filterStatus === 'SEMUA' ? true : j.status === filterStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      q === '' ||
      j.materi.toLowerCase().includes(q) ||
      j.kelas.toLowerCase().includes(q) ||
      j.mapel.toLowerCase().includes(q) ||
      j.id.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const getCountForStatus = (status: string) => {
    if (status === 'SEMUA') return myJournals.length;
    return myJournals.filter((j) => j.status === status).length;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Jurnal Saya
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar seluruh jurnal mengajar Anda beserta status validasi Kepala Sekolah.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewJournal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Jurnal Baru</span>
        </button>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi, kelas (misal XI TKJ 1), atau mata pelajaran..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl overflow-x-auto shrink-0">
          {STATUS_OPTIONS.map((st) => {
            const count = getCountForStatus(st);
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{st === 'SEMUA' ? 'Semua' : st}</span>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Journal List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <p className="text-sm text-slate-500">
              {myJournals.length === 0
                ? 'Anda belum memiliki jurnal pembelajaran.'
                : 'Tidak ada jurnal yang cocok dengan pencarian atau filter Anda.'}
            </p>
            {myJournals.length === 0 && (
              <button
                type="button"
                onClick={onNewJournal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Jurnal Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((j) => {
              const statusInfo = getStatusBadge(j.status);
              const StatusIcon = statusInfo.Icon;
              return (
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
                      <span className="truncate">{j.mapel}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${statusInfo.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {j.materi}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span>
                        Hadir {j.kehadiran.hadir}/{j.kehadiran.total} siswa
                      </span>
                      {j.aktivitas.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{j.aktivitas.join(', ')}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-400">{j.id}</span>
                    </div>

                    {j.catatan_supervisi && (
                      <div className="mt-2 text-xs bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-900">
                          Catatan Kepala Sekolah:
                        </span>{' '}
                        {j.catatan_supervisi}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {(j.status === 'Revisi' || j.status === 'Draft') && (
                      <button
                        type="button"
                        onClick={() => onEditJournal(j)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{j.status === 'Revisi' ? 'Perbaiki' : 'Lanjutkan'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewJournal(j)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
