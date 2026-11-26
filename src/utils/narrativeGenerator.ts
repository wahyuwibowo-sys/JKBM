import { DeepLearningData, RefleksiData, JurnalPembelajaran } from '../types';

export function generateRefleksiNarrative(params: {
  materi: string;
  kelas: string;
  aktivitas: string[];
  deepLearning: DeepLearningData;
  refleksi: RefleksiData;
  persentaseHadir?: number;
}): string {
  const { materi, kelas, aktivitas, deepLearning, refleksi, persentaseHadir = 100 } = params;

  const aktivitasStr = aktivitas.length > 0 ? aktivitas.join(', ') : 'kegiatan pembelajaran interaktif';

  let narasiDL = '';
  if (deepLearning.mindful === 'Sangat Terlihat' || deepLearning.mindful === 'Terlihat') {
    narasiDL += 'Peserta didik menunjukkan atensi dan kesadaran penuh (Mindful Learning) selama menyimak dan mengeksplorasi konsep materi. ';
  } else {
    narasiDL += 'Perhatian peserta didik masih perlu distimulasi lebih lanjut agar lebih fokus. ';
  }

  if (deepLearning.meaningful === 'Sangat Terlihat' || deepLearning.meaningful === 'Terlihat') {
    narasiDL += 'Pembelajaran sangat bermakna (Meaningful Learning) karena peserta didik berhasil mengaitkan materi secara kontekstual dengan aplikasi nyata di dunia industri. ';
  }

  if (deepLearning.joyful === 'Sangat Terlihat' || deepLearning.joyful === 'Terlihat') {
    narasiDL += 'Suasana kelas terbangun menyenangkan dan partisipatif (Joyful Learning) melalui aktivitas kolaboratif. ';
  }

  let narasiKetercapaian = '';
  switch (refleksi.ketercapaian) {
    case 'Sangat Baik':
      narasiKetercapaian = `Ketercapaian tujuan pembelajaran di kelas ${kelas} terlaksana dengan Sangat Baik. Mayoritas peserta didik menguasai materi ${materi} sesuai alur tujuan pembelajaran (ATP).`;
      break;
    case 'Baik':
      narasiKetercapaian = `Ketercapaian tujuan pembelajaran tercapai Baik, dengan sebagian besar siswa mampu mempraktikkan materi ${materi} secara mandiri.`;
      break;
    case 'Cukup':
      narasiKetercapaian = `Ketercapaian tujuan pembelajaran pada kategori Cukup, beberapa aspek pemahaman mendalam perlu diperkuat kembali pada sesi berikutnya.`;
      break;
    case 'Perlu Tindak Lanjut':
      narasiKetercapaian = `Ketercapaian tujuan pembelajaran masih memerlukan tindak lanjut terarah karena siswa masih mengalami kesulitan dalam menguasai kompetensi esensial materi.`;
      break;
  }

  let narasiKendala = '';
  if (!refleksi.kendala || refleksi.kendala === 'Tidak Ada') {
    narasiKendala = 'Proses pembelajaran berjalan lancar tanpa kendala teknis maupun substantif yang berarti.';
  } else {
    narasiKendala = `Tantangan yang ditemui adalah faktor ${refleksi.kendala.toLowerCase()}, yang sempat mempengaruhi efektivitas alokasi waktu dan eksplorasi materi siswa.`;
  }

  let narasiTindakLanjut = '';
  switch (refleksi.tindak_lanjut) {
    case 'Remedial':
      narasiTindakLanjut = 'Sebagai tindak lanjut, akan dilaksanakan sesi remedial terstruktur bagi siswa yang belum melampaui kriteria ketercapaian tujuan pembelajaran.';
      break;
    case 'Pengayaan':
      narasiTindakLanjut = 'Sebagai langkah tindak lanjut, siswa diberikan tugas pengayaan berbasis studi kasus tantangan industri lanjutan.';
      break;
    case 'Pengulangan':
      narasiTindakLanjut = 'Langkah berikutnya adalah pengulangan pemaparan konsep mendasar dengan metode visualisasi dan demonstrasi terbimbing.';
      break;
    case 'Praktik Lanjutan':
      narasiTindakLanjut = 'Direncanakan sesi praktik lanjutan di bengkel/laboratorium untuk memperdalam keterampilan psikomotorik peserta didik.';
      break;
    case 'Pendampingan':
      narasiTindakLanjut = 'Akan dilakukan pendampingan personal (peer-tutoring) dengan melibatkan tutor sebaya.';
      break;
    default:
      narasiTindakLanjut = `Tindak lanjut difokuskan pada ${refleksi.tindak_lanjut}.`;
  }

  const attendanceNote = persentaseHadir < 90 ? ` Perlu diperhatikan kehadiran kelas tercatat ${persentaseHadir}%.` : '';

  return `${narasiKetercapaian} Melalui aktivitas ${aktivitasStr}, ${narasiDL}${narasiKendala}${attendanceNote} ${narasiTindakLanjut}${refleksi.catatan_guru ? ` Catatan tambahan guru: "${refleksi.catatan_guru}".` : ''}`;
}

export type SupervisiCategory = 'apresiasi' | 'kejuruan' | 'tindak_lanjut' | 'standar' | 'revisi';

export interface SupervisiPreset {
  id: SupervisiCategory;
  label: string;
  badge: string;
  description: string;
}

export const SUPERVISI_PRESETS: SupervisiPreset[] = [
  {
    id: 'apresiasi',
    label: '🌟 Apresiatif & Deep Learning',
    badge: 'Apresiasi',
    description: 'Apresiasi keterlibatan aktif dan prinsip Mindful, Meaningful, Joyful.',
  },
  {
    id: 'kejuruan',
    label: '🎯 Penguatan Vokasi & Industri',
    badge: 'Vokasi & DUDI',
    description: 'Penekanan pada kompetensi kejuruan, praktik riil, dan standar kerja.',
  },
  {
    id: 'tindak_lanjut',
    label: '💡 Bimbingan & Tindak Lanjut',
    badge: 'Tindak Lanjut',
    description: 'Fokus bimbingan remedial, pengayaan, dan pendampingan siswa.',
  },
  {
    id: 'standar',
    label: '📋 Standar Kurikulum Merdeka',
    badge: 'Resmi',
    description: 'Persetujuan resmi sesuai standar mutu kurikulum SMKN 1 Sidayu.',
  },
  {
    id: 'revisi',
    label: '⚠️ Instruksi Perbaikan / Revisi',
    badge: 'Perbaikan',
    description: 'Arahan konstruktif untuk melengkapi dokumentasi atau refleksi KBM.',
  },
];

/**
 * Generates an intelligent, contextual supervisor feedback note from Kepala Sekolah
 * tailored for SMKN 1 Sidayu Gresik.
 */
export function generateCatatanSupervisi(
  journal: JurnalPembelajaran,
  category: SupervisiCategory = 'apresiasi'
): string {
  const { guru_nama, mapel, materi, kelas, refleksi, deep_learning, kehadiran } = journal;

  const totalSiswa = kehadiran.hadir + kehadiran.sakit + kehadiran.izin + kehadiran.alpa;
  const persentaseHadir = totalSiswa > 0 ? Math.round((kehadiran.hadir / totalSiswa) * 100) : 100;

  const isJoyfulHigh = deep_learning.joyful === 'Sangat Terlihat' || deep_learning.joyful === 'Terlihat';
  const isMeaningfulHigh = deep_learning.meaningful === 'Sangat Terlihat' || deep_learning.meaningful === 'Terlihat';
  const isMindfulHigh = deep_learning.mindful === 'Sangat Terlihat' || deep_learning.mindful === 'Terlihat';

  if (category === 'revisi') {
    let alasan = 'kelengkapan foto dokumentasi pembelajaran dan kejelasan target tindak lanjut';
    if (!journal.dokumentasi || journal.dokumentasi.length === 0) {
      alasan = 'lampiran foto dokumentasi pembelajaran orisinal di kelas/laboratorium';
    } else if (refleksi.ketercapaian === 'Perlu Tindak Lanjut' || refleksi.tindak_lanjut === 'Remedial') {
      alasan = 'rincian jadwal dan mekanisme pendampingan remedial bagi peserta didik yang belum tuntas';
    }
    return `Mohon lengkapi jurnal pembelajaran materi "${materi}" pada aspek ${alasan}. Setelah diperbaiki, silakan ajukan kembali untuk validasi pengesahan Kepala Sekolah.`;
  }

  if (category === 'kejuruan') {
    return `KBM ${mapel} materi "${materi}" di kelas ${kelas} telah disupervisi. Sangat mengapresiasi penanaman budaya kerja, kedisiplinan praktik, dan relevansi materi dengan kebutuhan dunia usaha/dunia industri (DUDI). Pertahankan portofolio hasil karya peserta didik.`;
  }

  if (category === 'tindak_lanjut') {
    const tl = refleksi.tindak_lanjut || 'pendampingan terarah';
    const catatanGuru = refleksi.catatan_guru ? ` Terkait catatan guru: "${refleksi.catatan_guru}", ` : ' ';
    return `Catatan supervisi: Rencana tindak lanjut berupa ${tl} telah disetujui.${catatanGuru}Pastikan evaluasi ketercapaian kompetensi materi "${materi}" terpantau tuntas pada pertemuan berikutnya. Terima kasih atas dedikasi Bapak/Ibu ${guru_nama}.`;
  }

  if (category === 'standar') {
    return `Jurnal pembelajaran materi "${materi}" (${mapel}) kelas ${kelas} telah disupervisi dan disetujui resmi. Seluruh indikator administrasi pembelajaran, presensi (${persentaseHadir}%), dan dokumentasi telah memenuhi standar mutu kurikulum SMK Negeri 1 Sidayu Gresik.`;
  }

  // Default: 'apresiasi' & Deep Learning
  let dlHighlights: string[] = [];
  if (isMindfulHigh) dlHighlights.push('atensi penuh (Mindful)');
  if (isMeaningfulHigh) dlHighlights.push('kebermaknaan kontekstual (Meaningful)');
  if (isJoyfulHigh) dlHighlights.push('suasana kelas yang menyenangkan (Joyful)');
  const dlStr = dlHighlights.length > 0 ? ` Pendekatan Deep Learning (${dlHighlights.join(', ')}) tampak terintegrasi baik.` : '';

  let hasilStr = 'Ketercapaian tujuan pembelajaran terlaksana dengan baik.';
  if (refleksi.ketercapaian === 'Sangat Baik') {
    hasilStr = 'Ketercapaian tujuan pembelajaran tercapai Sangat Baik dan partisipasi siswa sangat aktif.';
  } else if (refleksi.ketercapaian === 'Perlu Tindak Lanjut') {
    hasilStr = 'Pembelajaran terkelola baik, mohon laksanakan tindak lanjut bagi siswa yang memerlukan penguatan.';
  }

  return `Pembelajaran materi "${materi}" di kelas ${kelas} terlaksana dengan baik dan terstruktur.${dlStr} ${hasilStr} Terus pertahankan semangat berinovasi dalam mengajar.`;
}

/**
 * Generates supervisory notes for batch validation of multiple journals
 */
export function generateBatchCatatanSupervisi(
  count: number,
  category: 'standar' | 'apresiasi' | 'kejuruan' | 'tindak_lanjut' = 'standar'
): string {
  switch (category) {
    case 'apresiasi':
      return `Apresiasi tinggi kepada Bapak/Ibu Guru atas dedikasi dan konsistensi pelaksanaan KBM. Sebanyak ${count} jurnal pembelajaran telah disupervisi dan disetujui dengan penerapan prinsip Deep Learning yang inspiratif di SMKN 1 Sidayu Gresik.`;
    case 'kejuruan':
      return `Sebanyak ${count} jurnal pembelajaran telah disupervisi dan disetujui. Praktik KBM telah selaras dengan penguatan kompetensi kejuruan dan standar dunia kerja (DUDI). Pertahankan kedisiplinan dan inovasi pembelajaran vokasi.`;
    case 'tindak_lanjut':
      return `Sebanyak ${count} jurnal pembelajaran telah disetujui. Seluruh rencana tindak lanjut (remedial, pengayaan, dan pendampingan) disetujui untuk dilaksanakan secara tertib dan berkelanjutan bagi peserta didik.`;
    case 'standar':
    default:
      return `Sebanyak ${count} jurnal pembelajaran telah disupervisi secara komprehensif dan disetujui resmi. Pelaksanaan KBM terbukti tertib administrasi dan memenuhi standar penjaminan mutu kurikulum SMK Negeri 1 Sidayu Gresik.`;
  }
}

interface BloomEntry {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  category: string;
}

const BLOOM_KKO_MAP: Record<string, BloomEntry> = {
  // C1 - Mengingat
  mengingat: { level: 1, category: 'C1 • Mengingat' },
  menyebutkan: { level: 1, category: 'C1 • Mengingat' },
  menuliskan: { level: 1, category: 'C1 • Mengingat' },
  mengenali: { level: 1, category: 'C1 • Mengingat' },
  menunjukkan: { level: 1, category: 'C1 • Mengingat' },
  mendefinisikan: { level: 1, category: 'C1 • Mengingat' },
  mengidentifikasi: { level: 1, category: 'C1 • Mengingat' },
  mendaftar: { level: 1, category: 'C1 • Mengingat' },
  menandai: { level: 1, category: 'C1 • Mengingat' },
  menghafal: { level: 1, category: 'C1 • Mengingat' },
  membaca: { level: 1, category: 'C1 • Mengingat' },
  mencatat: { level: 1, category: 'C1 • Mengingat' },
  mengamati: { level: 1, category: 'C1 • Mengingat' },

  // C2 - Memahami
  memahami: { level: 2, category: 'C2 • Memahami' },
  menjelaskan: { level: 2, category: 'C2 • Memahami' },
  mendeskripsikan: { level: 2, category: 'C2 • Memahami' },
  menguraikan: { level: 2, category: 'C2 • Memahami' },
  membedakan: { level: 2, category: 'C2 • Memahami' },
  mengklasifikasikan: { level: 2, category: 'C2 • Memahami' },
  mengelompokkan: { level: 2, category: 'C2 • Memahami' },
  merangkum: { level: 2, category: 'C2 • Memahami' },
  menyimpulkan: { level: 2, category: 'C2 • Memahami' },
  menafsirkan: { level: 2, category: 'C2 • Memahami' },
  mencontohkan: { level: 2, category: 'C2 • Memahami' },
  menginterpretasikan: { level: 2, category: 'C2 • Memahami' },
  menerangkan: { level: 2, category: 'C2 • Memahami' },
  menggambarkan: { level: 2, category: 'C2 • Memahami' },
  memperkirakan: { level: 2, category: 'C2 • Memahami' },
  reading: { level: 2, category: 'C2 • Memahami' },
  explaining: { level: 2, category: 'C2 • Memahami' },

  // C3 - Menerapkan
  menerapkan: { level: 3, category: 'C3 • Menerapkan' },
  mengaplikasikan: { level: 3, category: 'C3 • Menerapkan' },
  menggunakan: { level: 3, category: 'C3 • Menerapkan' },
  memanfaatkan: { level: 3, category: 'C3 • Menerapkan' },
  mengkonfigurasi: { level: 3, category: 'C3 • Menerapkan' },
  mengonfigurasi: { level: 3, category: 'C3 • Menerapkan' },
  menginstalasi: { level: 3, category: 'C3 • Menerapkan' },
  menginstal: { level: 3, category: 'C3 • Menerapkan' },
  memasang: { level: 3, category: 'C3 • Menerapkan' },
  mengoperasikan: { level: 3, category: 'C3 • Menerapkan' },
  mempraktikkan: { level: 3, category: 'C3 • Menerapkan' },
  mempraktekan: { level: 3, category: 'C3 • Menerapkan' },
  membuat: { level: 3, category: 'C3 • Menerapkan' },
  menyusun: { level: 3, category: 'C3 • Menerapkan' },
  mengimplementasikan: { level: 3, category: 'C3 • Menerapkan' },
  melaksanakan: { level: 3, category: 'C3 • Menerapkan' },
  melakukan: { level: 3, category: 'C3 • Menerapkan' },
  menghitung: { level: 3, category: 'C3 • Menerapkan' },
  mendemonstrasikan: { level: 3, category: 'C3 • Menerapkan' },
  mengeksekusi: { level: 3, category: 'C3 • Menerapkan' },
  mengelola: { level: 3, category: 'C3 • Menerapkan' },
  mengolah: { level: 3, category: 'C3 • Menerapkan' },
  memperbaiki: { level: 3, category: 'C3 • Menerapkan' },
  merakit: { level: 3, category: 'C3 • Menerapkan' },
  menyajikan: { level: 3, category: 'C3 • Menerapkan' },
  menggambar: { level: 3, category: 'C3 • Menerapkan' },
  menulis: { level: 3, category: 'C3 • Menerapkan' },
  mengukur: { level: 3, category: 'C3 • Menerapkan' },
  menyetel: { level: 3, category: 'C3 • Menerapkan' },
  mensimulasikan: { level: 3, category: 'C3 • Menerapkan' },
  menyimulasikan: { level: 3, category: 'C3 • Menerapkan' },
  menjalankan: { level: 3, category: 'C3 • Menerapkan' },
  memproses: { level: 3, category: 'C3 • Menerapkan' },
  configuring: { level: 3, category: 'C3 • Menerapkan' },

  // C4 - Menganalisis
  menganalisis: { level: 4, category: 'C4 • Menganalisis' },
  membandingkan: { level: 4, category: 'C4 • Menganalisis' },
  menelaah: { level: 4, category: 'C4 • Menganalisis' },
  mendiagnosis: { level: 4, category: 'C4 • Menganalisis' },
  memecahkan: { level: 4, category: 'C4 • Menganalisis' },
  menyelidiki: { level: 4, category: 'C4 • Menganalisis' },
  memeriksa: { level: 4, category: 'C4 • Menganalisis' },
  mengaudit: { level: 4, category: 'C4 • Menganalisis' },
  menguji: { level: 4, category: 'C4 • Menganalisis' },
  mengujicoba: { level: 4, category: 'C4 • Menganalisis' },
  mengaitkan: { level: 4, category: 'C4 • Menganalisis' },
  mengoreksi: { level: 4, category: 'C4 • Menganalisis' },
  mendeteksi: { level: 4, category: 'C4 • Menganalisis' },
  menemukan: { level: 4, category: 'C4 • Menganalisis' },
  memilah: { level: 4, category: 'C4 • Menganalisis' },
  troubleshooting: { level: 4, category: 'C4 • Menganalisis' },
  analyzing: { level: 4, category: 'C4 • Menganalisis' },

  // C5 - Mengevaluasi
  mengevaluasi: { level: 5, category: 'C5 • Mengevaluasi' },
  menilai: { level: 5, category: 'C5 • Mengevaluasi' },
  memvalidasi: { level: 5, category: 'C5 • Mengevaluasi' },
  memverifikasi: { level: 5, category: 'C5 • Mengevaluasi' },
  membuktikan: { level: 5, category: 'C5 • Mengevaluasi' },
  mengkritisi: { level: 5, category: 'C5 • Mengevaluasi' },
  memutuskan: { level: 5, category: 'C5 • Mengevaluasi' },
  merekomendasikan: { level: 5, category: 'C5 • Mengevaluasi' },
  mempertimbangkan: { level: 5, category: 'C5 • Mengevaluasi' },
  testing: { level: 5, category: 'C5 • Mengevaluasi' },

  // C6 - Mencipta
  merancang: { level: 6, category: 'C6 • Mencipta' },
  mendesain: { level: 6, category: 'C6 • Mencipta' },
  mengembangkan: { level: 6, category: 'C6 • Mencipta' },
  menciptakan: { level: 6, category: 'C6 • Mencipta' },
  memproduksi: { level: 6, category: 'C6 • Mencipta' },
  memodifikasi: { level: 6, category: 'C6 • Mencipta' },
  membangun: { level: 6, category: 'C6 • Mencipta' },
  merumuskan: { level: 6, category: 'C6 • Mencipta' },
  mengkreasi: { level: 6, category: 'C6 • Mencipta' },
  menghasilkan: { level: 6, category: 'C6 • Mencipta' },
  merekayasa: { level: 6, category: 'C6 • Mencipta' },
  creating: { level: 6, category: 'C6 • Mencipta' },
};

const NOMINAL_START_KKO_MAP: Record<string, { normalizedVerb: string; entry: BloomEntry }> = {
  identifikasi: { normalizedVerb: 'Mengidentifikasi', entry: BLOOM_KKO_MAP.mengidentifikasi },
  pemahaman: { normalizedVerb: 'Memahami', entry: BLOOM_KKO_MAP.memahami },
  pengamatan: { normalizedVerb: 'Mengamati', entry: BLOOM_KKO_MAP.mengamati },
  penerapan: { normalizedVerb: 'Menerapkan', entry: BLOOM_KKO_MAP.menerapkan },
  praktik: { normalizedVerb: 'Mempraktikkan', entry: BLOOM_KKO_MAP.mempraktikkan },
  simulasi: { normalizedVerb: 'Menyimulasikan', entry: BLOOM_KKO_MAP.menyimulasikan },
  pembuatan: { normalizedVerb: 'Membuat', entry: BLOOM_KKO_MAP.membuat },
  perencanaan: { normalizedVerb: 'Merencanakan', entry: BLOOM_KKO_MAP.merancang },
  uji: { normalizedVerb: 'Menguji', entry: BLOOM_KKO_MAP.menguji },
  pengujian: { normalizedVerb: 'Menguji', entry: BLOOM_KKO_MAP.menguji },
  analisis: { normalizedVerb: 'Menganalisis', entry: BLOOM_KKO_MAP.menganalisis },
  evaluasi: { normalizedVerb: 'Mengevaluasi', entry: BLOOM_KKO_MAP.mengevaluasi },
  perancangan: { normalizedVerb: 'Merancang', entry: BLOOM_KKO_MAP.merancang },
};

export interface TPClauseBreakdown {
  kkoList: string[];
  primaryKKO: string;
  bloomLevel: number;
  bloomCategory: string;
  lingkupMateri: string;
  fullText: string;
}

export interface ATPStageItem {
  tahap: 1 | 2 | 3;
  label: string;
  bloomTag: string;
  uraian: string;
}

export interface TPAnalysisResult {
  kompetensi: { verb: string; category: string }[];
  lingkupMateri: string[];
  prinsipAlur: string;
  tahapan: ATPStageItem[];
  atpText: string;
}

function capitalizeFirst(str: string): string {
  const s = str.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cleanTPPrefix(text: string): string {
  return text
    .replace(/^[\s•\-*–—]+/, '')
    .replace(/^(?:\d{1,2}|[a-zA-Z])[\.\)]\s*/, '')
    .replace(/^TP\s*\d{0,2}\s*[:\-–.]\s*/i, '')
    .replace(
      /^(?:melalui\s+[^,]+,\s*)?(?:pada\s+akhir\s+(?:pembelajaran|fase\s*[a-zA-Z]?)\s*,?\s*)?(?:peserta\s+didik|siswa|murid)\s+(?:diharapkan\s+|akan\s+)?(?:mampu|dapat|bisa)\s+/i,
      ''
    )
    .replace(/^(?:mampu|dapat|bisa)\s+/i, '')
    .replace(/[\s.;:,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupActiveKKO(token: string): { verb: string; entry: BloomEntry } | null {
  const cleanWord = token.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
  if (!cleanWord) return null;
  const entry = BLOOM_KKO_MAP[cleanWord];
  if (!entry) return null;
  return { verb: capitalizeFirst(cleanWord), entry };
}

function splitClauseAtMidActionKKO(clause: string): string[] {
  const cleaned = cleanTPPrefix(clause);
  if (!cleaned) return [];

  const connectorRegex = /\s+(?:lalu|kemudian|selanjutnya|serta|dan)\s+|,\s+/gi;
  const result: string[] = [];
  let sliceStart = 0;
  let match: RegExpExecArray | null;

  while ((match = connectorRegex.exec(cleaned)) !== null) {
    const afterConnector = cleaned.slice(match.index + match[0].length).trim();
    const firstWordAfter = afterConnector.split(/\s+/)[0] || '';
    const leftSide = cleaned.slice(sliceStart, match.index).trim();
    const leftWords = leftSide.split(/\s+/).filter(Boolean);

    // Only split into a new TP sub-clause if leftSide already contains material (>= 2 words)
    // and the word right after the connector is an active Bloom KKO.
    if (leftWords.length >= 2 && lookupActiveKKO(firstWordAfter)) {
      result.push(leftSide);
      sliceStart = match.index + match[0].length;
    }
  }

  const tail = cleaned.slice(sliceStart).trim();
  if (tail) result.push(tail);
  return result.filter((item) => item.length >= 3);
}

function dissectTPClause(rawClause: string): TPClauseBreakdown | null {
  const cleaned = cleanTPPrefix(rawClause);
  if (!cleaned) return null;

  const words = cleaned.split(/\s+/);
  const kkoEntries: { verb: string; entry: BloomEntry }[] = [];

  // Check first word (active KKO or nominalized vocational action at start of clause)
  const firstActive = lookupActiveKKO(words[0] || '');
  let cursor = 0;

  if (firstActive) {
    kkoEntries.push(firstActive);
    cursor = 1;
  } else {
    const cleanFirst = (words[0] || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    const nominal = NOMINAL_START_KKO_MAP[cleanFirst];
    if (nominal) {
      kkoEntries.push({ verb: nominal.normalizedVerb, entry: nominal.entry });
      cursor = 1;
    }
  }

  // Extract chained leading KKOs sharing the same material (e.g. "Memahami dan menerapkan prosedur K3")
  while (cursor < words.length) {
    const rawToken = words[cursor].toLowerCase().replace(/^[,.;:]+|[,.;:]+$/g, '');
    if (rawToken === 'dan' || rawToken === 'serta' || rawToken === 'atau' || rawToken === 'kemudian' || rawToken === 'lalu') {
      const nextActive = lookupActiveKKO(words[cursor + 1] || '');
      if (nextActive) {
        kkoEntries.push(nextActive);
        cursor += 2;
        continue;
      }
    }
    const directNext = lookupActiveKKO(words[cursor]);
    if (cursor > 0 && words[cursor - 1].endsWith(',') && directNext) {
      kkoEntries.push(directNext);
      cursor += 1;
      continue;
    }
    break;
  }

  // Extract Lingkup Materi after the leading KKO(s)
  let lingkupMateri = words
    .slice(cursor)
    .join(' ')
    .replace(/^(?:tentang|mengenai|terhadap|pada|dalam|untuk)\s+(?=[A-Z0-9])/i, '')
    .replace(/[\s.;:,]+$/g, '')
    .trim();

  if (!lingkupMateri) {
    lingkupMateri = cleaned;
  }

  // Fallback if no explicit KKO was found in the clause
  if (kkoEntries.length === 0) {
    return {
      kkoList: ['Memahami', 'Menerapkan'],
      primaryKKO: 'Menerapkan',
      bloomLevel: 3,
      bloomCategory: 'C2-C3 • Pemahaman & Penerapan',
      lingkupMateri,
      fullText: `Memahami dan menerapkan ${lingkupMateri}`,
    };
  }

  // Highest Bloom target represents the mastery level of the clause
  const highestEntry = kkoEntries.reduce(
    (max, cur) => (cur.entry.level > max.entry.level ? cur : max),
    kkoEntries[0]
  );

  return {
    kkoList: kkoEntries.map((k) => k.verb),
    primaryKKO: highestEntry.verb,
    bloomLevel: highestEntry.entry.level,
    bloomCategory: highestEntry.entry.category,
    lingkupMateri,
    fullText: capitalizeFirst(cleaned),
  };
}

function shortenTopic(materi: string, maxWords = 4): string {
  const cleaned = materi
    .replace(/\b(?:secara\s+(?:mandiri|tepat|benar|berkelanjutan|efektif|aktif|kreatif)|dengan\s+(?:baik|benar|tepat)|di\s+lingkungan\s+(?:kerja|sekolah|masyarakat)|dalam\s+kehidupan\s+sehari-hari)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s.;:,]+$/g, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return cleaned;

  // Prefer cutting cleanly before secondary prepositions ("pada", "dalam", "untuk", "melalui", "dengan") if >= 2 core words precede it
  const prepIndex = words.findIndex(
    (w, idx) => idx >= 2 && idx <= maxWords && /^(?:pada|dalam|untuk|melalui|dengan|berbasis)$/i.test(w)
  );
  if (prepIndex >= 2) {
    return words.slice(0, prepIndex).join(' ');
  }

  return words.slice(0, maxWords).join(' ');
}

function shortenClausePhrase(text: string, maxWords = 6): string {
  const cleaned = capitalizeFirst(
    text
      .replace(/\b(?:secara\s+(?:mandiri|tepat|benar|berkelanjutan|efektif|aktif)|dengan\s+(?:baik|benar|tepat)|dalam\s+kehidupan\s+sehari-hari)\b/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/[\s.;:,]+$/g, '')
      .trim()
  );
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return cleaned;
  return words.slice(0, maxWords).join(' ');
}

function buildStageDescription(
  clauses: TPClauseBreakdown[],
  defaultFallbackVerb: string
): string {
  const uniqueTexts = Array.from(
    new Set(clauses.map((c) => shortenClausePhrase(c.fullText, 6)))
  );
  if (uniqueTexts.length === 0) return defaultFallbackVerb;
  if (uniqueTexts.length === 1) return uniqueTexts[0];
  return `${uniqueTexts[0]} & ${uniqueTexts[1].charAt(0).toLowerCase()}${uniqueTexts[1].slice(1)}`;
}

/**
 * Menganalisis TP dengan 3 langkah Kurikulum Merdeka dan menghasilkan ATP ringkas 1 baris berbentuk mindmap:
 * Tahap 1 (Konsep): ... --> Tahap 2 (Pendalaman): ... --> Tahap 3 (Penerapan): ...
 */
export function analyzeTPForATP(tp?: string): TPAnalysisResult {
  const emptyResult: TPAnalysisResult = {
    kompetensi: [],
    lingkupMateri: [],
    prinsipAlur: 'Mudah ke Sulit • Dasar ke Kompleks',
    tahapan: [],
    atpText: '',
  };

  const rawTp = (tp || '').trim();
  if (!rawTp) return emptyResult;

  // Normalize line breaks and split numbered/bulleted TP items without breaking decimals (e.g., 802.1Q)
  const normalized = rawTp
    .replace(/\r\n/g, '\n')
    .replace(/\s+(?=(?:\d{1,2}|[a-zA-Z])[\.\)]\s+[A-Za-z])/g, '\n')
    .replace(/\s+(?=[•\-*–—]\s+[A-Za-z])/g, '\n');

  const rawItems = normalized
    .split(/\n+|;\s+|\.\s+(?=[A-Z0-9])/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);

  const subClauses: string[] = [];
  for (const item of rawItems) {
    const splitItems = splitClauseAtMidActionKKO(item);
    for (const sub of splitItems) {
      subClauses.push(sub);
    }
  }

  const dissected: TPClauseBreakdown[] = [];
  for (const clause of subClauses) {
    const parsed = dissectTPClause(clause);
    if (parsed) dissected.push(parsed);
  }

  if (dissected.length === 0) return emptyResult;

  // Step 1: Collect unique Kompetensi (KKO) & Lingkup Materi
  const kompetensiMap = new Map<string, string>();
  const materiList: string[] = [];

  for (const item of dissected) {
    for (const kko of item.kkoList) {
      const lookup = lookupActiveKKO(kko);
      const cat = lookup ? lookup.entry.category : item.bloomCategory;
      if (!kompetensiMap.has(kko.toLowerCase())) {
        kompetensiMap.set(kko.toLowerCase(), `${kko} (${cat})`);
      }
    }
    if (!materiList.some((m) => m.toLowerCase() === item.lingkupMateri.toLowerCase())) {
      materiList.push(item.lingkupMateri);
    }
  }

  const kompetensi = Array.from(kompetensiMap.entries()).map(([, label]) => {
    const idx = label.indexOf(' (');
    return {
      verb: idx >= 0 ? label.slice(0, idx) : label,
      category: idx >= 0 ? label.slice(idx + 2, -1) : '',
    };
  });

  // Step 3: Urutkan Alur (mudah -> sulit / C1 -> C6)
  const orderedClauses = [...dissected].sort((a, b) => a.bloomLevel - b.bloomLevel);
  const primaryTopic = shortenTopic(materiList[0] || '', 4);
  const combinedTopic =
    materiList.length === 1
      ? primaryTopic
      : `${shortenTopic(materiList[0], 3)} & ${shortenTopic(materiList[1], 3)}`;

  let tahapan: ATPStageItem[] = [];

  if (orderedClauses.length === 1) {
    const single = orderedClauses[0];
    const topic = shortenTopic(single.lingkupMateri, 4);
    const targetKKO = single.primaryKKO;
    const level = single.bloomLevel;

    if (level <= 2) {
      const firstVerb = single.kkoList[0] || 'Mengenal';
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: 'C1',
          uraian: `Pengertian dasar ${topic}`,
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: 'C2',
          uraian: `${firstVerb} bagian ${topic}`,
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: 'C3-C4',
          uraian: `Simpulan & contoh ${topic}`,
        },
      ];
    } else if (level === 3) {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: 'C1-C2',
          uraian: `Dasar & fungsi ${topic}`,
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: 'C2-C3',
          uraian: `Cara kerja & langkah ${topic}`,
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: 'C3-C4',
          uraian: `${targetKKO} & uji ${topic}`,
        },
      ];
    } else if (level === 4) {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: 'C1-C2',
          uraian: `Konsep dasar ${topic}`,
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: 'C2-C3',
          uraian: `Komponen & alur ${topic}`,
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: 'C4',
          uraian: `${targetKKO} & solusi ${topic}`,
        },
      ];
    } else {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: 'C1-C2',
          uraian: `Prinsip & standar ${topic}`,
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: 'C3-C4',
          uraian: `Analisis struktur ${topic}`,
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: level === 5 ? 'C5' : 'C6',
          uraian: `${targetKKO} & validasi ${topic}`,
        },
      ];
    }
  } else if (orderedClauses.length === 2) {
    const [low, high] = orderedClauses;
    if (low.bloomLevel >= 3) {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: 'C1-C2',
          uraian: `Konsep dasar ${combinedTopic}`,
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: `C${low.bloomLevel}`,
          uraian: shortenClausePhrase(low.fullText, 5),
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: `C${high.bloomLevel}`,
          uraian: shortenClausePhrase(high.fullText, 5),
        },
      ];
    } else if (high.bloomLevel <= 2) {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: `C${low.bloomLevel}`,
          uraian: shortenClausePhrase(low.fullText, 5),
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: `C${high.bloomLevel}`,
          uraian: shortenClausePhrase(high.fullText, 5),
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: 'C3-C4',
          uraian: `Penerapan ${shortenTopic(high.lingkupMateri, 3)}`,
        },
      ];
    } else {
      tahapan = [
        {
          tahap: 1,
          label: 'Konsep',
          bloomTag: `C${low.bloomLevel}`,
          uraian: shortenClausePhrase(low.fullText, 5),
        },
        {
          tahap: 2,
          label: 'Pendalaman',
          bloomTag: 'C2-C3',
          uraian: `Bagian & prosedur ${shortenTopic(high.lingkupMateri, 3)}`,
        },
        {
          tahap: 3,
          label: 'Penerapan',
          bloomTag: `C${high.bloomLevel}`,
          uraian: shortenClausePhrase(high.fullText, 5),
        },
      ];
    }
  } else {
    const total = orderedClauses.length;
    const split1 = Math.max(1, Math.floor(total / 3));
    const split2 = Math.max(split1 + 1, Math.floor((total * 2) / 3));

    const stage1Clauses = orderedClauses.slice(0, split1);
    const stage2Clauses = orderedClauses.slice(split1, split2);
    const stage3Clauses = orderedClauses.slice(split2);

    tahapan = [
      {
        tahap: 1,
        label: 'Konsep',
        bloomTag: `C${stage1Clauses[0].bloomLevel}`,
        uraian: buildStageDescription(stage1Clauses, `Konsep ${combinedTopic}`),
      },
      {
        tahap: 2,
        label: 'Pendalaman',
        bloomTag: `C${stage2Clauses[0].bloomLevel}`,
        uraian: buildStageDescription(stage2Clauses, `Pendalaman ${combinedTopic}`),
      },
      {
        tahap: 3,
        label: 'Penerapan',
        bloomTag: `C${stage3Clauses[stage3Clauses.length - 1].bloomLevel}`,
        uraian: buildStageDescription(stage3Clauses, `Penerapan ${combinedTopic}`),
      },
    ];
  }

  const atpText = tahapan
    .map((item) => `Tahap ${item.tahap} (${item.label}): ${item.uraian}`)
    .join(' --> ');

  return {
    kompetensi,
    lingkupMateri: materiList,
    prinsipAlur: 'Mudah ke Sulit • Dasar ke Kompleks',
    tahapan,
    atpText,
  };
}

/**
 * Generates an Alur Tujuan Pembelajaran (ATP) mindmap progression string
 * strictly based on Tujuan Pembelajaran (TP) entered by the user.
 */
export function generateATPFromTP(tp?: string): string {
  return analyzeTPForATP(tp).atpText;
}

