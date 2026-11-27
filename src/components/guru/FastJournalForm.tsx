import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  JurnalPembelajaran,
  JadwalMengajar,
  KelasItem,
  MapelItem,
  KurikulumCPTP,
  DeepLearningLevel,
  KetercapaianRefleksi,
} from '../../types';
import { StorageService } from '../../services/storageService';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { getAccessToken } from '../../services/googleAuthService';
import {
  PhotoStorageService,
  UploadPhotoResult,
  savePhotoToIndexedDB,
} from '../../services/photoStorageService';
import { generateRefleksiNarrative } from '../../utils/narrativeGenerator';
import { compressImageToResult } from '../../utils/imageCompressor';
import { ResolvedPhotoImg } from '../common/ResolvedPhotoImg';
import {
  Sparkles,
  CheckCircle2,
  Camera,
  X,
  AlertCircle,
  Save,
  Send,
  RefreshCw,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Calendar,
  Users,
  Copy,
  SlidersHorizontal,
  Wrench,
  MessageSquare,
  FolderKanban,
  ClipboardCheck,
} from 'lucide-react';

interface FastJournalFormProps {
  currentUser: User;
  jadwalList: JadwalMengajar[];
  kelasList: KelasItem[];
  mapelList: MapelItem[];
  cptpList: KurikulumCPTP[];
  journals?: JurnalPembelajaran[];
  onSuccess: (savedJurnal: JurnalPembelajaran) => void;
  onCancel?: () => void;
  editingJurnal?: JurnalPembelajaran | null;
  initialJadwalId?: string | null;
}

interface JournalTemplate {
  id: 'praktik' | 'teori' | 'proyek' | 'evaluasi';
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  aktivitas: string[];
  mindful: DeepLearningLevel;
  meaningful: DeepLearningLevel;
  joyful: DeepLearningLevel;
  ketercapaian: KetercapaianRefleksi;
  kendala: string;
  tindakLanjut: string;
}

const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'praktik',
    title: 'Praktik Lab / Bengkel',
    shortTitle: 'Praktik Lab',
    subtitle: 'Praktik langsung, kolaborasi & pemecahan masalah',
    icon: Wrench,
    aktivitas: ['Praktik', 'Problem Solving', 'Kolaborasi'],
    mindful: 'Sangat Terlihat',
    meaningful: 'Sangat Terlihat',
    joyful: 'Sangat Terlihat',
    ketercapaian: 'Sangat Baik',
    kendala: 'Tidak Ada',
    tindakLanjut: 'Praktik Lanjutan',
  },
  {
    id: 'teori',
    title: 'Teori & Diskusi Kelas',
    shortTitle: 'Teori & Diskusi',
    subtitle: 'Penjelasan konsep, diskusi kelompok & presentasi',
    icon: MessageSquare,
    aktivitas: ['Diskusi', 'Presentasi', 'Kolaborasi'],
    mindful: 'Sangat Terlihat',
    meaningful: 'Terlihat',
    joyful: 'Terlihat',
    ketercapaian: 'Baik',
    kendala: 'Tidak Ada',
    tindakLanjut: 'Pengayaan',
  },
  {
    id: 'proyek',
    title: 'Proyek / Studi Kasus',
    shortTitle: 'Proyek / PjBL',
    subtitle: 'Pembelajaran berbasis proyek (PjBL) & kasus nyata',
    icon: FolderKanban,
    aktivitas: ['Proyek', 'Studi Kasus', 'Presentasi'],
    mindful: 'Sangat Terlihat',
    meaningful: 'Sangat Terlihat',
    joyful: 'Sangat Terlihat',
    ketercapaian: 'Sangat Baik',
    kendala: 'Tidak Ada',
    tindakLanjut: 'Pengayaan',
  },
  {
    id: 'evaluasi',
    title: 'Evaluasi & Pendampingan',
    shortTitle: 'Evaluasi',
    subtitle: 'Review materi, latihan soal & bimbingan remedial',
    icon: ClipboardCheck,
    aktivitas: ['Problem Solving', 'Diskusi'],
    mindful: 'Terlihat',
    meaningful: 'Terlihat',
    joyful: 'Cukup',
    ketercapaian: 'Cukup',
    kendala: 'Siswa Belum Paham',
    tindakLanjut: 'Remedial',
  },
];

export const FastJournalForm: React.FC<FastJournalFormProps> = ({
  currentUser,
  jadwalList,
  kelasList,
  mapelList,
  cptpList,
  journals = [],
  onSuccess,
  onCancel,
  editingJurnal,
  initialJadwalId,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const teacherJadwal = jadwalList.filter(
    (j) =>
      (currentUser.nip && currentUser.nip !== '-' && j.guru_nip === currentUser.nip) ||
      j.guru_nama.includes(currentUser.nama)
  );

  const myPreviousJournals = journals.filter(
    (j) =>
      (j.guru_nip === currentUser.nip || j.guru_nama.includes(currentUser.nama)) &&
      j.id !== editingJurnal?.id
  );
  const lastJournal = myPreviousJournals[0] || null;

  const startingJadwal =
    (initialJadwalId ? jadwalList.find((j) => j.id === initialJadwalId) : undefined) ||
    teacherJadwal[0];

  const teacherDefaultMapel =
    currentUser.mapel_diampu && currentUser.mapel_diampu.length > 0
      ? mapelList.find(
          (m) =>
            m.kode.toUpperCase() === currentUser.mapel_diampu![0].toUpperCase() ||
            m.nama.toLowerCase() === currentUser.mapel_diampu![0].toLowerCase()
        )?.nama
      : undefined;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>(
    editingJurnal?.jadwal_id || startingJadwal?.id || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    editingJurnal ? 'custom' : 'praktik'
  );

  const [jurnalId] = useState<string>(
    editingJurnal?.id || StorageService.generateUniqueJurnalId(currentUser.kode_guru ?? currentUser.nip)
  );
  const [tanggal, setTanggal] = useState<string>(editingJurnal?.tanggal || todayStr);
  const [kelas, setKelas] = useState<string>(
    editingJurnal?.kelas || startingJadwal?.kelas || kelasList[0]?.nama || 'XI TKJ 1'
  );
  const [mapel, setMapel] = useState<string>(
    editingJurnal?.mapel ||
      startingJadwal?.mapel_nama ||
      teacherDefaultMapel ||
      mapelList[0]?.nama ||
      ''
  );
  const [materi, setMateri] = useState<string>(
    editingJurnal?.materi || startingJadwal?.materi_pokok || ''
  );
  const [cp, setCp] = useState<string>(editingJurnal?.cp || startingJadwal?.cp || '');
  const [tp, setTp] = useState<string>(editingJurnal?.tp || startingJadwal?.tp || '');
  const [atp, setAtp] = useState<string>(editingJurnal?.atp || startingJadwal?.atp || '');

  const [showCPTPModal, setShowCPTPModal] = useState<boolean>(false);
  const [showCPTPDetails, setShowCPTPDetails] = useState<boolean>(false);
  const [showActivityCustomizer, setShowActivityCustomizer] = useState<boolean>(
    Boolean(editingJurnal)
  );
  const [isManualMateriMode, setIsManualMateriMode] = useState<boolean>(false);
  const [cptpModalSearch, setCptpModalSearch] = useState<string>('');
  const [cptpModalFilter, setCptpModalFilter] = useState<'current' | 'all'>('current');

  const currentKelasObj = kelasList.find((k) => k.nama === kelas);
  const totalSiswaDefault = currentKelasObj?.jumlah_siswa || 36;

  const [hadir, setHadir] = useState<number>(
    editingJurnal?.kehadiran.hadir ?? totalSiswaDefault
  );
  const [sakit, setSakit] = useState<number>(editingJurnal?.kehadiran.sakit ?? 0);
  const [izin, setIzin] = useState<number>(editingJurnal?.kehadiran.izin ?? 0);
  const [alpa, setAlpa] = useState<number>(editingJurnal?.kehadiran.alpa ?? 0);
  const [totalSiswa, setTotalSiswa] = useState<number>(
    editingJurnal?.kehadiran.total ?? totalSiswaDefault
  );
  const [keteranganKehadiran] = useState<string>(
    editingJurnal?.kehadiran.keterangan || ''
  );

  const AKTIVITAS_OPTIONS = [
    'Diskusi',
    'Presentasi',
    'Praktik',
    'Studi Kasus',
    'Proyek',
    'Problem Solving',
    'Kolaborasi',
  ];
  const [aktivitas, setAktivitas] = useState<string[]>(
    editingJurnal?.aktivitas || JOURNAL_TEMPLATES[0].aktivitas
  );

  const DEEP_LEARNING_LEVELS: DeepLearningLevel[] = [
    'Sangat Terlihat',
    'Terlihat',
    'Cukup',
    'Belum Terlihat',
  ];
  const [mindful, setMindful] = useState<DeepLearningLevel>(
    editingJurnal?.deep_learning.mindful || JOURNAL_TEMPLATES[0].mindful
  );
  const [meaningful, setMeaningful] = useState<DeepLearningLevel>(
    editingJurnal?.deep_learning.meaningful || JOURNAL_TEMPLATES[0].meaningful
  );
  const [joyful, setJoyful] = useState<DeepLearningLevel>(
    editingJurnal?.deep_learning.joyful || JOURNAL_TEMPLATES[0].joyful
  );

  const KETERCAPAIAN_OPTIONS: KetercapaianRefleksi[] = [
    'Sangat Baik',
    'Baik',
    'Cukup',
    'Perlu Tindak Lanjut',
  ];

  const [ketercapaian, setKetercapaian] = useState<KetercapaianRefleksi>(
    editingJurnal?.refleksi.ketercapaian || JOURNAL_TEMPLATES[0].ketercapaian
  );
  const [kendala, setKendala] = useState<string>(
    editingJurnal?.refleksi.kendala || JOURNAL_TEMPLATES[0].kendala
  );
  const [tindakLanjut, setTindakLanjut] = useState<string>(
    editingJurnal?.refleksi.tindak_lanjut || JOURNAL_TEMPLATES[0].tindakLanjut
  );
  const [catatanGuru] = useState<string>(editingJurnal?.refleksi.catatan_guru || '');
  const [narasiRefleksi, setNarasiRefleksi] = useState<string>(
    editingJurnal?.refleksi.narasi_refleksi || ''
  );

  const [dokumentasi, setDokumentasi] = useState<string[]>(editingJurnal?.dokumentasi || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const materiSectionRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!editingJurnal && initialJadwalId) {
      const target = jadwalList.find((j) => j.id === initialJadwalId);
      if (target) {
        setSelectedJadwalId(target.id);
        setKelas(target.kelas);
        setMapel(target.mapel_nama);
        setMateri(target.materi_pokok);
        setCp(target.cp);
        setTp(target.tp);
        setAtp(target.atp);
        const kObj = kelasList.find((k) => k.nama === target.kelas);
        const total = kObj?.jumlah_siswa || 36;
        setTotalSiswa(total);
        setHadir(total);
        setSakit(0);
        setIzin(0);
        setAlpa(0);
      }
    }
  }, [initialJadwalId, editingJurnal, jadwalList, kelasList]);

  const applyTemplate = (tpl: JournalTemplate) => {
    setSelectedTemplateId(tpl.id);
    setAktivitas(tpl.aktivitas);
    setMindful(tpl.mindful);
    setMeaningful(tpl.meaningful);
    setJoyful(tpl.joyful);
    setKetercapaian(tpl.ketercapaian);
    setKendala(tpl.kendala);
    setTindakLanjut(tpl.tindakLanjut);

    const generated = generateRefleksiNarrative({
      materi: materi || 'Materi Pembelajaran',
      kelas,
      aktivitas: tpl.aktivitas,
      deepLearning: {
        mindful: tpl.mindful,
        meaningful: tpl.meaningful,
        joyful: tpl.joyful,
      },
      refleksi: {
        ketercapaian: tpl.ketercapaian,
        kendala: tpl.kendala,
        tindak_lanjut: tpl.tindakLanjut,
        catatan_guru: catatanGuru,
        narasi_refleksi: '',
      },
      persentaseHadir: totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 100,
    });
    setNarasiRefleksi(generated);
    setTemplateNotice(`Template "${tpl.title}" aktif`);
  };

  const applyFromLastJournal = () => {
    if (!lastJournal) return;
    setSelectedTemplateId('last');
    setKelas(lastJournal.kelas);
    setMapel(lastJournal.mapel);
    setMateri(lastJournal.materi);
    setCp(lastJournal.cp || '');
    setTp(lastJournal.tp || '');
    setAtp(lastJournal.atp || '');
    setAktivitas(lastJournal.aktivitas);
    setMindful(lastJournal.deep_learning.mindful);
    setMeaningful(lastJournal.deep_learning.meaningful);
    setJoyful(lastJournal.deep_learning.joyful);
    setKetercapaian(lastJournal.refleksi.ketercapaian);
    setKendala(lastJournal.refleksi.kendala);
    setTindakLanjut(lastJournal.refleksi.tindak_lanjut);
    setNarasiRefleksi(lastJournal.refleksi.narasi_refleksi);

    const kObj = kelasList.find((k) => k.nama === lastJournal.kelas);
    const total = kObj?.jumlah_siswa || lastJournal.kehadiran.total || 36;
    setTotalSiswa(total);
    setHadir(total);
    setSakit(0);
    setIzin(0);
    setAlpa(0);
    setErrorMessage(null);
    setTemplateNotice(`Disalin dari jurnal terakhir (${lastJournal.kelas})`);
  };

  const selectedMapelObj =
    mapelList.find(
      (m) =>
        m.nama.toLowerCase() === mapel.trim().toLowerCase() ||
        m.kode.toLowerCase() === mapel.trim().toLowerCase()
    ) ||
    mapelList.find(
      (m) =>
        mapel.trim().length >= 3 &&
        (m.nama.toLowerCase().includes(mapel.trim().toLowerCase()) ||
          mapel.trim().toLowerCase().includes(m.nama.toLowerCase()))
    );

  const matchingCPTP = useMemo(() => {
    return cptpList.filter((c) => {
      if (selectedMapelObj) {
        return c.mapel_kode.toUpperCase() === selectedMapelObj.kode.toUpperCase();
      }
      return c.mapel_kode.toLowerCase() === mapel.toLowerCase();
    });
  }, [cptpList, selectedMapelObj, mapel]);

  const matchingCPTPGroupedByElemen = useMemo(() => {
    const groups = new Map<string, KurikulumCPTP[]>();
    const sorted = [...matchingCPTP].sort((a, b) => {
      const faseCmp = (a.fase || '').localeCompare(b.fase || '');
      if (faseCmp !== 0) return faseCmp;
      return (a.elemen || '').localeCompare(b.elemen || '');
    });
    for (const item of sorted) {
      const elemenKey = (item.elemen || 'Umum / Lainnya').trim();
      const bucket = groups.get(elemenKey) || [];
      bucket.push(item);
      groups.set(elemenKey, bucket);
    }
    return Array.from(groups.entries());
  }, [matchingCPTP]);

  const otherCPTP = useMemo(() => {
    const matchIds = new Set(matchingCPTP.map((m) => m.id));
    return cptpList.filter((c) => !matchIds.has(c.id));
  }, [cptpList, matchingCPTP]);

  const selectedCPTPItem = useMemo(() => {
    if (!materi) return undefined;
    return (
      matchingCPTP.find((c) => (c.materi_pokok || c.elemen) === materi) ||
      cptpList.find((c) => (c.materi_pokok || c.elemen) === materi)
    );
  }, [materi, matchingCPTP, cptpList]);

  const handleApplyCPTP = (item: KurikulumCPTP) => {
    const chosenMateri = item.materi_pokok || item.elemen || '';
    if (chosenMateri) {
      setMateri(chosenMateri);
    }
    setCp(item.cp || '');
    setTp(item.tp || '');
    setAtp(item.atp || '');
    setIsManualMateriMode(false);
    setShowCPTPModal(false);
    setErrorMessage(null);
  };

  const handleJadwalChange = (jadwalId: string) => {
    setSelectedJadwalId(jadwalId);
    const target = jadwalList.find((j) => j.id === jadwalId);
    if (target) {
      setKelas(target.kelas);
      setMapel(target.mapel_nama);
      setMateri(target.materi_pokok);
      setCp(target.cp);
      setTp(target.tp);
      setAtp(target.atp);
      const kObj = kelasList.find((k) => k.nama === target.kelas);
      const total = kObj?.jumlah_siswa || 36;
      setTotalSiswa(total);
      setHadir(total);
      setSakit(0);
      setIzin(0);
      setAlpa(0);
      setErrorMessage(null);
    }
  };

  const handleSetAllPresent = () => {
    setHadir(totalSiswa);
    setSakit(0);
    setIzin(0);
    setAlpa(0);
  };

  const adjustAttendance = (type: 'sakit' | 'izin' | 'alpa', delta: number) => {
    if (type === 'sakit') {
      const next = Math.max(0, Math.min(totalSiswa - izin - alpa, sakit + delta));
      setSakit(next);
      setHadir(Math.max(0, totalSiswa - (next + izin + alpa)));
    } else if (type === 'izin') {
      const next = Math.max(0, Math.min(totalSiswa - sakit - alpa, izin + delta));
      setIzin(next);
      setHadir(Math.max(0, totalSiswa - (sakit + next + alpa)));
    } else if (type === 'alpa') {
      const next = Math.max(0, Math.min(totalSiswa - sakit - izin, alpa + delta));
      setAlpa(next);
      setHadir(Math.max(0, totalSiswa - (sakit + izin + next)));
    }
  };

  const toggleAktivitas = (item: string) => {
    setSelectedTemplateId('custom');
    if (aktivitas.includes(item)) {
      setAktivitas(aktivitas.filter((a) => a !== item));
    } else {
      setAktivitas([...aktivitas, item]);
    }
  };

  const handleAutoNarrative = () => {
    const text = generateRefleksiNarrative({
      materi: materi || 'Materi Kejuruan',
      kelas,
      aktivitas,
      deepLearning: { mindful, meaningful, joyful },
      refleksi: {
        ketercapaian,
        kendala,
        tindak_lanjut: tindakLanjut,
        catatan_guru: catatanGuru,
        narasi_refleksi: '',
      },
      persentaseHadir: totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 100,
    });
    setNarasiRefleksi(text);
  };

  const goToStep = (target: 1 | 2 | 3) => {
    if (target > 1 && !materi.trim()) {
      setActiveStep(1);
      setErrorMessage('Pilih atau isi Materi Pokok Pembelajaran terlebih dahulu sebelum melanjutkan.');
      setTimeout(() => {
        materiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setErrorMessage(null);
    if (target === 3 && !narasiRefleksi.trim()) {
      handleAutoNarrative();
    }
    setActiveStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoProvider, setPhotoProvider] = useState<
    'firebase' | 'gdrive_gas' | 'gdrive_oauth' | 'indexeddb' | null
  >(null);
  const photoUploadPromiseRef = useRef<Promise<UploadPhotoResult> | null>(null);
  const uploadTokenRef = useRef<number>(0);
  const previewObjectUrlRef = useRef<string | null>(null);
  const previewBlobRef = useRef<Blob | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (dokumentasi.length >= 1) {
      setErrorMessage(
        'Maksimal 1 foto dokumentasi per jurnal. Hapus foto lama terlebih dahulu untuk mengganti.'
      );
      return;
    }

    const file = files[0];
    uploadTokenRef.current += 1;
    const currentToken = uploadTokenRef.current;

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    previewBlobRef.current = null;

    try {
      setIsCompressing(true);
      const compressed = await compressImageToResult(file, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8,
        maxSizeBytes: 100 * 1024,
      });

      if (uploadTokenRef.current !== currentToken) {
        URL.revokeObjectURL(compressed.objectUrl);
        return;
      }

      previewObjectUrlRef.current = compressed.objectUrl;
      previewBlobRef.current = compressed.blob;
      setDokumentasi([compressed.objectUrl]);
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setIsUploadingPhoto(true);
      const uploadPromise = PhotoStorageService.uploadJournalPhoto(
        {
          blob: compressed.blob,
          objectUrl: compressed.objectUrl,
          precompressed: true,
        },
        {
          jurnalId,
          guruNama: `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`,
          guruNip: currentUser.nip,
          mapel,
          kelas,
        }
      );
      photoUploadPromiseRef.current = uploadPromise;

      uploadPromise
        .then((uploadRes) => {
          if (uploadTokenRef.current === currentToken) {
            if (previewObjectUrlRef.current && previewObjectUrlRef.current !== uploadRes.url) {
              URL.revokeObjectURL(previewObjectUrlRef.current);
              previewObjectUrlRef.current = null;
            }
            previewBlobRef.current = null;
            setDokumentasi([uploadRes.url]);
            setPhotoProvider(uploadRes.provider);
          }
        })
        .catch((err) => {
          console.warn('Upload foto cloud notice:', err);
        })
        .finally(() => {
          if (uploadTokenRef.current === currentToken) {
            setIsUploadingPhoto(false);
            if (photoUploadPromiseRef.current === uploadPromise) {
              photoUploadPromiseRef.current = null;
            }
          }
        });
    } catch (err: any) {
      setErrorMessage(`Gagal memproses foto: ${err?.message || 'Format gambar tidak didukung'}`);
      setIsCompressing(false);
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    uploadTokenRef.current += 1;
    photoUploadPromiseRef.current = null;
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    previewBlobRef.current = null;
    setIsCompressing(false);
    setIsUploadingPhoto(false);
    setDokumentasi(dokumentasi.filter((_, i) => i !== idx));
    setPhotoProvider(null);
  };

  const handleSubmit = async (targetStatus: 'Draft' | 'Menunggu Validasi') => {
    if (!materi.trim()) {
      setActiveStep(1);
      setErrorMessage('Mohon pilih atau isi Materi Pokok Pembelajaran terlebih dahulu.');
      setTimeout(() => {
        materiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalNarasi = narasiRefleksi;
      if (!finalNarasi.trim()) {
        finalNarasi = generateRefleksiNarrative({
          materi,
          kelas,
          aktivitas,
          deepLearning: { mindful, meaningful, joyful },
          refleksi: {
            ketercapaian,
            kendala,
            tindak_lanjut: tindakLanjut,
            catatan_guru: catatanGuru,
            narasi_refleksi: '',
          },
          persentaseHadir: totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 100,
        });
        setNarasiRefleksi(finalNarasi);
      }

      let sanitizedDokumentasi = [...dokumentasi];
      if (photoUploadPromiseRef.current) {
        try {
          const pendingUpload = await Promise.race([
            photoUploadPromiseRef.current,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
          ]);
          if (pendingUpload?.url) {
            sanitizedDokumentasi = [pendingUpload.url];
            previewBlobRef.current = null;
            setDokumentasi([pendingUpload.url]);
            setPhotoProvider(pendingUpload.provider);
          }
        } catch (err) {
          console.warn('Menunggu upload foto background:', err);
        }
      }

      if (
        sanitizedDokumentasi.length > 0 &&
        (sanitizedDokumentasi[0].startsWith('data:image') ||
          (previewBlobRef.current && sanitizedDokumentasi[0] === previewObjectUrlRef.current))
      ) {
        try {
          if (previewBlobRef.current) {
            const fallbackUrl = await savePhotoToIndexedDB(
              `foto_${jurnalId}_${Date.now()}`,
              previewBlobRef.current
            );
            sanitizedDokumentasi = [fallbackUrl];
          } else {
            const uploadRes = await PhotoStorageService.uploadJournalPhoto(
              sanitizedDokumentasi[0],
              {
                jurnalId,
                guruNama: `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`,
                guruNip: currentUser.nip,
                mapel,
                kelas,
              }
            );
            sanitizedDokumentasi = [uploadRes.url];
          }
        } catch (err) {
          console.warn('Sanitasi upload foto eviden:', err);
        }
      }

      const payload: JurnalPembelajaran = {
        id: jurnalId,
        timestamp: new Date().toISOString(),
        tanggal,
        jadwal_id: selectedJadwalId,
        guru_nip: currentUser.nip,
        guru_nama: `${currentUser.nama}${currentUser.gelar ? ', ' + currentUser.gelar : ''}`,
        mapel,
        kelas,
        materi,
        cp,
        tp,
        atp,
        kehadiran: {
          hadir,
          sakit,
          izin,
          alpa,
          total: totalSiswa,
          keterangan: keteranganKehadiran,
        },
        aktivitas,
        deep_learning: {
          mindful,
          meaningful,
          joyful,
        },
        refleksi: {
          ketercapaian,
          kendala,
          tindak_lanjut: tindakLanjut,
          catatan_guru: catatanGuru,
          narasi_refleksi: finalNarasi,
        },
        dokumentasi: sanitizedDokumentasi,
        status: targetStatus,
        qr_token: `SMKN1SIDAYU-VAL-${jurnalId}-${Date.now().toString(36).toUpperCase()}`,
        ...(editingJurnal?.catatan_supervisi
          ? { catatan_supervisi: editingJurnal.catatan_supervisi }
          : {}),
      };

      const res = await StorageService.submitJurnal(payload, currentUser.nip);

      if (res.success && res.data) {
        try {
          const token = await getAccessToken();
          const cfg = StorageService.getConfig();
          if (token && cfg.spreadsheet_id) {
            GoogleSheetsService.appendJournalToSheet(cfg.spreadsheet_id, res.data, token).catch(
              (e) => {
                console.warn('Google Sheet background sync notice:', e);
              }
            );
          }
        } catch {
          // Non-blocking
        }

        if (targetStatus === 'Menunggu Validasi') {
          try {
            confetti({
              particleCount: 70,
              spread: 65,
              origin: { y: 0.6 },
            });
          } catch {}
        }
        onSuccess(res.data);
      } else {
        setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan jurnal.');
      }
    } catch (err: any) {
      console.error('Submit jurnal error:', err);
      setErrorMessage(
        err?.message || 'Gagal mengirim jurnal. Silakan periksa isian dan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const kehadiranPersen = totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-5">
      {/* Header & Stepper Ringkas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono tabular-nums">{jurnalId}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.nama}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {editingJurnal ? 'Perbarui Jurnal Mengajar' : 'Buat Jurnal Mengajar'}
            </h2>
          </div>

          {!editingJurnal && lastJournal && (
            <button
              type="button"
              onClick={applyFromLastJournal}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap ${
                selectedTemplateId === 'last'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Terakhir ({lastJournal.kelas})</span>
            </button>
          )}
        </div>

        {/* 3-Step Interactive Progress Navigation */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
          {[
            {
              step: 1 as const,
              label: '1. Kelas & Materi',
              done: Boolean(materi.trim()) && activeStep > 1,
            },
            {
              step: 2 as const,
              label: '2. Kehadiran',
              done: activeStep > 2,
            },
            {
              step: 3 as const,
              label: '3. Foto & Kirim',
              done: false,
            },
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => goToStep(item.step)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-xs'
                    : item.done
                    ? 'text-emerald-700 hover:text-emerald-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact 1-Line Template Preset Selector */}
        {!editingJurnal && (
          <div className="pt-1 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-medium text-slate-500 shrink-0">
              Template cepat:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {JOURNAL_TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    title={tpl.subtitle}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tpl.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {templateNotice && (
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{templateNotice}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
            aria-label="Tutup pesan kesalahan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 1: JADWAL, KELAS & MATERI                                    */}
      {/* ================================================================= */}
      {activeStep === 1 && (
        <section className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 sm:p-6 space-y-5">
            {teacherJadwal.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Cepat dari Jadwal Anda
                </label>
                <div className="flex flex-wrap gap-2">
                  {teacherJadwal.map((j) => {
                    const isActive = selectedJadwalId === j.id;
                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => handleJadwalChange(j.id)}
                        className={`px-3 py-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <span className="font-bold">{j.kelas}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500">{j.hari}, Jam {j.jam_ke}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="truncate max-w-[180px]">{j.mapel_nama}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kelas</label>
                <select
                  value={kelas}
                  onChange={(e) => {
                    setKelas(e.target.value);
                    const kObj = kelasList.find((k) => k.nama === e.target.value);
                    if (kObj) {
                      setTotalSiswa(kObj.jumlah_siswa);
                      setHadir(kObj.jumlah_siswa);
                      setSakit(0);
                      setIzin(0);
                      setAlpa(0);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.nama}>
                      {k.nama} ({k.jumlah_siswa} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mata Pelajaran
                </label>
                <select
                  value={mapel}
                  onChange={(e) => {
                    const newMapel = e.target.value;
                    setMapel(newMapel);
                    const mObj = mapelList.find((m) => m.nama === newMapel || m.kode === newMapel);
                    const found = cptpList.find((c) =>
                      mObj
                        ? c.mapel_kode.toUpperCase() === mObj.kode.toUpperCase()
                        : c.mapel_kode.toLowerCase() === newMapel.toLowerCase()
                    );
                    if (found) {
                      handleApplyCPTP(found);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  {mapelList.map((m) => (
                    <option key={m.kode} value={m.nama}>
                      {m.kode} - {m.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Materi Pokok */}
            <div ref={materiSectionRef} className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-800">
                  Materi Pokok Pembelajaran <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCPTPModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Bank Materi ({cptpList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualMateriMode(!isManualMateriMode)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isManualMateriMode ? 'Pilih dari Daftar' : 'Ketik Manual'}
                  </button>
                </div>
              </div>

              {!isManualMateriMode ? (
                <select
                  value={materi}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setIsManualMateriMode(true);
                      return;
                    }
                    const found =
                      matchingCPTP.find((c) => (c.materi_pokok || c.elemen) === val) ||
                      cptpList.find((c) => (c.materi_pokok || c.elemen) === val);
                    if (found) {
                      handleApplyCPTP(found);
                    } else {
                      setMateri(val);
                      setErrorMessage(null);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 bg-blue-50/30 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Pilih Materi Pokok ({mapel}) --</option>
                  {matchingCPTPGroupedByElemen.map(([elemenName, items]) => (
                    <optgroup key={elemenName} label={`Elemen: ${elemenName}`}>
                      {items.map((item) => (
                        <option key={item.id} value={item.materi_pokok || item.elemen}>
                          {item.materi_pokok || item.elemen} (Fase {item.fase} · Elemen: {item.elemen || 'Umum'})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {otherCPTP.length > 0 && (
                    <optgroup label="Materi Mapel Lainnya">
                      {otherCPTP.map((item) => (
                        <option key={item.id} value={item.materi_pokok || item.elemen}>
                          [{item.mapel_kode}] {item.materi_pokok || item.elemen} (Fase {item.fase}{item.elemen ? ` · Elemen: ${item.elemen}` : ''})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__custom__">+ Ketik materi secara manual...</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={materi}
                  onChange={(e) => {
                    setMateri(e.target.value);
                    if (e.target.value.trim()) setErrorMessage(null);
                  }}
                  placeholder="Tuliskan materi pokok yang diajarkan hari ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      cp || tp ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span>
                    {cp || tp
                      ? 'CP, TP & ATP terisi otomatis'
                      : 'CP, TP & ATP terisi otomatis saat memilih dari Bank Materi'}
                  </span>
                  {selectedCPTPItem && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80 text-[11px] font-semibold">
                      Fase {selectedCPTPItem.fase}
                      {selectedCPTPItem.elemen ? ` · Elemen: ${selectedCPTPItem.elemen}` : ''}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCPTPDetails(!showCPTPDetails)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{showCPTPDetails ? 'Tutup CP/TP' : 'Ubah CP & TP'}</span>
                  {showCPTPDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {showCPTPDetails && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Capaian Pembelajaran (CP)
                    </label>
                    <textarea
                      rows={2}
                      value={cp}
                      onChange={(e) => setCp(e.target.value)}
                      placeholder="Capaian pembelajaran..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tujuan Pembelajaran (TP)
                    </label>
                    <textarea
                      rows={2}
                      value={tp}
                      onChange={(e) => setTp(e.target.value)}
                      placeholder="Tujuan pembelajaran..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alur Tujuan Pembelajaran (ATP)
                    </label>
                    <input
                      type="text"
                      value={atp}
                      onChange={(e) => setAtp(e.target.value)}
                      placeholder="Alur tujuan pembelajaran..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:px-6 bg-slate-50/70 flex items-center justify-between gap-3 rounded-b-2xl">
            <div className="text-xs text-slate-500 truncate">
              {kelas} · {mapel || 'Pilih Mapel'}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Lanjut ke Kehadiran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/* STEP 2: KEHADIRAN & AKTIVITAS BELAJAR                             */}
      {/* ================================================================= */}
      {activeStep === 2 && (
        <section className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kehadiran Siswa Kelas {kelas}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {hadir} dari {totalSiswa} siswa hadir ({kehadiranPersen}%)
                </p>
              </div>
              <button
                type="button"
                onClick={handleSetAllPresent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Semua Hadir ({totalSiswa})</span>
              </button>
            </div>

            {/* Unified 4-Cell Attendance Strip (Clean Hairlines, No Rainbow Boxes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 overflow-hidden bg-white">
              <div className="p-4 text-center bg-emerald-50/40">
                <div className="text-xs font-semibold text-emerald-800">Hadir</div>
                <div className="text-3xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                  {hadir}
                </div>
                <div className="text-[11px] text-emerald-700/80 tabular-nums mt-0.5">
                  {kehadiranPersen}% hadir
                </div>
              </div>

              {[
                {
                  key: 'sakit' as const,
                  label: 'Sakit',
                  value: sakit,
                  accent: 'text-amber-700',
                },
                {
                  key: 'izin' as const,
                  label: 'Izin',
                  value: izin,
                  accent: 'text-blue-700',
                },
                {
                  key: 'alpa' as const,
                  label: 'Alpa',
                  value: alpa,
                  accent: 'text-rose-700',
                },
              ].map((item) => (
                <div key={item.key} className="p-4 text-center flex flex-col items-center justify-between">
                  <div className="text-xs font-semibold text-slate-600">{item.label}</div>
                  <div className={`text-2xl font-bold font-mono tabular-nums my-1 ${item.accent}`}>
                    {item.value}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustAttendance(item.key, -1)}
                      aria-label={`Kurangi ${item.label}`}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustAttendance(item.key, 1)}
                      aria-label={`Tambah ${item.label}`}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan Aktivitas & Deep Learning (Collapsible) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-1 text-xs min-w-0">
                  <div className="font-semibold text-slate-900">
                    Aktivitas &amp; Deep Learning (Otomatis dari Template)
                  </div>
                  <div className="text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>
                      Aktivitas: <strong className="text-slate-800">{aktivitas.join(', ') || '-'}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Mindful <strong className="text-blue-700">{mindful}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Meaningful <strong className="text-emerald-700">{meaningful}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Joyful <strong className="text-amber-700">{joyful}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowActivityCustomizer(!showActivityCustomizer)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-center whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showActivityCustomizer ? 'Tutup Detail' : 'Sesuaikan'}</span>
                </button>
              </div>

              {showActivityCustomizer && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-2">
                      Aktivitas Pembelajaran di Kelas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AKTIVITAS_OPTIONS.map((item) => {
                        const isSelected = aktivitas.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleAktivitas(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            )}
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {[
                      {
                        title: 'Mindful Learning',
                        subtitle: 'Kesadaran & fokus siswa',
                        value: mindful,
                        onChange: (v: DeepLearningLevel) => {
                          setMindful(v);
                          setSelectedTemplateId('custom');
                        },
                        activeClass: 'bg-blue-600 text-white border-blue-600',
                      },
                      {
                        title: 'Meaningful Learning',
                        subtitle: 'Keterkaitan dengan dunia nyata',
                        value: meaningful,
                        onChange: (v: DeepLearningLevel) => {
                          setMeaningful(v);
                          setSelectedTemplateId('custom');
                        },
                        activeClass: 'bg-emerald-600 text-white border-emerald-600',
                      },
                      {
                        title: 'Joyful Learning',
                        subtitle: 'Suasana belajar aktif & menyenangkan',
                        value: joyful,
                        onChange: (v: DeepLearningLevel) => {
                          setJoyful(v);
                          setSelectedTemplateId('custom');
                        },
                        activeClass: 'bg-amber-600 text-white border-amber-600',
                      },
                    ].map((row) => (
                      <div
                        key={row.title}
                        className="p-3 bg-white flex flex-col md:flex-row md:items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">{row.title}</div>
                          <div className="text-xs text-slate-500">{row.subtitle}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
                          {DEEP_LEARNING_LEVELS.map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => row.onChange(lvl)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
                                row.value === lvl
                                  ? row.activeClass
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:px-6 bg-slate-50/70 flex items-center justify-between gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Lanjut ke Foto &amp; Kirim</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/* STEP 3: FOTO, REFLEKSI & KIRIM                                    */}
      {/* ================================================================= */}
      {activeStep === 3 && (
        <section className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 sm:p-6 space-y-5">
            {/* Ringkasan Singkat Sebelum Kirim */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-900">{kelas}</span>
              <span aria-hidden="true">·</span>
              <span>{mapel}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-xs">{materi}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-emerald-700 tabular-nums">
                {hadir}/{totalSiswa} Hadir
              </span>
            </div>

            {/* Foto Dokumentasi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800">
                  Foto Dokumentasi Kegiatan (Opsional · Maks 1 Foto)
                </label>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {dokumentasi.length}/1
                </span>
              </div>

              {dokumentasi.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative group w-full sm:w-64 aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <ResolvedPhotoImg
                      src={dokumentasi[0]}
                      jurnalId={jurnalId}
                      alt="Dokumentasi Pembelajaran"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(0)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/75 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      {isUploadingPhoto ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          <span>Sedang menyimpan foto...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Foto siap dilampirkan
                            {photoProvider === 'indexeddb' ? ' (tersimpan di perangkat)' : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(0)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Ganti atau hapus foto
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  {isCompressing || isUploadingPhoto ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                      <span className="text-xs font-semibold text-blue-700">
                        {isCompressing ? 'Memproses foto...' : 'Mengunggah foto...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-slate-400 mb-1.5" />
                      <span className="text-xs font-semibold text-slate-700">
                        Pilih Foto dari Kamera atau Galeri
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        Ukuran foto otomatis disesuaikan agar ringan
                      </span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isCompressing || isUploadingPhoto}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Refleksi Singkat */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ketercapaian Tujuan
                  </label>
                  <select
                    value={ketercapaian}
                    onChange={(e) => {
                      setKetercapaian(e.target.value as KetercapaianRefleksi);
                      setSelectedTemplateId('custom');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {KETERCAPAIAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kendala</label>
                  <select
                    value={kendala}
                    onChange={(e) => setKendala(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Tidak Ada">Tidak Ada Kendala</option>
                    <option value="Waktu Terbatas">Waktu Terbatas</option>
                    <option value="Siswa Belum Paham">Sebagian Siswa Belum Paham</option>
                    <option value="Kehadiran Rendah">Kehadiran Siswa Rendah</option>
                    <option value="Perangkat Kurang">Perangkat / Alat Praktik Terbatas</option>
                    <option value="Internet">Kendala Jaringan Internet</option>
                    <option value="Lainnya">Kendala Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tindak Lanjut
                  </label>
                  <select
                    value={tindakLanjut}
                    onChange={(e) => setTindakLanjut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Pengayaan">Pengayaan Materi</option>
                    <option value="Praktik Lanjutan">Praktik Lanjutan</option>
                    <option value="Remedial">Remedial</option>
                    <option value="Pendampingan">Pendampingan Khusus</option>
                    <option value="Pengulangan">Pengulangan Penjelasan</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Narasi Refleksi Pembelajaran
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoNarrative}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Perbarui Narasi Otomatis</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={narasiRefleksi}
                  onChange={(e) => setNarasiRefleksi(e.target.value)}
                  placeholder="Narasi refleksi otomatis terisi..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:px-6 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('Draft')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Simpan Draft</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit('Menunggu Validasi')}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Jurnal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL BANK MATERI & CP/TP */}
      {showCPTPModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Pilih Materi dari Bank Kurikulum
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik "Pilih Materi" untuk mengisi Materi, CP, TP, dan ATP secara otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCPTPModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCptpModalFilter('current')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    cptpModalFilter === 'current'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mapel Ini ({matchingCPTP.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCptpModalFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    cptpModalFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Mapel ({cptpList.length})
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cptpModalSearch}
                  onChange={(e) => setCptpModalSearch(e.target.value)}
                  placeholder="Cari materi atau tujuan..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-slate-100 flex-1">
              {cptpList
                .filter((item) => {
                  if (cptpModalFilter === 'current') {
                    if (
                      selectedMapelObj &&
                      item.mapel_kode.toUpperCase() !== selectedMapelObj.kode.toUpperCase()
                    ) {
                      return false;
                    }
                  }
                  if (cptpModalSearch) {
                    const q = cptpModalSearch.toLowerCase();
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
                  const isCurrentSelected = materi === (item.materi_pokok || item.elemen);
                  return (
                    <div
                      key={item.id}
                      className={`py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                        isCurrentSelected ? 'bg-blue-50/40 -mx-2 px-2 rounded-xl' : ''
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">
                            {mapelObj ? `${item.mapel_kode} · ${mapelObj.nama}` : item.mapel_kode}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">Fase {item.fase}</span>
                          {item.elemen && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-slate-700">Elemen: {item.elemen}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {item.materi_pokok || item.elemen}
                        </div>
                        {item.tp && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.tp}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyCPTP(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          isCurrentSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isCurrentSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terpilih</span>
                          </>
                        ) : (
                          <span>Pilih Materi</span>
                        )}
                      </button>
                    </div>
                  );
                })}

              {cptpList.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada data materi di Bank Kurikulum.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCPTPModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
