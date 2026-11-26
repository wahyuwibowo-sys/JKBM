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

function cleanPedagogicalPrefix(text: string): string {
  return text
    .replace(/^[\s•\-*]+/, '')
    .replace(/^(?:\d{1,2}|[a-zA-Z])[\.\)]\s+/, '')
    .replace(
      /^(?:pada\s+akhir\s+fase\s+[a-z0-9/]+\s*,?\s*)?(?:peserta\s+didik|siswa|murid)\s+(?:diharapkan\s+|akan\s+)?(?:mampu|dapat|bisa)\s+/i,
      ''
    )
    .replace(/^(?:mampu|dapat)\s+/i, '')
    .replace(/[\s.;:,]+$/g, '')
    .trim();
}

function formatStagePhrase(text: string, maxLen = 78): string {
  const cleaned = cleanPedagogicalPrefix(text).replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (capitalized.length <= maxLen) return capitalized;
  const sliced = capitalized.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > 24 ? sliced.slice(0, lastSpace) : sliced).trim()}`;
}

function extractStepsFromTP(tp: string): string[] {
  if (!tp || !tp.trim()) return [];
  const normalized = tp
    .replace(/\r\n/g, '\n')
    // Split inline numbered lists like "1. ... 2. ..." without breaking numbers like 802.1Q
    .replace(/\s+(?=\d{1,2}[\.\)]\s+[A-Za-z])/g, '\n')
    .replace(/\s+(?=[•\-*]\s+[A-Za-z])/g, '\n');

  const rawLines = normalized
    .split(/\n+|;\s+/)
    .map((line) => formatStagePhrase(line))
    .filter((line) => line.length >= 4);

  if (rawLines.length > 1) {
    return rawLines.slice(0, 4);
  }

  // Single line TP: check if composed of multiple sentences or clauses
  const single = normalized.trim();
  const sentences = single
    .split(/\.\s+(?=[A-Z])/)
    .map((s) => formatStagePhrase(s))
    .filter((s) => s.length >= 4);
  if (sentences.length > 1) {
    return sentences.slice(0, 4);
  }

  return rawLines;
}

function extractClausesFromCP(cp: string): string[] {
  if (!cp || !cp.trim()) return [];
  const stripped = cleanPedagogicalPrefix(cp.trim());
  if (!stripped) return [];

  const clauses = stripped
    .split(/\.\s+|;\s+|,\s+(?:serta\s+|dan\s+)?|\s+serta\s+/i)
    .map((part) => formatStagePhrase(part))
    .filter((part) => part.split(/\s+/).length >= 2 && part.length >= 8);

  if (clauses.length > 0) return clauses.slice(0, 4);
  const single = formatStagePhrase(stripped);
  return single ? [single] : [];
}

function isNearDuplicateStage(candidate: string, existing: string[]): boolean {
  const normCand = candidate.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const candWords = new Set(normCand.split(/\s+/).filter((w) => w.length > 3));
  return existing.some((item) => {
    const normItem = item.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (normItem === normCand || normItem.includes(normCand) || normCand.includes(normItem)) {
      return true;
    }
    if (candWords.size === 0) return false;
    const itemWords = normItem.split(/\s+/).filter((w) => w.length > 3);
    const overlap = itemWords.filter((w) => candWords.has(w)).length;
    return overlap >= Math.max(2, Math.ceil(Math.min(candWords.size, itemWords.length) * 0.65));
  });
}

/**
 * Generates an Alur Tujuan Pembelajaran (ATP) progression string ("Tahap 1: ... -> Tahap 2: ...")
 * directly from Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), and optional Materi Pokok.
 */
export function generateATPFromCPTP(params: {
  cp?: string;
  tp?: string;
  materiPokok?: string;
  elemen?: string;
}): string {
  const cpText = (params.cp || '').trim();
  const tpText = (params.tp || '').trim();
  const topicText = formatStagePhrase(params.materiPokok || params.elemen || '', 60);

  if (!cpText && !tpText) {
    return '';
  }

  const tpSteps = extractStepsFromTP(tpText);
  const cpClauses = extractClausesFromCP(cpText);
  const stages: string[] = [];

  if (tpSteps.length >= 3) {
    stages.push(...tpSteps.slice(0, 4));
  } else if (tpSteps.length === 2) {
    // Include an introductory CP clause if distinct, otherwise keep CP + TP flow
    const leadCp = cpClauses.find((c) => !isNearDuplicateStage(c, tpSteps));
    if (leadCp) {
      stages.push(leadCp, ...tpSteps);
    } else if (topicText && !isNearDuplicateStage(topicText, tpSteps)) {
      stages.push(`Pemahaman konsep ${topicText}`, ...tpSteps);
    } else {
      stages.push(...tpSteps, 'Evaluasi ketercapaian & refleksi pembelajaran');
    }
  } else if (tpSteps.length === 1) {
    const distinctCp = cpClauses.filter((c) => !isNearDuplicateStage(c, tpSteps));
    if (distinctCp.length >= 2) {
      stages.push(distinctCp[0], tpSteps[0], distinctCp[1]);
    } else if (distinctCp.length === 1) {
      stages.push(distinctCp[0], tpSteps[0], 'Uji pemahaman, praktik & refleksi');
    } else {
      const baseTopic = topicText || tpSteps[0];
      stages.push(
        `Pengenalan konsep ${baseTopic}`,
        tpSteps[0],
        'Evaluasi hasil & tindak lanjut pembelajaran'
      );
    }
  } else {
    // Only CP is filled
    if (cpClauses.length >= 2) {
      stages.push(...cpClauses.slice(0, 4));
    } else if (cpClauses.length === 1) {
      stages.push(
        `Eksplorasi konsep ${cpClauses[0]}`,
        `Penerapan & praktik terbimbing`,
        `Evaluasi ketercapaian & refleksi`
      );
    }
  }

  const uniqueStages: string[] = [];
  for (const s of stages) {
    const formatted = formatStagePhrase(s);
    if (formatted && !isNearDuplicateStage(formatted, uniqueStages)) {
      uniqueStages.push(formatted);
    }
  }

  if (uniqueStages.length === 0) return '';

  return uniqueStages
    .slice(0, 4)
    .map((stage, idx) => `Tahap ${idx + 1}: ${stage}`)
    .join(' -> ');
}
