import React, { useState } from 'react';
import { User, AppConfig } from '../types';
import { formatNip } from '../utils/nipFormatter';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  School,
  Layers,
  PlusCircle,
  ShieldCheck,
  Settings,
  QrCode,
  Share2,
  KeyRound,
  LogOut,
  Users,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { ShareAppModal } from './common/ShareAppModal';
import { DEFAULT_LOGO_JATIM } from '../data/defaultLogos';

export interface SidebarProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingValidationCount: number;
  config: AppConfig;
  onOpenVerificationModal: () => void;
  onLogout?: () => void;
  onOpenChangePassword?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  users,
  onSelectUser,
  currentTab,
  onSelectTab,
  pendingValidationCount,
  config,
  onOpenVerificationModal,
  onLogout,
  onOpenChangePassword,
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.nama.toLowerCase().includes(q) ||
      u.nip.includes(q) ||
      (u.kode_guru && String(u.kode_guru).includes(q)) ||
      u.role.includes(q)
    );
  });

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const roleMeta = {
    admin: {
      label: 'Administrator Kurikulum',
      shortLabel: 'ADMIN',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      avatarBg: 'bg-amber-600 text-white',
      initials: 'AD',
      activeColor: 'bg-amber-600 text-white shadow-xs',
    },
    kepsek: {
      label: 'Kepala Sekolah',
      shortLabel: 'KEPSEK',
      badgeClass: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
      avatarBg: 'bg-purple-700 text-white',
      initials: 'KS',
      activeColor: 'bg-purple-700 text-white shadow-xs',
    },
    guru: {
      label: 'Guru Mata Pelajaran',
      shortLabel: 'GURU',
      badgeClass: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
      avatarBg: 'bg-blue-600 text-white',
      initials: currentUser.kode_guru ? `#${currentUser.kode_guru}` : 'GR',
      activeColor: 'bg-blue-600 text-white shadow-xs',
    },
  }[currentUser.role] || {
    label: 'Pengguna',
    shortLabel: 'USER',
    badgeClass: 'text-slate-400 bg-slate-800 border-slate-700',
    avatarBg: 'bg-slate-700 text-white',
    initials: 'US',
    activeColor: 'bg-slate-800 text-white shadow-xs',
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity lg:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      {/* SIDEBAR MAIN CONTAINER */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out no-print shadow-2xl w-72 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        {/* SIDEBAR HEADER / BRAND LOCKUP */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
              <img
                src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                alt="Logo SMKN 1 Sidayu"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black tracking-wider text-white uppercase truncate">
                E-JURNAL
              </div>
              <div className="text-[11px] font-semibold text-slate-400 truncate">
                SMKN 1 Sidayu Gresik
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Collapse / Close Button (Minimalkan ke Garis 3) */}
            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                if (onToggleCollapse) onToggleCollapse();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              title="Tutup Menu Sidebar (Minimalkan ke Garis 3)"
              aria-label="Tutup Menu Sidebar"
            >
              <X className="w-5 h-5 lg:hidden" />
              <ChevronLeft className="w-5 h-5 hidden lg:block" />
            </button>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* TEACHER FAST ACTION (GURU) */}
          {currentUser.role === 'guru' && (
            <div className="px-1">
              <button
                type="button"
                onClick={() => handleTabClick('guru-input')}
                title="⚡ Isi Jurnal Cepat (2 Menit)"
                className={`w-full group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200 border cursor-pointer ${
                  currentTab === 'guru-input'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-200 border-emerald-800/60 hover:border-emerald-600'
                } ${isCollapsed ? 'flex justify-center p-2.5' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      currentTab === 'guru-input'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">
                        Buat Jurnal Baru
                      </div>
                      <div className="text-[11px] text-emerald-200/80 mt-0.5 truncate">
                        Cepat &amp; Terstruktur
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* SECTION: MAIN ROLE MENU */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {currentUser.role === 'guru'
                  ? 'Menu Utama Guru'
                  : currentUser.role === 'kepsek'
                  ? 'Supervisi Kepala Sekolah'
                  : 'Manajemen Kurikulum'}
              </div>
            )}

            {/* GURU MENU */}
            {currentUser.role === 'guru' && (
              <>
                <button
                  type="button"
                  onClick={() => handleTabClick('guru-dashboard')}
                  title="Dashboard Guru"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'guru-dashboard'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span className="truncate">Dashboard Guru</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('guru-riwayat')}
                  title="Riwayat Jurnal Saya"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'guru-riwayat'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span className="truncate">Riwayat Jurnal Saya</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('laporan')}
                  title="Cetak & Ekspor Jurnal"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'laporan'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span className="truncate">Cetak &amp; Ekspor Jurnal</span>}
                </button>
              </>
            )}

            {/* KEPSEK MENU */}
            {currentUser.role === 'kepsek' && (
              <>
                <button
                  type="button"
                  onClick={() => handleTabClick('kepsek-dashboard')}
                  title="Dashboard Supervisi"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'kepsek-dashboard'
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <School className="w-4 h-4 shrink-0 text-purple-400" />
                  {!isCollapsed && <span className="truncate">Dashboard Supervisi</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('kepsek-validasi')}
                  title="Validasi Jurnal Guru"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'kepsek-validasi'
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">Validasi Jurnal</span>
                      {pendingValidationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums bg-amber-500 text-slate-950">
                          {pendingValidationCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && pendingValidationCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('laporan')}
                  title="Laporan Resmi (PDF & Excel)"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'laporan'
                      ? 'bg-purple-700 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-purple-400" />
                  {!isCollapsed && <span className="truncate">Laporan Resmi</span>}
                </button>
              </>
            )}

            {/* ADMIN MENU */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => handleTabClick('admin-input-data')}
                  title="⚡ Input & Perbarui Data"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'admin-input-data'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Input &amp; Perbarui Data</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('admin-master')}
                  title="Master Jurusan, Kelas & Jadwal"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'admin-master'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Master Jurusan &amp; Jadwal</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('admin-logo')}
                  title="Kelola Logo & Barcode TTD Resmi"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'admin-logo'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Kelola Logo &amp; TTD</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('admin-database')}
                  title="Database Google Spreadsheet"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'admin-database'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Database Spreadsheet</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('admin-apps-script')}
                  title="Kode Apps Script (Code.gs)"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'admin-apps-script'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Kode Apps Script</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('laporan')}
                  title="Semua Laporan"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    currentTab === 'laporan'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Semua Laporan</span>}
                </button>
              </>
            )}
          </div>

          {/* SECTION: UTILITIES */}
          <div className="space-y-1 pt-3 border-t border-slate-800/80">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Utilitas &amp; Dokumen
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenVerificationModal();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Verifikasi QR Dokumen"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <QrCode className="w-4 h-4 shrink-0 text-slate-400" />
              {!isCollapsed && <span className="truncate">Verifikasi QR Dokumen</span>}
            </button>

            {config.spreadsheet_id && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.spreadsheet_id}/edit`}
                target="_blank"
                rel="noreferrer"
                title="Buka Google Spreadsheet"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 transition-colors ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">Google Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                  </>
                )}
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                setShareModalOpen(true);
                if (onCloseMobile) onCloseMobile();
              }}
              title="Bagikan Link Aplikasi"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Share2 className="w-4 h-4 shrink-0 text-slate-400" />
              {!isCollapsed && <span className="truncate">Bagikan Link</span>}
            </button>
          </div>
        </div>

        {/* SIDEBAR FOOTER: USER SESSION & ACCOUNT SWITCH */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0 relative">
          {/* USER POPUP / DRAWER */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-300">Pengaturan Akun</span>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2.5 space-y-1.5">
                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <span>Ubah Kata Sandi</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShareModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Bagikan Link Aplikasi</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar dari Sistem</span>
                  </button>
                )}
              </div>

              {/* ADMIN USER SWITCH SECTION */}
              {currentUser.role === 'admin' && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Simulasi Akun ({users.length})
                    </span>
                  </div>

                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Cari guru..."
                      className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-800/60 pr-1">
                    {filteredUsers.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onSelectUser(u);
                            setUserMenuOpen(false);
                            setUserSearch('');
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full text-left py-1.5 px-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500/20 text-amber-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate max-w-[190px]">
                            {u.nama} {u.gelar ? `, ${u.gelar}` : ''}
                          </span>
                          {isCurrent && <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER CARD TRIGGER */}
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`rounded-xl bg-slate-900 border border-slate-800/80 p-2 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
            title={`${currentUser.nama} (${roleMeta.label})`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${roleMeta.avatarBg}`}
            >
              {roleMeta.initials}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wide tabular-nums truncate">
                  NIP {formatNip(currentUser.nip)}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </div>
        </div>
      </aside>

      {/* SHARE APP MODAL */}
      <ShareAppModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        appName="E-Jurnal Pembelajaran Mendalam"
        schoolName={config.sekolah || 'SMKN 1 Sidayu Gresik'}
      />
    </>
  );
};
