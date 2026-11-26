import React, { useMemo, useState } from 'react';
import { JurnalPembelajaran, Guru } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatNip } from '../../utils/nipFormatter';
import { formatTanggalDMY } from '../../utils/dateFormatter';
import {
  Trash2,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';

interface AdminJournalManagerProps {
  journals: JurnalPembelajaran[];
  teachers: Guru[];
  onViewJournal: (journal: JurnalPembelajaran) => void;
  onRefreshAllData: () => void;
}

type ConfirmModalState =
  | { mode: 'single'; journal: JurnalPembelajaran }
  | { mode: 'selected'; ids: string[]; label: string }
  | { mode: 'all' }
  | null;

export const AdminJournalManager: React.FC<AdminJournalManagerProps> = ({
  journals,
  teachers,
  onViewJournal,
  onRefreshAllData,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuru, setSelectedGuru] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);
  const [confirmAllText, setConfirmAllText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  // Build unique teacher filter options from journals + master teachers
  const guruFilterOptions = useMemo(() => {
    const countMap = new Map<string, { key: string; label: string; count: number }>();

    for (const j of journals) {
      const cleanNip = StorageService.cleanNip(j.guru_nip);
      const key = cleanNip && cleanNip !== '-' ? `nip:${cleanNip}` : `nama:${j.guru_nama}`;
      const existing = countMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(key, {
          key,
          label: j.guru_nama || (cleanNip !== '-' ? cleanNip : 'Guru'),
          count: 1,
        });
      }
    }

    // Also include teachers who currently have 0 journals so Admin can verify quickly
    for (const t of teachers) {
      const cleanNip = StorageService.cleanNip(t.nip);
      const key = cleanNip && cleanNip !== '-' ? `nip:${cleanNip}` : `nama:${t.nama}`;
      if (!countMap.has(key)) {
        countMap.set(key, {
          key,
          label: t.nama,
          count: 0,
        });
      }
    }

    return Array.from(countMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
  }, [journals, teachers]);

  const filteredJournals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return journals.filter((j) => {
      if (selectedGuru !== 'ALL') {
        const cleanNip = StorageService.cleanNip(j.guru_nip);
        const key = cleanNip && cleanNip !== '-' ? `nip:${cleanNip}` : `nama:${j.guru_nama}`;
        if (key !== selectedGuru) return false;
      }
      if (selectedStatus !== 'ALL' && j.status !== selectedStatus) return false;
      if (selectedDate && j.tanggal !== selectedDate) return false;
      if (q) {
        const hay = `${j.id} ${j.guru_nama} ${j.guru_nip} ${j.kelas} ${j.mapel} ${j.materi}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [journals, selectedGuru, selectedStatus, selectedDate, searchQuery]);

  const filteredIdSet = useMemo(() => new Set(filteredJournals.map((j) => j.id)), [filteredJournals]);
  const selectedInFilterCount = useMemo(
    () => selectedIds.filter((id) => filteredIdSet.has(id)).length,
    [selectedIds, filteredIdSet]
  );
  const allFilteredSelected =
    filteredJournals.length > 0 && selectedInFilterCount === filteredJournals.length;

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const next = new Set(selectedIds);
      filteredJournals.forEach((j) => next.add(j.id));
      setSelectedIds(Array.from(next));
    }
  };

  const stats = useMemo(() => {
    const uniqueTeachers = new Set(
      journals.map((j) => {
        const nip = StorageService.cleanNip(j.guru_nip);
        return nip !== '-' ? nip : j.guru_nama;
      })
    ).size;
    return {
      total: journals.length,
      teachers: uniqueTeachers,
      pending: journals.filter((j) => j.status === 'Menunggu Validasi').length,
      approved: journals.filter((j) => j.status === 'Disetujui').length,
    };
  }, [journals]);

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    setIsDeleting(true);

    try {
      if (confirmModal.mode === 'single') {
        const targetId = confirmModal.journal.id;
        const res = await StorageService.deleteJurnals([targetId]);
        setSelectedIds((prev) => prev.filter((id) => id !== targetId));
        onRefreshAllData();
        setConfirmModal(null);
        if (res.success) {
          showToast('success', `Jurnal ${targetId} (${confirmModal.journal.guru_nama}) berhasil dihapus.`);
        } else {
          showToast('error', res.error || 'Gagal menghapus jurnal.');
        }
      } else if (confirmModal.mode === 'selected') {
        const idsToDelete = [...confirmModal.ids];
        const res = await StorageService.deleteJurnals(idsToDelete);
        const removedSet = new Set(idsToDelete);
        setSelectedIds((prev) => prev.filter((id) => !removedSet.has(id)));
        onRefreshAllData();
        setConfirmModal(null);
        if (res.success) {
          showToast('success', `${res.deletedCount} jurnal berhasil dihapus dari sistem dan database cloud.`);
        } else {
          showToast('error', res.error || 'Sebagian penghapusan gagal.');
        }
      } else if (confirmModal.mode === 'all') {
        const res = await StorageService.deleteAllJurnals();
        setSelectedIds([]);
        setConfirmAllText('');
        onRefreshAllData();
        setConfirmModal(null);
        if (res.success) {
          showToast('success', `Seluruh jurnal uji coba (${res.deletedCount} dokumen) berhasil dibersihkan.`);
        } else {
          showToast('error', res.error || 'Gagal membersihkan seluruh jurnal.');
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Menunggu Validasi':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Revisi':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans">
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl text-white shadow-xl flex items-center gap-2 text-xs font-bold max-w-md ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Trash2 className="w-3.5 h-3.5 text-rose-100" />
            <span>Pembersihan Data Uji Coba Jurnal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kelola &amp; Hapus Jurnal Semua Guru
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 mt-1.5 leading-relaxed">
            Hapus jurnal hasil uji coba per item, per guru, atau bersihkan seluruh jurnal sekaligus (tersinkron ke database Firestore &amp; seluruh perangkat guru). Data Master Guru, Kelas, Jadwal, dan Bank CP/TP tetap aman.
          </p>
        </div>

        {journals.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setConfirmAllText('');
              setConfirmModal({ mode: 'all' });
            }}
            className="self-start lg:self-auto px-4 py-2.5 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold shadow-md flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Semua Jurnal ({journals.length})</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Jurnal Tersimpan</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{stats.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Guru Mengisi</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">{stats.teachers}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Menunggu Validasi</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Sudah Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{stats.approved}</div>
        </div>
      </div>

      {/* Filter & Bulk Action Panel */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru, kelas, mapel, ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Filter by Guru */}
          <select
            value={selectedGuru}
            onChange={(e) => setSelectedGuru(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="ALL">Semua Guru ({journals.length} Jurnal)</option>
            {guruFilterOptions.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label} ({g.count})
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="Menunggu Validasi">Menunggu Validasi</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Revisi">Revisi</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Filter by Date */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            />
            {(selectedDate || selectedGuru !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGuru('ALL');
                  setSelectedStatus('ALL');
                  setSelectedDate('');
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
                title="Reset Filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Selection & Bulk Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAllFiltered}
                disabled={filteredJournals.length === 0}
                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span>Pilih Semua Ditampilkan ({filteredJournals.length})</span>
            </label>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Batal Pilih ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedGuru !== 'ALL' && filteredJournals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const teacherName = filteredJournals[0]?.guru_nama || 'Guru Terpilih';
                  setConfirmModal({
                    mode: 'selected',
                    ids: filteredJournals.map((j) => j.id),
                    label: `semua ${filteredJournals.length} jurnal milik ${teacherName}`,
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Milik Guru Ini ({filteredJournals.length})</span>
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    mode: 'selected',
                    ids: selectedIds,
                    label: `${selectedIds.length} jurnal terpilih`,
                  })
                }
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Table of Journals */}
        {filteredJournals.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5" />
            <p className="text-sm font-bold text-slate-800">
              {journals.length === 0
                ? 'Belum ada jurnal tersimpan — database bersih'
                : 'Tidak ada jurnal yang sesuai filter'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {journals.length === 0
                ? 'Semua guru siap mulai mengisi jurnal pembelajaran yang sebenarnya.'
                : 'Ubah kata kunci pencarian atau reset filter di atas.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 uppercase text-[10px] z-10">
                <tr className="border-b border-slate-200">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      aria-label="Pilih semua jurnal"
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Tanggal &amp; ID</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3">Kelas &amp; Mapel</th>
                  <th className="p-3">Materi Pokok</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJournals.map((j) => {
                  const isChecked = selectedIds.includes(j.id);
                  return (
                    <tr
                      key={j.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-rose-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(j.id)}
                          aria-label={`Pilih jurnal ${j.id}`}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatTanggalDMY(j.tanggal)}</div>
                        <div className="text-[10px] font-mono text-slate-400">{j.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{j.guru_nama}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          NIP {formatNip(j.guru_nip)}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[11px]">
                          {j.kelas}
                        </span>
                        <div className="text-[11px] font-semibold text-slate-600 mt-0.5 max-w-[200px] truncate">
                          {j.mapel}
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="text-slate-700 line-clamp-2 leading-snug">{j.materi}</p>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                            j.status
                          )}`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewJournal(j)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                            title="Lihat detail jurnal"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmModal({ mode: 'single', journal: j })}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus jurnal ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {confirmModal.mode === 'all'
                    ? 'Bersihkan Seluruh Jurnal Uji Coba?'
                    : 'Konfirmasi Hapus Jurnal'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmModal.mode === 'single' && (
                    <>
                      Jurnal <strong>{confirmModal.journal.id}</strong> milik{' '}
                      <strong>{confirmModal.journal.guru_nama}</strong> ({confirmModal.journal.kelas} ·{' '}
                      {formatTanggalDMY(confirmModal.journal.tanggal)}) akan dihapus permanen dari sistem dan database Firestore.
                    </>
                  )}
                  {confirmModal.mode === 'selected' && (
                    <>
                      Sebanyak <strong>{confirmModal.label}</strong> akan dihapus permanen dari sistem lokal dan database Firestore seluruh perangkat.
                    </>
                  )}
                  {confirmModal.mode === 'all' && (
                    <>
                      Seluruh <strong>{journals.length} jurnal</strong> dari semua guru akan dihapus permanen dari sistem dan Firestore agar siap untuk pengisian resmi. Data guru, kelas, jadwal, dan bank CP/TP tidak terhapus.
                    </>
                  )}
                </p>
              </div>
            </div>

            {confirmModal.mode === 'all' && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <label className="block text-[11px] font-bold text-rose-800">
                  Ketik <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-200">HAPUS</span> untuk konfirmasi pembersihan massal:
                </label>
                <input
                  type="text"
                  value={confirmAllText}
                  onChange={(e) => setConfirmAllText(e.target.value)}
                  placeholder="Ketik HAPUS"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setConfirmModal(null);
                  setConfirmAllText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  isDeleting ||
                  (confirmModal.mode === 'all' && confirmAllText.trim().toUpperCase() !== 'HAPUS')
                }
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
