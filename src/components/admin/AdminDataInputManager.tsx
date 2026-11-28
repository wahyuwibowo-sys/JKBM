import React, { useState } from 'react';
import {
  AppConfig,
  User,
  Guru,
  KelasItem,
  MapelItem,
  JadwalMengajar,
  KurikulumCPTP,
  UserRole,
} from '../../types';
import { StorageService } from '../../services/storageService';
import {
  syncUserToFirebase,
  syncCPTPToFirebase,
  deleteCPTPFromFirebase,
  addDeletedSeedCptpIds,
  SEED_CPTP_IDS,
} from '../../services/firebaseService';
import { formatNip } from '../../utils/nipFormatter';
import { analyzeTPForATP, generateATPFromTP } from '../../utils/narrativeGenerator';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Users,
  BookOpen,
  Layers,
  Calendar,
  Award,
  Settings,
  Sparkles,
  Search,
  X,
  AlertCircle,
  Shield,
  KeyRound,
} from 'lucide-react';

interface AdminDataInputManagerProps {
  config: AppConfig;
  users: User[];
  teachers: Guru[];
  kelasList: KelasItem[];
  mapelList: MapelItem[];
  jadwalList: JadwalMengajar[];
  cptpList: KurikulumCPTP[];
  onUpdateConfig: (newConfig: AppConfig) => void;
  onRefreshAllData: () => void;
}

type InputSection = 'guru' | 'mapel' | 'kelas' | 'jadwal' | 'cptp' | 'sekolah';

export const AdminDataInputManager: React.FC<AdminDataInputManagerProps> = ({
  config,
  users,
  teachers,
  kelasList,
  mapelList,
  jadwalList,
  cptpList,
  onUpdateConfig,
  onRefreshAllData,
}) => {
  const [activeSection, setActiveSection] = useState<InputSection>('guru');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3500);
  };

  // ==========================================
  // 1. STATE & HANDLERS: GURU & AKUN
  // ==========================================
  const [guruEditKey, setGuruEditKey] = useState<{ kode_guru: number; nip: string } | null>(null);
  const guruEditId = guruEditKey ? guruEditKey.nip : null;
  const [guruForm, setGuruForm] = useState<{
    kode_guru: number;
    nama: string;
    gelar: string;
    nip: string;
    email: string;
    role: UserRole;
    mapel_diampu: string[];
    jurusan: string[];
    password: string;
  }>({
    kode_guru: (teachers.length > 0 ? Math.max(...teachers.map((t) => t.kode_guru || 0)) + 1 : 1),
    nama: '',
    gelar: 'S.Pd',
    nip: '',
    email: '',
    role: 'guru',
    mapel_diampu: [],
    jurusan: ['Semua'],
    password: 'guru123',
  });

  const resetGuruForm = () => {
    setGuruEditKey(null);
    const nextCode = teachers.length > 0 ? Math.max(...teachers.map((t) => t.kode_guru || 0)) + 1 : 1;
    setGuruForm({
      kode_guru: nextCode,
      nama: '',
      gelar: 'S.Pd',
      nip: '',
      email: '',
      role: 'guru',
      mapel_diampu: [],
      jurusan: ['Semua'],
      password: 'guru123',
    });
  };

  const handleEditGuru = (g: Guru) => {
    setGuruEditKey({ kode_guru: g.kode_guru, nip: g.nip });
    const cleanGNip = StorageService.cleanNip(g.nip);
    const linkedUser = users.find(
      (u) =>
        (g.kode_guru != null && u.kode_guru === g.kode_guru) ||
        (cleanGNip !== '-' && StorageService.cleanNip(u.nip) === cleanGNip)
    );
    setGuruForm({
      kode_guru: g.kode_guru,
      nama: g.nama,
      gelar: g.gelar || linkedUser?.gelar || '',
      nip: g.nip,
      email: g.email || '',
      role: linkedUser?.role || 'guru',
      mapel_diampu: g.mapel_diampu || [],
      jurusan: g.jurusan || ['Semua'],
      password: linkedUser?.password || 'guru123',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruForm.nama.trim()) {
      showError('Nama guru wajib diisi');
      return;
    }

    const nipClean = StorageService.cleanNip(guruForm.nip);
    const emailClean = guruForm.email.trim() || `${guruForm.nama.toLowerCase().replace(/[^a-z0-9]/g, '.')}@smkn1sidayu.sch.id`;

    // 1. Update Guru List
    const currentTeachers = [...StorageService.getGuruList()];
    const guruData: Guru = {
      kode_guru: Number(guruForm.kode_guru) || 1,
      nama: guruForm.nama.trim(),
      nip: nipClean,
      email: emailClean,
      gelar: guruForm.gelar.trim(),
      mapel_diampu: guruForm.mapel_diampu,
      jurusan: guruForm.jurusan,
    };

    if (guruEditKey) {
      const idx = currentTeachers.findIndex(
        (t) =>
          t.kode_guru === guruEditKey.kode_guru ||
          (guruEditKey.nip !== '-' && t.nip === guruEditKey.nip)
      );
      if (idx >= 0) currentTeachers[idx] = guruData;
      else currentTeachers.push(guruData);
    } else {
      currentTeachers.push(guruData);
    }
    StorageService.saveGuruList(currentTeachers);

    // 2. Sync to Users List
    const currentUsers = [...StorageService.getUsers()];
    const usernameClean = guruForm.nama.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
    const existingUserIdx = currentUsers.findIndex(
      (u) =>
        (guruEditKey && u.kode_guru === guruEditKey.kode_guru) ||
        (guruEditKey && guruEditKey.nip !== '-' && u.nip === guruEditKey.nip) ||
        (nipClean !== '-' && u.nip === nipClean) ||
        (u.kode_guru != null && u.kode_guru === guruForm.kode_guru)
    );

    const userData: User = {
      id: existingUserIdx >= 0 ? currentUsers[existingUserIdx].id : `USR-GURU-${String(guruForm.kode_guru).padStart(2, '0')}`,
      username: existingUserIdx >= 0 ? currentUsers[existingUserIdx].username : usernameClean,
      password: guruForm.password.trim() || 'guru123',
      nama: guruForm.nama.trim(),
      nip: nipClean,
      role: guruForm.role,
      kode_guru: Number(guruForm.kode_guru),
      gelar: guruForm.gelar.trim(),
      email: emailClean,
      mapel_diampu: guruForm.mapel_diampu,
      jurusan: guruForm.jurusan,
    };

    if (existingUserIdx >= 0) {
      currentUsers[existingUserIdx] = userData;
    } else {
      currentUsers.push(userData);
    }
    StorageService.saveUsers(currentUsers);
    syncUserToFirebase(userData).catch(() => {});

    onRefreshAllData();
    showSuccess(`Data Guru "${guruForm.nama}" berhasil ${guruEditKey ? 'diperbarui' : 'ditambahkan'}!`);
    resetGuruForm();
  };

  const handleDeleteGuru = (nip: string, nama: string, kodeGuru?: number) => {
    if (!window.confirm(`Yakin ingin menghapus guru "${nama}" (NIP: ${nip})?`)) return;
    const currentTeachers = StorageService.getGuruList().filter((t) =>
      kodeGuru != null ? t.kode_guru !== kodeGuru : t.nip !== nip
    );
    StorageService.saveGuruList(currentTeachers);

    const currentUsers = StorageService.getUsers().filter((u) =>
      kodeGuru != null ? u.kode_guru !== kodeGuru : u.nip !== nip
    );
    StorageService.saveUsers(currentUsers);

    onRefreshAllData();
    showSuccess(`Guru "${nama}" berhasil dihapus.`);
  };

  // ==========================================
  // 2. STATE & HANDLERS: MATA PELAJARAN
  // ==========================================
  const [mapelEditKode, setMapelEditKode] = useState<string | null>(null);
  const [mapelForm, setMapelForm] = useState<MapelItem>({
    kode: '',
    nama: '',
    kelompok: 'Kejuruan',
  });

  const handleEditMapel = (m: MapelItem) => {
    setMapelEditKode(m.kode);
    setMapelForm({ ...m });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelForm.kode.trim() || !mapelForm.nama.trim()) {
      showError('Kode dan Nama Mapel wajib diisi');
      return;
    }

    const currentMapel = [...StorageService.getMapelList()];
    const itemData: MapelItem = {
      kode: mapelForm.kode.trim().toUpperCase(),
      nama: mapelForm.nama.trim(),
      kelompok: mapelForm.kelompok || 'Kejuruan',
    };

    if (mapelEditKode) {
      const idx = currentMapel.findIndex((m) => m.kode === mapelEditKode);
      if (idx >= 0) currentMapel[idx] = itemData;
      else currentMapel.push(itemData);
    } else {
      currentMapel.push(itemData);
    }

    StorageService.saveMapelList(currentMapel);
    onRefreshAllData();
    showSuccess(`Mata Pelajaran "${itemData.nama}" berhasil disimpan!`);
    setMapelEditKode(null);
    setMapelForm({ kode: '', nama: '', kelompok: 'Kejuruan' });
  };

  const handleDeleteMapel = (kode: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus Mapel "${nama}" (${kode})?`)) return;
    const currentMapel = StorageService.getMapelList().filter((m) => m.kode !== kode);
    StorageService.saveMapelList(currentMapel);
    onRefreshAllData();
    showSuccess(`Mapel "${nama}" berhasil dihapus.`);
  };

  // ==========================================
  // 3. STATE & HANDLERS: KELAS
  // ==========================================
  const [kelasEditId, setKelasEditId] = useState<string | null>(null);
  const [kelasForm, setKelasForm] = useState<KelasItem>({
    id: '',
    nama: '',
    jurusan: 'TKJ',
    tingkat: 'X',
    jumlah_siswa: 36,
  });

  const handleEditKelas = (k: KelasItem) => {
    setKelasEditId(k.id);
    setKelasForm({ ...k });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasForm.nama.trim()) {
      showError('Nama kelas wajib diisi');
      return;
    }

    const currentKelas = [...StorageService.getKelasList()];
    const idClean = kelasEditId || `CLS-${kelasForm.nama.toUpperCase().replace(/\s+/g, '-')}`;
    const itemData: KelasItem = {
      id: idClean,
      nama: kelasForm.nama.trim().toUpperCase(),
      jurusan: kelasForm.jurusan,
      tingkat: kelasForm.tingkat,
      jumlah_siswa: Number(kelasForm.jumlah_siswa) || 36,
    };

    if (kelasEditId) {
      const idx = currentKelas.findIndex((k) => k.id === kelasEditId);
      if (idx >= 0) currentKelas[idx] = itemData;
      else currentKelas.push(itemData);
    } else {
      currentKelas.push(itemData);
    }

    StorageService.saveKelasList(currentKelas);
    onRefreshAllData();
    showSuccess(`Kelas "${itemData.nama}" berhasil disimpan!`);
    setKelasEditId(null);
    setKelasForm({ id: '', nama: '', jurusan: 'TKJ', tingkat: 'X', jumlah_siswa: 36 });
  };

  const handleDeleteKelas = (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus kelas "${nama}"?`)) return;
    const currentKelas = StorageService.getKelasList().filter((k) => k.id !== id);
    StorageService.saveKelasList(currentKelas);
    onRefreshAllData();
    showSuccess(`Kelas "${nama}" berhasil dihapus.`);
  };

  // ==========================================
  // 4. STATE & HANDLERS: JADWAL MENGAJAR
  // ==========================================
  const [jadwalEditId, setJadwalEditId] = useState<string | null>(null);
  const [jadwalForm, setJadwalForm] = useState<JadwalMengajar>({
    id: '',
    guru_nip: teachers[0]?.nip || '',
    guru_nama: teachers[0]?.nama || '',
    hari: 'Senin',
    jam_ke: 'Jam 1 - 4 (07.00 - 09.40)',
    kelas: kelasList[0]?.nama || 'X TKJ 1',
    mapel_kode: mapelList[0]?.kode || 'INF',
    mapel_nama: mapelList[0]?.nama || 'Informatika',
    materi_pokok: '',
    cp: '',
    tp: '',
    atp: '',
  });

  const handleEditJadwal = (j: JadwalMengajar) => {
    setJadwalEditId(j.id);
    setJadwalForm({ ...j });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const currentJadwal = [...StorageService.getJadwalList()];
    const selectedGuru = teachers.find((t) => t.nip === jadwalForm.guru_nip);
    const selectedMapel = mapelList.find((m) => m.kode === jadwalForm.mapel_kode);

    const idClean = jadwalEditId || `JADWAL-${Date.now()}`;
    const itemData: JadwalMengajar = {
      ...jadwalForm,
      id: idClean,
      guru_nama: selectedGuru?.nama || jadwalForm.guru_nama,
      mapel_nama: selectedMapel?.nama || jadwalForm.mapel_nama,
    };

    if (jadwalEditId) {
      const idx = currentJadwal.findIndex((j) => j.id === jadwalEditId);
      if (idx >= 0) currentJadwal[idx] = itemData;
      else currentJadwal.push(itemData);
    } else {
      currentJadwal.push(itemData);
    }

    StorageService.saveJadwalList(currentJadwal);
    onRefreshAllData();
    showSuccess(`Jadwal "${itemData.mapel_nama} - ${itemData.kelas}" berhasil disimpan!`);
    setJadwalEditId(null);
  };

  const handleDeleteJadwal = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus jadwal mengajar ini?')) return;
    const currentJadwal = StorageService.getJadwalList().filter((j) => j.id !== id);
    StorageService.saveJadwalList(currentJadwal);
    onRefreshAllData();
    showSuccess('Jadwal mengajar berhasil dihapus.');
  };

  // ==========================================
  // 5. STATE & HANDLERS: BANK CP, TP & MATERI
  // ==========================================
  const [cptpEditId, setCptpEditId] = useState<string | null>(null);
  const [cptpFilterMapel, setCptpFilterMapel] = useState<string>('all');
  const [cptpSearch, setCptpSearch] = useState<string>('');
  const [isAtpAutoMode, setIsAtpAutoMode] = useState<boolean>(true);
  const [cptpForm, setCptpForm] = useState<KurikulumCPTP>({
    id: '',
    mapel_kode: mapelList[0]?.kode || 'MPKK',
    fase: 'F',
    elemen: '',
    materi_pokok: '',
    cp: '',
    tp: '',
    atp: '',
  });

  const updateCptpField = (patch: Partial<KurikulumCPTP>) => {
    setCptpForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.tp !== undefined && isAtpAutoMode) {
        next.atp = generateATPFromTP(next.tp);
      }
      return next;
    });
  };

  const tpAnalysis = analyzeTPForATP(cptpForm.tp);

  const handleGenerateAutoATP = () => {
    const generated = generateATPFromTP(cptpForm.tp);

    if (generated) {
      setIsAtpAutoMode(true);
      setCptpForm((prev) => ({ ...prev, atp: generated }));
      return;
    }

    showError('Isi Tujuan Pembelajaran (TP) terlebih dahulu untuk membuat ATP otomatis.');
  };

  const resetCptpForm = () => {
    setCptpEditId(null);
    setIsAtpAutoMode(true);
    setCptpForm({
      id: '',
      mapel_kode: mapelList[0]?.kode || 'MPKK',
      fase: 'F',
      elemen: '',
      materi_pokok: '',
      cp: '',
      tp: '',
      atp: '',
    });
  };

  const handleEditCPTP = (item: KurikulumCPTP) => {
    setCptpEditId(item.id);
    setIsAtpAutoMode(!item.atp || !item.atp.trim());
    setCptpForm({ ...item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCPTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cptpForm.materi_pokok?.trim() && !cptpForm.cp?.trim() && !cptpForm.tp?.trim()) {
      showError('Harap lengkapi minimal Materi Pokok, CP, atau TP.');
      return;
    }
    const currentList = [...StorageService.getCPTPList()];
    const cleanId = cptpEditId || `CPTP-${Date.now()}`;
    const trimmedAtp = (cptpForm.atp || '').trim();
    const finalAtp = trimmedAtp || generateATPFromTP(cptpForm.tp);

    const payload: KurikulumCPTP = {
      ...cptpForm,
      id: cleanId,
      materi_pokok: (cptpForm.materi_pokok || '').trim(),
      elemen: (cptpForm.elemen || '').trim(),
      cp: (cptpForm.cp || '').trim(),
      tp: (cptpForm.tp || '').trim(),
      atp: finalAtp,
    };

    if (cptpEditId) {
      const idx = currentList.findIndex((c) => c.id === cptpEditId);
      if (idx >= 0) currentList[idx] = payload;
      else currentList.push(payload);
    } else {
      currentList.push(payload);
    }

    StorageService.saveCPTPList(currentList);
    syncCPTPToFirebase(payload).catch(() => {});
    onRefreshAllData();
    showSuccess(`Item Kurikulum & Materi "${payload.materi_pokok || payload.elemen || payload.id}" berhasil disimpan!`);
    resetCptpForm();
  };

  const handleDeleteCPTP = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus item CP/TP/Materi ini dari bank kurikulum?')) return;
    const currentList = StorageService.getCPTPList().filter((c) => c.id !== id);
    StorageService.saveCPTPList(currentList);
    deleteCPTPFromFirebase(id).catch(() => {});
    if (SEED_CPTP_IDS.has(id)) {
      const deletedSeeds = addDeletedSeedCptpIds([id]);
      const updatedCfg = StorageService.saveConfig({ deleted_cptp_ids: deletedSeeds });
      onUpdateConfig(updatedCfg);
    }
    onRefreshAllData();
    showSuccess('Item CP/TP/Materi berhasil dihapus.');
  };

  // ==========================================
  // 6. STATE & HANDLERS: IDENTITAS SEKOLAH
  // ==========================================
  const [sekolahForm, setSekolahForm] = useState({
    sekolah: config.sekolah || 'SMKN 1 Sidayu Gresik',
    kepala_sekolah: config.kepala_sekolah || 'Arni Sulistyowati, S.Pd., M.M.',
    nip_kepala_sekolah: config.nip_kepala_sekolah || '196909061997032004',
    tahun_ajaran: config.tahun_ajaran || '2026/2027',
    semester: config.semester || 'Ganjil',
  });

  const handleSaveSekolah = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.saveConfig({
      sekolah: sekolahForm.sekolah.trim(),
      kepala_sekolah: sekolahForm.kepala_sekolah.trim(),
      nip_kepala_sekolah: formatNip(sekolahForm.nip_kepala_sekolah),
      tahun_ajaran: sekolahForm.tahun_ajaran.trim(),
      semester: sekolahForm.semester,
    });
    onUpdateConfig(updated);
    onRefreshAllData();
    showSuccess('Identitas Sekolah & Kepala Sekolah berhasil diperbarui!');
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Pusat Input &amp; Perbaruan Data Master Sistem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Input &amp; Perbarui Data Master
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1.5 leading-relaxed">
            Formulir resmi Administrator Kurikulum untuk menambah guru baru, mengedit data guru, menambah mata pelajaran, mengubah kelas, jadwal mengajar, dan data sekolah.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSection('guru')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'guru'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Guru &amp; Akun ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('mapel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'mapel'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Mata Pelajaran ({mapelList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('kelas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'kelas'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Kelas ({kelasList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('jadwal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'jadwal'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>4. Jadwal Mengajar ({jadwalList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('cptp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'cptp'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>5. Bank CP, TP &amp; Materi ({cptpList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('sekolah')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'sekolah'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>6. Identitas Sekolah &amp; Kepsek</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECTION: GURU & AKUN                                                   */}
      {/* ========================================================================= */}
      {activeSection === 'guru' && (
        <div className="space-y-6">
          {/* Form Input Guru */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {guruEditId ? 'Edit Data Guru' : 'Tambah / Input Guru Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {guruEditId ? `Memperbarui data guru NIP: ${guruEditId}` : 'Menambahkan dewan guru baru ke dalam database dan sistem login.'}
                  </p>
                </div>
              </div>

              {guruEditId && (
                <button
                  type="button"
                  onClick={resetGuruForm}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal Edit / Tambah Baru
                </button>
              )}
            </div>

            <form onSubmit={handleSaveGuru} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kode Guru (1 s.d. 99) *
                  </label>
                  <input
                    type="number"
                    value={guruForm.kode_guru}
                    onChange={(e) => setGuruForm({ ...guruForm, kode_guru: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Guru (Tanpa Gelar) *
                  </label>
                  <input
                    type="text"
                    value={guruForm.nama}
                    onChange={(e) => setGuruForm({ ...guruForm, nama: e.target.value })}
                    placeholder="Contoh: Ahmad Heru Wahyu Wibowo"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gelar Akademik
                  </label>
                  <input
                    type="text"
                    value={guruForm.gelar}
                    onChange={(e) => setGuruForm({ ...guruForm, gelar: e.target.value })}
                    placeholder="Contoh: S.Pd, S.Kom, Gr."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk Pegawai (NIP) *
                  </label>
                  <input
                    type="text"
                    value={guruForm.nip}
                    onChange={(e) => setGuruForm({ ...guruForm, nip: e.target.value })}
                    onBlur={() => setGuruForm({ ...guruForm, nip: formatNip(guruForm.nip) })}
                    placeholder="Contoh: 198312162024211002 atau -"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 font-mono tracking-wide"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format angka tanpa spasi (karakter non-numerik dan spasi dibersihkan otomatis).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={guruForm.email}
                    onChange={(e) => setGuruForm({ ...guruForm, email: e.target.value })}
                    placeholder="Contoh: ahmad.wibowo@smkn1sidayu.sch.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hak Akses / Role Akun
                  </label>
                  <select
                    value={guruForm.role}
                    onChange={(e) => setGuruForm({ ...guruForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 capitalize"
                  >
                    <option value="guru">Guru Mata Pelajaran</option>
                    <option value="kepsek">Kepala Sekolah</option>
                    <option value="admin">Administrator Kurikulum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Akun
                  </label>
                  <input
                    type="text"
                    value={guruForm.password}
                    onChange={(e) => setGuruForm({ ...guruForm, password: e.target.value })}
                    placeholder="Bawaan: guru123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Sandi bawaan untuk akun guru adalah guru123.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu (Pilih):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {mapelList.map((m) => {
                      const isChecked = guruForm.mapel_diampu.includes(m.kode);
                      return (
                        <button
                          key={m.kode}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setGuruForm({ ...guruForm, mapel_diampu: guruForm.mapel_diampu.filter((c) => c !== m.kode) });
                            } else {
                              setGuruForm({ ...guruForm, mapel_diampu: [...guruForm.mapel_diampu, m.kode] });
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {m.kode} - {m.nama}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{guruEditId ? 'Simpan Perubahan Guru' : 'Simpan Guru Baru'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabel Daftar Guru yang Ada */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">
              Daftar Dewan Guru &amp; Akun Terdaftar ({teachers.length} Guru)
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 uppercase text-[10px]">
                  <tr className="border-b border-slate-200">
                    <th className="p-3 w-14 text-center">Kode</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">NIP</th>
                    <th className="p-3">Mapel Diampu</th>
                    <th className="p-3 w-32 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => (
                    <tr key={t.nip + t.kode_guru} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-mono font-bold bg-slate-50/50">#{t.kode_guru}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{t.nama} {t.gelar ? `, ${t.gelar}` : ''}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.email}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{t.nip}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(t.mapel_diampu || ['-']).map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditGuru(t)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                            title="Edit data guru"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGuru(t.nip, t.nama, t.kode_guru)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTION: MATA PELAJARAN                                                */}
      {/* ========================================================================= */}
      {activeSection === 'mapel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {mapelEditKode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>

            <form onSubmit={handleSaveMapel} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Mapel *</label>
                <input
                  type="text"
                  value={mapelForm.kode}
                  onChange={(e) => setMapelForm({ ...mapelForm, kode: e.target.value.toUpperCase() })}
                  placeholder="Contoh: KKA"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  value={mapelForm.nama}
                  onChange={(e) => setMapelForm({ ...mapelForm, nama: e.target.value })}
                  placeholder="Contoh: Koding dan Kecerdasan Artifisial"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelompok</label>
                <select
                  value={mapelForm.kelompok}
                  onChange={(e) => setMapelForm({ ...mapelForm, kelompok: e.target.value as MapelItem['kelompok'] })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Umum">Umum</option>
                  <option value="Kejuruan">Kejuruan</option>
                  <option value="Bimbingan">Bimbingan</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                {mapelEditKode && (
                  <button
                    type="button"
                    onClick={() => {
                      setMapelEditKode(null);
                      setMapelForm({ kode: '', nama: '', kelompok: 'Kejuruan' });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Mata Pelajaran</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">
              Daftar Mata Pelajaran Terdaftar ({mapelList.length} Mapel)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mapelList.map((m) => (
                <div key={m.kode} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px]">
                      {m.kode}
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-900 mt-1">{m.nama}</h5>
                    <span className="text-[10px] text-slate-500">{m.kelompok || 'Kejuruan'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditMapel(m)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMapel(m.kode, m.nama)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION: KELAS                                                         */}
      {/* ========================================================================= */}
      {activeSection === 'kelas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {kelasEditId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </h3>

            <form onSubmit={handleSaveKelas} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  value={kelasForm.nama}
                  onChange={(e) => setKelasForm({ ...kelasForm, nama: e.target.value })}
                  placeholder="Contoh: X TKJ 3"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jurusan</label>
                <select
                  value={kelasForm.jurusan}
                  onChange={(e) => setKelasForm({ ...kelasForm, jurusan: e.target.value as KelasItem['jurusan'] })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="TKJ">TKJ (Teknik Komputer &amp; Jaringan)</option>
                  <option value="TKR">TKR (Teknik Kendaraan Ringan)</option>
                  <option value="APHPi">APHPi (Agribisnis Pengolahan Hasil Perikanan)</option>
                  <option value="TITL">TITL (Teknik Instalasi Tenaga Listrik)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                <select
                  value={kelasForm.tingkat}
                  onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value as KelasItem['tingkat'] })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Siswa</label>
                <input
                  type="number"
                  value={kelasForm.jumlah_siswa}
                  onChange={(e) => setKelasForm({ ...kelasForm, jumlah_siswa: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                {kelasEditId && (
                  <button
                    type="button"
                    onClick={() => {
                      setKelasEditId(null);
                      setKelasForm({ id: '', nama: '', jurusan: 'TKJ', tingkat: 'X', jumlah_siswa: 36 });
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kelas</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">
              Daftar Kelas Terdaftar ({kelasList.length} Kelas)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {kelasList.map((k) => (
                <div key={k.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">{k.nama}</h5>
                    <span className="text-[10px] text-blue-700 font-bold">{k.jurusan} • Tingkat {k.tingkat}</span>
                    <span className="block text-[10px] text-slate-500">{k.jumlah_siswa} Siswa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditKelas(k)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKelas(k.id, k.nama)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION: JADWAL MENGAJAR                                               */}
      {/* ========================================================================= */}
      {activeSection === 'jadwal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {jadwalEditId ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Baru'}
            </h3>

            <form onSubmit={handleSaveJadwal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu *</label>
                  <select
                    value={jadwalForm.guru_nip}
                    onChange={(e) => {
                      const g = teachers.find((t) => t.nip === e.target.value);
                      setJadwalForm({
                        ...jadwalForm,
                        guru_nip: e.target.value,
                        guru_nama: g ? g.nama : '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {teachers.map((t) => (
                      <option key={`${t.kode_guru}-${t.nip}`} value={t.nip}>
                        #{t.kode_guru} {t.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari *</label>
                  <select
                    value={jadwalForm.hari}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, hari: e.target.value as JadwalMengajar['hari'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={jadwalForm.kelas}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, kelas: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                  <select
                    value={jadwalForm.mapel_kode}
                    onChange={(e) => {
                      const m = mapelList.find((item) => item.kode === e.target.value);
                      setJadwalForm({
                        ...jadwalForm,
                        mapel_kode: e.target.value,
                        mapel_nama: m ? m.nama : '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    {mapelList.map((m) => (
                      <option key={m.kode} value={m.kode}>
                        {m.kode} - {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Pelajaran &amp; Waktu *</label>
                  <input
                    type="text"
                    value={jadwalForm.jam_ke}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, jam_ke: e.target.value })}
                    placeholder="Contoh: Jam 1 - 4 (07.00 - 09.40)"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi Pokok Default</label>
                <input
                  type="text"
                  value={jadwalForm.materi_pokok || ''}
                  onChange={(e) => setJadwalForm({ ...jadwalForm, materi_pokok: e.target.value })}
                  placeholder="Contoh: Konfigurasi VLAN dan Routing Dinamis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {jadwalEditId && (
                  <button
                    type="button"
                    onClick={() => setJadwalEditId(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Jadwal Mengajar</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">
              Daftar Jadwal Mengajar Terdaftar ({jadwalList.length} Jadwal)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 uppercase text-[10px]">
                  <tr className="border-b border-slate-200">
                    <th className="p-3">Hari &amp; Jam</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3">Guru Pengampu</th>
                    <th className="p-3 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jadwalList.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        <span className="font-bold block">{j.hari}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{j.jam_ke}</span>
                      </td>
                      <td className="p-3 font-bold text-blue-700">{j.kelas}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{j.mapel_nama}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{j.mapel_kode}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{j.guru_nama}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditJadwal(j)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                            title="Edit jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJadwal(j.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Hapus jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTION: BANK CP, TP & MATERI POKOK                                    */}
      {/* ========================================================================= */}
      {activeSection === 'cptp' && (
        <div className="space-y-6">
          {/* Form Input CP/TP & Materi */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {cptpEditId ? 'Edit Bank CP, TP & Materi' : 'Tambah Bank CP, TP & Materi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Materi dan CP/TP yang dimasukkan di sini dapat langsung dipilih oleh Guru tanpa mengetik manual saat mengisi jurnal.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCPTP} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">Mata Pelajaran *</label>
                  <select
                    value={cptpForm.mapel_kode}
                    onChange={(e) => setCptpForm({ ...cptpForm, mapel_kode: e.target.value })}
                    className="w-full min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs font-semibold text-slate-900 bg-white"
                  >
                    {mapelList.map((m) => (
                      <option key={m.kode} value={m.kode}>
                        {m.kode} - {m.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={cptpForm.fase}
                    onChange={(e) => setCptpForm({ ...cptpForm, fase: e.target.value as any })}
                    className="w-full min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="E">Fase E (Kelas X)</option>
                    <option value="F">Fase F (Kelas XI &amp; XII)</option>
                    <option value="E/F">Fase E/F (Semua Tingkat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">Elemen Kurikulum</label>
                  <input
                    type="text"
                    value={cptpForm.elemen}
                    onChange={(e) => updateCptpField({ elemen: e.target.value })}
                    placeholder="Contoh: Perencanaan & Pengalamatan Jaringan"
                    className="w-full min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">
                  Materi Pokok Pembelajaran (Akan Muncul Otomatis untuk Guru) *
                </label>
                <input
                  type="text"
                  value={cptpForm.materi_pokok || ''}
                  onChange={(e) => updateCptpField({ materi_pokok: e.target.value })}
                  placeholder="Contoh: Konfigurasi VLAN & Inter-VLAN Routing pada Switch Manageable"
                  required
                  className="w-full min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs font-bold text-blue-950 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">
                    Capaian Pembelajaran (CP) *
                  </label>
                  <textarea
                    rows={3}
                    value={cptpForm.cp}
                    onChange={(e) => updateCptpField({ cp: e.target.value })}
                    placeholder="Contoh: Peserta didik mampu merencanakan topologi dan arsitektur jaringan..."
                    required
                    className="w-full p-3 rounded-xl border border-slate-300 sm:border-slate-200 text-sm sm:text-xs text-slate-900 leading-relaxed bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-xs font-bold text-slate-700 mb-1">
                    Tujuan Pembelajaran (TP) *
                  </label>
                  <textarea
                    rows={3}
                    value={cptpForm.tp}
                    onChange={(e) => updateCptpField({ tp: e.target.value })}
                    placeholder="Contoh: 1. Mengkonfigurasi VLAN dan Trunking. 2. Troubleshooting koneksi..."
                    required
                    className="w-full p-3 rounded-xl border border-slate-300 sm:border-slate-200 text-sm sm:text-xs text-slate-900 leading-relaxed bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Alur Tujuan Pembelajaran (ATP) / Tahapan Belajar
                    </label>
                    {isAtpAutoMode && cptpForm.atp && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        Otomatis Mindmap 1 Baris
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAutoATP}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
                    title="Susun mindmap ATP singkat 1 baris dari Bedah TP (KKO + Lingkup Materi)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Buat Otomatis dari TP</span>
                  </button>
                </div>

                {tpAnalysis.tahapan.length > 0 && (
                  <div className="mb-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                      <span>
                        <strong className="text-slate-700">KKO:</strong>{' '}
                        {tpAnalysis.kompetensi.map((k) => `${k.verb} (${k.category})`).join(', ')}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>
                        <strong className="text-slate-700">Materi:</strong>{' '}
                        {tpAnalysis.lingkupMateri.join(' • ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {tpAnalysis.tahapan.map((t, idx) => (
                        <React.Fragment key={t.tahap}>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 shadow-2xs text-[10.5px]">
                            <span className="font-extrabold text-amber-800 whitespace-nowrap">
                              Tahap {t.tahap} ({t.label}):
                            </span>
                            <span className="text-slate-700 font-medium">{t.uraian}</span>
                          </div>
                          {idx < tpAnalysis.tahapan.length - 1 && (
                            <span className="text-amber-600 font-black text-xs px-0.5 select-none">
                              --&gt;
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={cptpForm.atp}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsAtpAutoMode(val.trim() === '');
                    setCptpForm((prev) => ({ ...prev, atp: val }));
                  }}
                  placeholder="Contoh: Tahap 1 (Konsep): Dasar VLAN --> Tahap 2 (Pendalaman): Cara kerja switch --> Tahap 3 (Penerapan): Mengkonfigurasi & uji"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {cptpEditId && (
                  <button
                    type="button"
                    onClick={resetCptpForm}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{cptpEditId ? 'Simpan Perubahan CP/TP' : 'Tambahkan ke Bank CP & Materi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of CP/TP and Materi */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base sm:text-sm font-extrabold text-slate-900">
                  Daftar Bank CP, TP &amp; Materi Pembelajaran ({cptpList.length} Item Tersedia)
                </h4>
                <p className="text-sm sm:text-xs text-slate-600 sm:text-slate-500">
                  Semua materi di bawah ini siap dipilih instan oleh Guru tanpa mengetik ulang.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={cptpFilterMapel}
                  onChange={(e) => setCptpFilterMapel(e.target.value)}
                  className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs font-bold bg-slate-50 text-slate-900"
                >
                  <option value="all">Semua Mata Pelajaran</option>
                  {mapelList.map((m) => (
                    <option key={m.kode} value={m.kode}>
                      {m.kode} - {m.nama}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={cptpSearch}
                    onChange={(e) => setCptpSearch(e.target.value)}
                    placeholder="Cari materi / CP..."
                    className="min-h-[44px] sm:min-h-0 pl-8 sm:pl-7 pr-3 py-2 sm:py-1.5 rounded-xl border border-slate-300 sm:border-slate-200 text-base sm:text-xs w-full sm:w-48 bg-white text-slate-900"
                  />
                  <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-slate-400 absolute left-2.5 sm:left-2 top-3 sm:top-2.5" />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {cptpList
                .filter((item) => {
                  if (cptpFilterMapel !== 'all' && item.mapel_kode !== cptpFilterMapel) return false;
                  if (cptpSearch) {
                    const q = cptpSearch.toLowerCase();
                    return (
                      (item.materi_pokok || '').toLowerCase().includes(q) ||
                      item.elemen.toLowerCase().includes(q) ||
                      item.cp.toLowerCase().includes(q) ||
                      item.tp.toLowerCase().includes(q) ||
                      item.mapel_kode.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((item) => {
                  const mapelObj = mapelList.find((m) => m.kode === item.mapel_kode);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs sm:text-[11px] font-bold">
                            {mapelObj ? `${item.mapel_kode} - ${mapelObj.nama}` : item.mapel_kode}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-xs sm:text-[10px] font-bold">
                            Fase {item.fase}
                          </span>
                          {item.elemen && (
                            <span className="text-[13px] sm:text-xs font-semibold text-slate-700 sm:text-slate-600 leading-snug">
                              • Elemen: {item.elemen}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditCPTP(item)}
                            className="p-2 sm:p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                            title="Edit CP/TP & Materi"
                          >
                            <Edit2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCPTP(item.id)}
                            className="p-2 sm:p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.materi_pokok && (
                        <div>
                          <span className="text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-slate-400 block">
                            Materi Pokok:
                          </span>
                          <p className="text-[15px] sm:text-xs font-extrabold text-blue-950 leading-snug">
                            {item.materi_pokok}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 sm:p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                            Capaian Pembelajaran (CP):
                          </span>
                          <p className="text-[13px] sm:text-[11px] text-slate-800 sm:text-slate-700 leading-relaxed line-clamp-3">
                            {item.cp}
                          </p>
                        </div>

                        <div className="p-3 sm:p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-0.5">
                            Tujuan Pembelajaran (TP):
                          </span>
                          <p className="text-[13px] sm:text-[11px] text-slate-800 sm:text-slate-700 leading-relaxed line-clamp-3 whitespace-pre-line">
                            {item.tp}
                          </p>
                        </div>
                      </div>

                      {item.atp && (
                        <div className="text-[13px] sm:text-[11px] text-slate-600 sm:text-slate-500 font-mono leading-relaxed">
                          <strong className="text-slate-800 sm:text-slate-700">ATP:</strong> {item.atp}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SECTION: IDENTITAS SEKOLAH & KEPALA SEKOLAH                            */}
      {/* ========================================================================= */}
      {activeSection === 'sekolah' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Perbarui Identitas Sekolah &amp; Kepala Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Data ini akan otomatis tercantum pada kop surat cetak, tanda tangan resmi, dan rekapitulasi jurnal.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSekolah} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Sekolah Resmi *
              </label>
              <input
                type="text"
                value={sekolahForm.sekolah}
                onChange={(e) => setSekolahForm({ ...sekolahForm, sekolah: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kepala Sekolah (Lengkap dengan Gelar) *
                </label>
                <input
                  type="text"
                  value={sekolahForm.kepala_sekolah}
                  onChange={(e) => setSekolahForm({ ...sekolahForm, kepala_sekolah: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP Kepala Sekolah *
                </label>
                <input
                  type="text"
                  value={sekolahForm.nip_kepala_sekolah}
                  onChange={(e) => setSekolahForm({ ...sekolahForm, nip_kepala_sekolah: e.target.value })}
                  onBlur={() => setSekolahForm({ ...sekolahForm, nip_kepala_sekolah: formatNip(sekolahForm.nip_kepala_sekolah) })}
                  placeholder="Contoh: 197208311997022004"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold tracking-wide"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Format angka tanpa spasi (spasi dan karakter non-numerik dibersihkan otomatis).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  value={sekolahForm.tahun_ajaran}
                  onChange={(e) => setSekolahForm({ ...sekolahForm, tahun_ajaran: e.target.value })}
                  placeholder="Contoh: 2026/2027"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester Aktif
                </label>
                <select
                  value={sekolahForm.semester}
                  onChange={(e) => setSekolahForm({ ...sekolahForm, semester: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Identitas Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
