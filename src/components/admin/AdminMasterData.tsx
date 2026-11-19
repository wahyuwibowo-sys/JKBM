import React, { useState } from 'react';
import {
  User,
  Guru,
  KelasItem,
  MapelItem,
  JadwalMengajar,
  KurikulumCPTP,
  UserRole,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { formatNip } from '../../utils/nipFormatter';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Search,
  CheckCircle2,
  LogIn,
  UserCheck,
  Edit2,
  Plus,
  RefreshCw,
  Sliders,
  Check,
  X,
  KeyRound,
  Copy,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminMasterDataProps {
  users: User[];
  teachers: Guru[];
  kelasList: KelasItem[];
  mapelList: MapelItem[];
  jadwalList: JadwalMengajar[];
  cptpList: KurikulumCPTP[];
  onRefreshAll: () => void;
  onSelectUser?: (user: User) => void;
}

export const AdminMasterData: React.FC<AdminMasterDataProps> = ({
  users,
  teachers,
  kelasList,
  mapelList,
  jadwalList,
  cptpList,
  onRefreshAll,
  onSelectUser,
}) => {
  const [subTab, setSubTab] = useState<'roles' | 'guru' | 'mapel' | 'kelas' | 'jadwal' | 'cptp'>('roles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'SEMUA' | 'guru' | 'kepsek' | 'admin'>('SEMUA');
  const [filterJurusan, setFilterJurusan] = useState<string>('SEMUA');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Password Management State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [adminCustomPassword, setAdminCustomPassword] = useState<string>('');
  const [revealedPasswordUserId, setRevealedPasswordUserId] = useState<string | null>(null);

  // Editing Mapel for a teacher/user
  const [editingMapelTarget, setEditingMapelTarget] = useState<{
    userId?: string;
    kodeGuru?: number;
    nip?: string;
    email?: string;
    nama: string;
  } | null>(null);
  const [selectedMapels, setSelectedMapels] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleResetPassword = (user: User) => {
    const res = StorageService.resetUserPassword(user.id);
    if (res.success) {
      onRefreshAll();
      showToast(`Kata sandi untuk ${user.nama} berhasil direset ke '${res.defaultPassword}'`);
    }
  };

  const handleOpenPasswordModal = (user: User) => {
    setPasswordModalUser(user);
    setAdminCustomPassword(user.password || 'guru123');
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (adminCustomPassword.trim().length < 4) {
      alert('Kata sandi minimal 4 karakter.');
      return;
    }
    const res = StorageService.updateUserPassword(passwordModalUser.id, adminCustomPassword.trim());
    if (res.success) {
      onRefreshAll();
      showToast(`Kata sandi untuk ${passwordModalUser.nama} berhasil diubah.`);
      setPasswordModalUser(null);
    } else {
      alert(res.message);
    }
  };

  const handleCopyCredentials = (user: User) => {
    const pass = user.password || (user.role === 'admin' ? 'admin123' : user.role === 'kepsek' ? 'kepsek123' : 'guru123');
    const roleText = user.role === 'kepsek' ? 'Kepala Sekolah' : user.role === 'admin' ? 'Administrator' : 'Guru Mata Pelajaran';
    const text = `*AKUN LOGIN E-JURNAL SMKN 1 SIDAYU*\nNama: ${user.nama}\nRole: ${roleText}\nUsername: ${user.username}\nNIP: ${formatNip(user.nip)}\nKata Sandi: ${pass}\nMapel: ${(user.mapel_diampu || []).join(', ')}`;
    navigator.clipboard.writeText(text);
    showToast(`Kredensial login ${user.nama} berhasil disalin!`);
  };

  // Quick Change User Role
  const handleChangeRole = (userId: string, newRole: UserRole, userName: string) => {
    const success = StorageService.updateUserRole(userId, newRole);
    if (success) {
      onRefreshAll();
      showToast(`Role untuk ${userName} berhasil diubah menjadi ${newRole.toUpperCase()}`);
    }
  };

  // Open Edit Mapel Modal from User row (Kelola Role tab)
  const openEditMapelFromUser = (user: User, teacher?: Guru) => {
    const initialMapels =
      user.mapel_diampu !== undefined
        ? user.mapel_diampu
        : teacher?.mapel_diampu || [];
    setEditingMapelTarget({
      userId: user.id,
      kodeGuru: user.kode_guru ?? teacher?.kode_guru,
      nip: user.nip && user.nip !== '-' ? user.nip : teacher?.nip,
      email: user.email || teacher?.email,
      nama: `${user.nama}${user.gelar ? `, ${user.gelar}` : ''}`,
    });
    setSelectedMapels([...initialMapels]);
  };

  // Open Edit Mapel Modal from Teacher row (66 Guru Resmi tab)
  const openEditMapel = (teacher: Guru) => {
    const cleanTeacherNip = StorageService.cleanNip(teacher.nip);
    const linkedUser = users.find(
      (u) =>
        (teacher.kode_guru != null && u.kode_guru === teacher.kode_guru) ||
        (cleanTeacherNip !== '-' && StorageService.cleanNip(u.nip) === cleanTeacherNip) ||
        (teacher.email && u.email && u.email.toLowerCase() === teacher.email.toLowerCase())
    );
    setEditingMapelTarget({
      userId: linkedUser?.id,
      kodeGuru: teacher.kode_guru,
      nip: teacher.nip,
      email: teacher.email || linkedUser?.email,
      nama: `${teacher.nama}${teacher.gelar ? `, ${teacher.gelar}` : ''}`,
    });
    setSelectedMapels([...(teacher.mapel_diampu || linkedUser?.mapel_diampu || [])]);
  };

  const handleSaveMapels = () => {
    if (!editingMapelTarget) return;
    const res = StorageService.updateGuruMapel(
      {
        userId: editingMapelTarget.userId,
        kodeGuru: editingMapelTarget.kodeGuru,
        nip: editingMapelTarget.nip,
        email: editingMapelTarget.email,
      },
      selectedMapels
    );

    if (res.success) {
      onRefreshAll();
      showToast(`Mata pelajaran untuk ${editingMapelTarget.nama} berhasil diperbarui!`);
    } else {
      showToast('Gagal memperbarui mata pelajaran guru.');
    }
    setEditingMapelTarget(null);
  };

  const toggleMapelSelection = (kode: string) => {
    setSelectedMapels((prev) =>
      prev.includes(kode) ? prev.filter((m) => m !== kode) : [...prev, kode]
    );
  };

  // Filtered Users for Role Management
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'SEMUA' ? true : u.role === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      query === '' ||
      u.nama.toLowerCase().includes(query) ||
      u.nip.includes(query) ||
      (u.kode_guru && String(u.kode_guru).includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.mapel_diampu && u.mapel_diampu.some((m) => m.toLowerCase().includes(query)));
    return matchRole && matchQuery;
  });

  // Filtered Teachers
  const filteredTeachers = teachers.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      query === '' ||
      t.nama.toLowerCase().includes(query) ||
      t.nip.includes(query) ||
      String(t.kode_guru).includes(query) ||
      t.mapel_diampu.some((m) => m.toLowerCase().includes(query))
    );
  });

  // Filtered Classes
  const filteredKelas = kelasList.filter((k) =>
    filterJurusan === 'SEMUA' ? true : k.jurusan === filterJurusan
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Manajemen Master &amp; Akses Role Administrator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Master Data &amp; Pengelolaan Role Guru (66 Guru &amp; 17 Mapel)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Disesuaikan dengan lampiran resmi SMKN 1 Sidayu: Kode Guru 1 s.d. 66 &amp; 17 Mata Pelajaran Kurikulum Merdeka.
          </p>
        </div>

        {/* Subtabs Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setSubTab('roles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'roles' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Kelola Role ({users.length})</span>
          </button>
          <button
            onClick={() => setSubTab('guru')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'guru' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>66 Guru Resmi</span>
          </button>
          <button
            onClick={() => setSubTab('mapel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'mapel' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>17 Mapel Resmi</span>
          </button>
          <button
            onClick={() => setSubTab('kelas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'kelas' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>33 Kelas</span>
          </button>
          <button
            onClick={() => setSubTab('jadwal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'jadwal' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Mengajar</span>
          </button>
          <button
            onClick={() => setSubTab('cptp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'cptp' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>CP &amp; TP</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: KELOLA ROLE & PENGGUNA (Fitur Permintaan Khusus Admin)          */}
      {/* ========================================================================= */}
      {subTab === 'roles' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <span>Panel Pengelolaan Hak Akses &amp; Role Pengguna</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat mengubah role pengguna (Guru, Kepala Sekolah, Administrator) secara instan dan menguji login.
              </p>
            </div>
            {/* Role Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['SEMUA', 'guru', 'kepsek', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg transition-colors capitalize ${
                    roleFilter === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'SEMUA' ? 'Semua' : r === 'guru' ? 'Guru' : r === 'kepsek' ? 'Kepsek' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Kode Guru (contoh: 59), Nama Guru, NIP, atau Mapel..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* User List with 1-Click Role Switcher */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredUsers.map((u) => {
              const cleanUserNip = StorageService.cleanNip(u.nip);
              const teacherObj = teachers.find(
                (t) =>
                  (u.kode_guru != null && t.kode_guru === u.kode_guru) ||
                  (cleanUserNip !== '-' && StorageService.cleanNip(t.nip) === cleanUserNip) ||
                  (u.email && t.email && t.email.toLowerCase() === u.email.toLowerCase())
              );
              const displayedMapels = u.mapel_diampu ?? teacherObj?.mapel_diampu ?? [];
              const currentPassword = u.password || (u.role === 'admin' ? 'admin123' : u.role === 'kepsek' ? 'kepsek123' : 'guru123');
              const isPasswordRevealed = revealedPasswordUserId === u.id;

              return (
                <div
                  key={u.id}
                  className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {u.kode_guru && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold">
                          Kode #{u.kode_guru}
                        </span>
                      )}
                      <span className="font-extrabold text-slate-900 text-sm">
                        {u.nama} {u.gelar ? `, ${u.gelar}` : ''}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'kepsek'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {u.role === 'kepsek' ? 'Kepala Sekolah' : u.role === 'admin' ? 'Administrator' : 'Guru Mapel'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>NIP: <strong className="font-mono text-slate-700 tracking-wide">{formatNip(u.nip)}</strong></span>
                      <span>•</span>
                      <span>Username: <strong className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">@{u.username}</strong></span>
                      <span>•</span>
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <KeyRound className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 font-medium">Sandi:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {isPasswordRevealed ? currentPassword : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedPasswordUserId(isPasswordRevealed ? null : u.id)}
                          className="text-slate-400 hover:text-slate-700 ml-0.5"
                          title={isPasswordRevealed ? 'Sembunyikan sandi' : 'Lihat sandi'}
                        >
                          {isPasswordRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {displayedMapels.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold text-slate-400">Mapel Diampu:</span>
                        {displayedMapels.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.2 rounded-sm bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Change Role, Manage Password & Simulate Login */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                    {/* Copy Credentials */}
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(u)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Salin username dan password untuk dikirim ke guru"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Salin Akun</span>
                    </button>

                    {/* Change Password */}
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal(u)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-semibold hover:bg-blue-50/50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Ubah kata sandi akun guru ini"
                    >
                      <KeyRound className="w-3 h-3 text-blue-600" />
                      <span>Ubah Sandi</span>
                    </button>

                    {/* Reset Password */}
                    <button
                      type="button"
                      onClick={() => handleResetPassword(u)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 text-slate-600 hover:text-amber-800 text-xs font-semibold hover:bg-amber-50/50 transition-colors flex items-center gap-1 cursor-pointer"
                      title={`Reset kata sandi akun ke default: ${u.role === 'admin' ? 'admin123' : u.role === 'kepsek' ? 'kepsek123' : 'guru123'}`}
                    >
                      <RefreshCw className="w-3 h-3 text-amber-600" />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditMapelFromUser(u, teacherObj)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Atur Mata Pelajaran yang Diampu"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Mapel</span>
                    </button>

                    {/* Role Quick Switch Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                      <button
                        onClick={() => handleChangeRole(u.id, 'guru', u.nama)}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          u.role === 'guru' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Ubah role menjadi Guru"
                      >
                        Guru
                      </button>
                      <button
                        onClick={() => handleChangeRole(u.id, 'kepsek', u.nama)}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          u.role === 'kepsek' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Ubah role menjadi Kepala Sekolah"
                      >
                        Kepsek
                      </button>
                      <button
                        onClick={() => handleChangeRole(u.id, 'admin', u.nama)}
                        className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          u.role === 'admin' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Ubah role menjadi Administrator"
                      >
                        Admin
                      </button>
                    </div>

                    {/* Quick Login As User */}
                    {onSelectUser && (
                      <button
                        onClick={() => {
                          onSelectUser(u);
                          showToast(`Sekarang masuk sebagai: ${u.nama}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Uji coba tampilan & fitur dari sudut pandang user ini"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-400" />
                        <span>Simulasi</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: DAFTAR GURU RESMI (66 Guru dari Lampiran Dokumen)               */}
      {/* ========================================================================= */}
      {subTab === 'guru' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Daftar 66 Guru Resmi SMKN 1 Sidayu Gresik</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkap dengan Kode Guru (1 s.d. 66), NIP resmi, email kedinasan, dan mata pelajaran yang diampu.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
              Total: {teachers.length} Guru Terdaftar
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru, NIP, atau kode guru (1-66)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-900 font-bold sticky top-0 uppercase text-[10px]">
                <tr className="border-b border-slate-200">
                  <th className="p-3 w-16 text-center">Kode</th>
                  <th className="p-3">Nama Lengkap Guru</th>
                  <th className="p-3 w-48">NIP</th>
                  <th className="p-3">Mata Pelajaran Diampu</th>
                  <th className="p-3 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t.kode_guru} className="hover:bg-slate-50/80">
                    <td className="p-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                      #{t.kode_guru}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{t.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.email}</div>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-700 tracking-wide">{formatNip(t.nip)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {t.mapel_diampu && t.mapel_diampu.length > 0 ? (
                          t.mapel_diampu.map((m) => (
                            <span
                              key={m}
                              className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100"
                            >
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openEditMapel(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors"
                      >
                        Ubah Mapel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: 17 MATA PELAJARAN RESMI (Sesuai Lampiran Dokumen)               */}
      {/* ========================================================================= */}
      {subTab === 'mapel' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>17 Mata Pelajaran Resmi SMKN 1 Sidayu Gresik</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar mata pelajaran resmi sesuai dokumen lampiran (PABP, PP, BIN, PJOK, SI, SB, BJ, MAT, BIG, INF, IPAS, DPK, MPKK, KIK, MPP, BK, KKA).
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {mapelList.length} Mata Pelajaran
            </div>
          </div>

          {/* Mapel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {mapelList.map((m) => {
              const teachersForMapel = teachers.filter((t) =>
                t.mapel_diampu && t.mapel_diampu.includes(m.kode)
              );
              return (
                <div
                  key={m.kode}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shadow-2xs">
                        {m.kode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        {m.kelompok || 'Umum'}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 leading-snug">
                      {m.nama}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs">
                    <span className="text-slate-500 font-semibold block mb-1">
                      Guru Pengampu ({teachersForMapel.length} Guru):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {teachersForMapel.length > 0 ? (
                        teachersForMapel.map((t) => (
                          <span
                            key={t.kode_guru}
                            className="px-1.5 py-0.5 rounded bg-white text-slate-800 text-[10px] font-semibold border border-slate-200"
                            title={t.nama}
                          >
                            #{t.kode_guru} {t.nama.split(' ')[0]}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum ada guru yang ditugaskan</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: 33 KELAS RESMI (TKR, TKJ, APHPi, TITL)                          */}
      {/* ========================================================================= */}
      {subTab === 'kelas' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                33 Kelas Resmi SMKN 1 Sidayu Gresik
              </h3>
              <p className="text-xs text-slate-500">
                TKR (12 Kelas), TKJ (9 Kelas), APHPi (6 Kelas), TITL (6 Kelas).
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {['SEMUA', 'TKR', 'TKJ', 'APHPi', 'TITL'].map((j) => (
                <button
                  key={j}
                  onClick={() => setFilterJurusan(j)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterJurusan === j ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredKelas.map((k) => (
              <div
                key={k.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-amber-400 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{k.nama}</div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Jurusan: <span className="text-blue-700 font-bold">{k.jurusan}</span> • Tingkat {k.tingkat}
                  </div>
                </div>
                <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                  {k.jumlah_siswa} Siswa
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: JADWAL MENGAJAR OTOMATIS                                        */}
      {/* ========================================================================= */}
      {subTab === 'jadwal' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Jadwal Mengajar Otomatis Guru
            </h3>
            <p className="text-xs text-slate-500">
              Jadwal mengajar terintegrasi dengan kode mata pelajaran resmi dan CP/TP.
            </p>
          </div>
          <div className="space-y-3">
            {jadwalList.map((j) => (
              <div
                key={j.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-xs">
                      {j.hari}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-xs">
                      {j.kelas}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{j.jam_ke}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                      {j.mapel_kode}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{j.guru_nama}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{j.mapel_nama}</div>
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900">Materi Pokok:</span> {j.materi_pokok}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: BANK CAPAIAN PEMBELAJARAN (CP, TP, ATP)                         */}
      {/* ========================================================================= */}
      {subTab === 'cptp' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Bank Capaian Pembelajaran (CP), TP, dan ATP Kurikulum Merdeka
          </h3>
          <div className="space-y-4">
            {cptpList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span>
                    {item.elemen} (Mapel: {item.mapel_kode})
                  </span>
                  <span className="font-mono text-slate-400">{item.id}</span>
                </div>
                <div>
                  <strong className="text-slate-900">Capaian Pembelajaran (CP):</strong>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{item.cp}</p>
                </div>
                <div>
                  <strong className="text-slate-900">Tujuan Pembelajaran (TP):</strong>
                  <p className="text-slate-700 mt-0.5 leading-relaxed whitespace-pre-line">{item.tp}</p>
                </div>
                <div>
                  <strong className="text-slate-900">Alur Tujuan Pembelajaran (ATP):</strong>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{item.atp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT MAPEL UNTUK GURU                                               */}
      {/* ========================================================================= */}
      {editingMapelTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Pilih Mata Pelajaran yang Diampu
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {editingMapelTarget.kodeGuru != null && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                      #{editingMapelTarget.kodeGuru}
                    </span>
                  )}
                  <span className="text-xs font-bold text-blue-700">{editingMapelTarget.nama}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMapelTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Centang mata pelajaran dari {mapelList.length} mapel resmi yang diajarkan:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {selectedMapels.length} Dipilih
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
              {mapelList.map((m) => {
                const isChecked = selectedMapels.includes(m.kode);
                return (
                  <button
                    key={m.kode}
                    type="button"
                    onClick={() => toggleMapelSelection(m.kode)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{m.kode}</span>
                      <span className="text-[11px] truncate block max-w-[130px]">{m.nama}</span>
                    </div>
                    {isChecked && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMapelTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMapels}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Mapel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UBAH KATA SANDI GURU / USER                                         */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Ubah Kata Sandi Akun
                  </h4>
                  <p className="text-[11px] text-slate-500">{passwordModalUser.nama}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={passwordModalUser.username}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="text"
                  value={adminCustomPassword}
                  onChange={(e) => setAdminCustomPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru (min 4 karakter)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-3 focus:ring-blue-100 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Sandi default sistem: <span className="font-mono text-blue-600">guru123</span> (atau NIP)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
