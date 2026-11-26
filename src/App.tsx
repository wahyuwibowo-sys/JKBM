import React, { useState, useEffect } from 'react';
import {
  User,
  JurnalPembelajaran,
  AppConfig,
  Guru,
  KelasItem,
  MapelItem,
  JadwalMengajar,
  KurikulumCPTP,
} from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { formatNip } from './utils/nipFormatter';
import { FileSpreadsheet, QrCode, Sparkles, LogOut, Share2, Menu } from 'lucide-react';
import { ShareAppModal } from './components/common/ShareAppModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { GuruDashboard } from './components/guru/GuruDashboard';
import { FastJournalForm } from './components/guru/FastJournalForm';
import { GuruJournalHistory } from './components/guru/GuruJournalHistory';
import { KepsekDashboard } from './components/kepsek/KepsekDashboard';
import { KepsekValidationList } from './components/kepsek/KepsekValidationList';
import { ReportPrintView } from './components/reports/ReportPrintView';
import { AdminMasterData } from './components/admin/AdminMasterData';
import { AdminDataInputManager } from './components/admin/AdminDataInputManager';
import { AdminLogoManager } from './components/admin/AdminLogoManager';
import { AdminSpreadsheetView } from './components/admin/AdminSpreadsheetView';
import { AdminAppsScriptCode } from './components/admin/AdminAppsScriptCode';
import { AdminJournalManager } from './components/admin/AdminJournalManager';
import { DEFAULT_LOGO_JATIM } from './data/defaultLogos';
import { VerificationModal } from './components/verification/VerificationModal';
import { JournalDetailModal } from './components/common/JournalDetailModal';
import {
  subscribeToFirestoreJurnals,
  flushPendingJurnalSyncs,
  loadConfigFromFirebase,
  syncUsersFromFirebase,
} from './services/firebaseService';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [teachers, setTeachers] = useState<Guru[]>(StorageService.getGuruList());
  const [kelasList, setKelasList] = useState<KelasItem[]>(StorageService.getKelasList());
  const [mapelList, setMapelList] = useState<MapelItem[]>(StorageService.getMapelList());
  const [jadwalList, setJadwalList] = useState<JadwalMengajar[]>(StorageService.getJadwalList());
  const [cptpList, setCptpList] = useState<KurikulumCPTP[]>(StorageService.getCPTPList());
  const [journals, setJournals] = useState<JurnalPembelajaran[]>(StorageService.getJurnalList());

  // Active User session from StorageService
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return StorageService.getActiveSession();
  });

  const [currentTab, setCurrentTab] = useState<string>('guru-dashboard');

  const [editingJurnal, setEditingJurnal] = useState<JurnalPembelajaran | null>(null);
  const [initialJadwalId, setInitialJadwalId] = useState<string | null>(null);
  const [viewingJurnal, setViewingJurnal] = useState<JurnalPembelajaran | null>(null);
  const [reviewingForValidation, setReviewingForValidation] = useState<JurnalPembelajaran | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [verificationJournal, setVerificationJournal] = useState<JurnalPembelajaran | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const refreshAllData = () => {
    setConfig(StorageService.getConfig());
    setUsers(StorageService.getUsers());
    setTeachers(StorageService.getGuruList());
    setKelasList(StorageService.getKelasList());
    setMapelList(StorageService.getMapelList());
    setJadwalList(StorageService.getJadwalList());
    setCptpList(StorageService.getCPTPList());
    setJournals(StorageService.getJurnalList());
    const active = StorageService.getActiveSession();
    if (active) {
      setCurrentUser(active);
    }
  };

  // Sinkronisasi awal konfigurasi sekolah, profil pengguna, & antrean offline saat aplikasi dimuat
  useEffect(() => {
    let active = true;

    loadConfigFromFirebase(StorageService.getConfig(), (patch) =>
      StorageService.saveConfig(patch, false)
    ).then((updatedCfg) => {
      if (active) setConfig(updatedCfg);
    });

    syncUsersFromFirebase(StorageService.getUsers(), (nextUsers) =>
      StorageService.saveUsers(nextUsers)
    ).then((updatedUsers) => {
      if (active) setUsers(updatedUsers);
    });

    flushPendingJurnalSyncs().catch(() => {});

    const handleOnline = () => {
      flushPendingJurnalSyncs().catch(() => {});
    };
    window.addEventListener('online', handleOnline);

    return () => {
      active = false;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Aktivasi listener realtime Firestore terukur (scoped by role) untuk 100 guru/hari, Kepsek, & Admin
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToFirestoreJurnals(
      {
        role: currentUser.role,
        nip: currentUser.nip,
        nama: currentUser.nama,
        gelar: currentUser.gelar,
      },
      () => StorageService.getJurnalList(),
      (list) => StorageService.saveJurnalList(list),
      (merged) => {
        setJournals(merged);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.nip, currentUser?.nama, currentUser?.gelar]);

  const handleSelectUser = (user: User) => {
    StorageService.setActiveSession(user);
    setCurrentUser(user);
    if (user.role === 'guru') {
      setCurrentTab('guru-dashboard');
    } else if (user.role === 'kepsek') {
      setCurrentTab('kepsek-dashboard');
    } else if (user.role === 'admin') {
      setCurrentTab('admin-master');
    }
    setEditingJurnal(null);
  };

  const handleLoginSuccess = (user: User) => {
    StorageService.setActiveSession(user);
    setCurrentUser(user);
    if (user.role === 'guru') {
      setCurrentTab('guru-dashboard');
    } else if (user.role === 'kepsek') {
      setCurrentTab('kepsek-dashboard');
    } else if (user.role === 'admin') {
      setCurrentTab('admin-master');
    }
    setEditingJurnal(null);
  };

  const handleLogout = () => {
    StorageService.setActiveSession(null);
    setCurrentUser(null);
    setEditingJurnal(null);
    setViewingJurnal(null);
    setReviewingForValidation(null);
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setEditingJurnal(null);
    setInitialJadwalId(null);
    setReviewingForValidation(null);
  };

  const pendingValidationCount = journals.filter((j) => j.status === 'Menunggu Validasi').length;

  const handleOpenNewJournal = (jadwalId?: string) => {
    setEditingJurnal(null);
    setInitialJadwalId(jadwalId || null);
    setCurrentTab('guru-input');
  };

  const handleJournalSaved = () => {
    refreshAllData();
    setCurrentTab('guru-riwayat');
    setEditingJurnal(null);
    setInitialJadwalId(null);
  };

  const handleOpenQRVerification = (journal: JurnalPembelajaran) => {
    setVerificationJournal(journal);
    setIsVerificationModalOpen(true);
  };

  // If user is not logged in, render the official Login View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans">
        <LoginView
          config={config}
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onOpenVerificationModal={() => {
            setVerificationJournal(null);
            setIsVerificationModalOpen(true);
          }}
        />

        <VerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          journal={verificationJournal}
          config={config}
          semester={new Date().getMonth() >= 6 ? 'Ganjil' : 'Genap'}
          guruNama="Ahmad Heru Wahyu Wibowo, S.Pd"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 print:bg-white flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Modern Responsive Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        pendingValidationCount={pendingValidationCount}
        config={config}
        onOpenVerificationModal={() => {
          setVerificationJournal(null);
          setIsVerificationModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Workspace Area (Offset by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 print:pl-0 print:bg-white print:m-0 print:p-0 ${
          isSidebarCollapsed ? 'pl-0 lg:pl-0' : 'lg:pl-72'
        }`}
      >
        {/* Unified Responsive Top Navigation Bar (Mobile & Desktop) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between no-print shadow-xs">
          {/* Left: Mobile Hamburger & Title / Desktop Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Toggle (Universal 3-line toggle for both Mobile & Desktop) */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileNavOpen((prev) => !prev);
                } else {
                  setIsSidebarCollapsed((prev) => !prev);
                }
              }}
              className="flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer items-center justify-center shrink-0"
              aria-label={isSidebarCollapsed ? 'Buka Sidebar (Menu)' : 'Tutup Sidebar (Menu)'}
              title={isSidebarCollapsed ? 'Buka Sidebar (Menu)' : 'Tutup Sidebar (Menu)'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Title */}
            <div className="lg:hidden flex items-center gap-2 min-w-0">
              <img
                src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                alt="Logo Jawa Timur"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                }}
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 leading-none truncate">
                  E-Jurnal SMKN 1 Sidayu
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  {currentTab === 'guru-dashboard' && 'Dashboard Guru'}
                  {currentTab === 'guru-input' && 'Isi Jurnal Cepat'}
                  {currentTab === 'guru-riwayat' && 'Riwayat Jurnal'}
                  {currentTab === 'kepsek-dashboard' && 'Supervisi Kepsek'}
                  {currentTab === 'kepsek-validasi' && 'Validasi Jurnal'}
                  {currentTab === 'admin-input-data' && 'Input Data Master'}
                  {currentTab === 'admin-master' && 'Master Data'}
                  {currentTab === 'admin-logo' && 'Kelola Logo & TTD'}
                  {currentTab === 'admin-database' && 'Database Spreadsheet'}
                  {currentTab === 'admin-apps-script' && 'Apps Script'}
                  {currentTab === 'admin-hapus-jurnal' && 'Hapus Jurnal'}
                  {currentTab === 'laporan' && 'Laporan'}
                </div>
              </div>
            </div>

            {/* Desktop Breadcrumb & Heading */}
            <div className="hidden lg:block min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">SMKN 1 Sidayu Gresik</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium">T.A. 2026/2027</span>
                <span aria-hidden="true">·</span>
                <span>Kepsek: {config.kepala_sekolah}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight mt-0.5 truncate">
                {currentTab === 'guru-dashboard' && 'Dashboard Guru'}
                {currentTab === 'guru-input' && 'Tulis Jurnal Mengajar'}
                {currentTab === 'guru-riwayat' && 'Riwayat Jurnal Mengajar'}
                {currentTab === 'kepsek-dashboard' && 'Dashboard Supervisi & Analisis'}
                {currentTab === 'kepsek-validasi' && 'Validasi & Penandatanganan Jurnal'}
                {currentTab === 'admin-input-data' && 'Input & Perbarui Data Master'}
                {currentTab === 'admin-master' && 'Master Jurusan, Kelas & Jadwal'}
                {currentTab === 'admin-logo' && 'Kelola Logo & Barcode Tanda Tangan Resmi'}
                {currentTab === 'admin-database' && 'Database Spreadsheet Google'}
                {currentTab === 'admin-apps-script' && 'Integrasi Google Apps Script (Code.gs)'}
                {currentTab === 'admin-hapus-jurnal' && 'Kelola & Hapus Jurnal Uji Coba Guru'}
                {currentTab === 'laporan' && 'Laporan Cetak & Ekspor Resmi'}
              </h1>
            </div>
          </div>

          {/* Right: Actions & User Preview */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {config.spreadsheet_id && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.spreadsheet_id}/edit`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs"
                title="Buka Google Spreadsheet Terhubung"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Spreadsheet</span>
                <span>↗</span>
              </a>
            )}

            <button
              onClick={() => {
                setVerificationJournal(null);
                setIsVerificationModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Periksa keabsahan dokumen via QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Verifikasi QR</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Bagikan tautan aplikasi ke rekan guru"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Bagikan</span>
            </button>

            {currentUser.role === 'guru' && currentTab !== 'guru-input' && (
              <button
                onClick={() => handleOpenNewJournal()}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-100" />
                <span>Buat Jurnal</span>
              </button>
            )}

            <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1"></div>

            <div className="hidden lg:flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.nama}
                  {currentUser.gelar ? `, ${currentUser.gelar}` : ''}
                </div>
                <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                  NIP {formatNip(currentUser.nip)}
                </div>
              </div>

              {handleLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Keluar dari akun saat ini"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white">
        {currentUser.role === 'guru' && (
          <>
            {currentTab === 'guru-dashboard' && (
              <GuruDashboard
                currentUser={currentUser}
                journals={journals}
                jadwalList={jadwalList}
                onOpenNewJournal={handleOpenNewJournal}
                onViewJournal={(j) => setViewingJurnal(j)}
                onEditJournal={(j) => {
                  setEditingJurnal(j);
                  setCurrentTab('guru-input');
                }}
              />
            )}
            {currentTab === 'guru-input' && (
              <FastJournalForm
                currentUser={currentUser}
                jadwalList={jadwalList}
                kelasList={kelasList}
                mapelList={mapelList}
                cptpList={cptpList}
                journals={journals}
                editingJurnal={editingJurnal}
                initialJadwalId={initialJadwalId}
                onSuccess={handleJournalSaved}
                onCancel={() => {
                  setInitialJadwalId(null);
                  setCurrentTab('guru-dashboard');
                }}
              />
            )}
            {currentTab === 'guru-riwayat' && (
              <GuruJournalHistory
                currentUser={currentUser}
                journals={journals}
                onViewJournal={(j) => setViewingJurnal(j)}
                onEditJournal={(j) => {
                  setEditingJurnal(j);
                  setCurrentTab('guru-input');
                }}
                onNewJournal={() => {
                  setEditingJurnal(null);
                  setCurrentTab('guru-input');
                }}
              />
            )}
          </>
        )}

        {currentUser.role === 'kepsek' && (
          <>
            {currentTab === 'kepsek-dashboard' && (
              <KepsekDashboard
                currentUser={currentUser}
                journals={journals}
                teachers={teachers}
                kelasList={kelasList}
                onOpenValidation={(j) => {
                  setReviewingForValidation(j);
                  setCurrentTab('kepsek-validasi');
                }}
                onSelectTab={handleSelectTab}
                onRefreshData={refreshAllData}
              />
            )}
            {currentTab === 'kepsek-validasi' && (
              <KepsekValidationList
                currentUser={currentUser}
                journals={journals}
                config={config}
                onRefreshData={refreshAllData}
                onOpenQRVerification={handleOpenQRVerification}
                selectedJournalForReview={reviewingForValidation}
                onCloseReviewModal={() => setReviewingForValidation(null)}
              />
            )}
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            {currentTab === 'admin-master' && (
              <AdminMasterData
                users={users}
                teachers={teachers}
                kelasList={kelasList}
                mapelList={mapelList}
                jadwalList={jadwalList}
                cptpList={cptpList}
                onRefreshAll={refreshAllData}
                onSelectUser={handleSelectUser}
              />
            )}
            {currentTab === 'admin-input-data' && (
              <AdminDataInputManager
                config={config}
                users={users}
                teachers={teachers}
                kelasList={kelasList}
                mapelList={mapelList}
                jadwalList={jadwalList}
                cptpList={cptpList}
                onUpdateConfig={(newCfg) => setConfig(newCfg)}
                onRefreshAllData={refreshAllData}
              />
            )}
            {currentTab === 'admin-logo' && (
              <AdminLogoManager
                config={config}
                onUpdateConfig={(newCfg) => setConfig(newCfg)}
              />
            )}
            {currentTab === 'admin-database' && (
              <AdminSpreadsheetView
                config={config}
                journals={journals}
                users={users}
                teachers={teachers}
                kelasList={kelasList}
                mapelList={mapelList}
                jadwalList={jadwalList}
                onUpdateConfig={(newCfg) => setConfig(newCfg)}
                onRefreshAllData={refreshAllData}
              />
            )}
            {currentTab === 'admin-apps-script' && <AdminAppsScriptCode config={config} />}
            {currentTab === 'admin-hapus-jurnal' && (
              <AdminJournalManager
                journals={journals}
                teachers={teachers}
                onViewJournal={(j) => setViewingJurnal(j)}
                onRefreshAllData={refreshAllData}
              />
            )}
          </>
        )}

        {currentTab === 'laporan' && (
          <ReportPrintView
            journals={journals}
            teachers={teachers}
            kelasList={kelasList}
            mapelList={mapelList}
            config={config}
            currentUser={currentUser}
          />
        )}
      </main>

        <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                alt="Jawa Timur"
                className="h-6 w-auto"
              />
              <span className="font-bold text-slate-700">
                SMKN 1 Sidayu Gresik
              </span>
              <span>• E-Jurnal Pembelajaran Mendalam</span>
            </div>
            <div>
              Kepala Sekolah: <strong className="text-slate-800">{config.kepala_sekolah}</strong> • Terverifikasi Google Apps Script &amp; Spreadsheet
            </div>
          </div>
        </footer>
      </div>

      <JournalDetailModal
        journal={viewingJurnal}
        config={config}
        onClose={() => setViewingJurnal(null)}
        onOpenQRVerification={handleOpenQRVerification}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        journal={verificationJournal}
        config={config}
        semester={
          verificationJournal?.tanggal
            ? parseInt(verificationJournal.tanggal.split('-')[1], 10) >= 7
              ? 'Ganjil'
              : 'Genap'
            : new Date().getMonth() >= 6
            ? 'Ganjil'
            : 'Genap'
        }
        guruNama={
          verificationJournal?.guru_nama ||
          (currentUser.role === 'guru'
            ? `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`
            : 'Ahmad Heru Wahyu Wibowo, S.Pd')
        }
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          refreshAllData();
        }}
      />

      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        appName="E-Jurnal Pembelajaran Mendalam"
        schoolName={config.sekolah || 'SMKN 1 Sidayu Gresik'}
      />
    </div>
  );
}
