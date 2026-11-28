import { KurikulumCPTP } from '../types';
import { generateATPFromTP } from '../utils/narrativeGenerator';

const createBskapEntry = (
  id: string,
  mapel_kode: string,
  fase: 'E' | 'F',
  elemen: string,
  cp: string,
  materi_pokok: string,
  tp: string
): KurikulumCPTP => ({
  id,
  mapel_kode,
  fase,
  elemen,
  materi_pokok,
  cp,
  tp,
  atp: generateATPFromTP(tp),
});

/**
 * Bank CP, Materi Esensial per Topik, TP, dan ATP otomatis
 * diselaraskan dengan Lampiran II Keputusan Kepala BSKAP No. 046/H/KR/2025
 * untuk Mata Pelajaran Umum & Pilihan SMKN 1 Sidayu Gresik (Fase E & Fase F).
 */
export const BSKAP_2025_CP_TP: KurikulumCPTP[] = [
  // =========================================================================
  // 1. PABP — Pendidikan Agama Islam dan Budi Pekerti (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-01',
    'PABP',
    'E',
    "A. Al-Qur'an Hadis",
    "Memahami ayat Al-Qur'an dan hadis tentang perintah berlomba-lomba dalam kebaikan, larangan pergaulan bebas, dan zina.",
    'Perintah berlomba-lomba dalam kebaikan (fastabiqul khairat)',
    "Menganalisis kandungan Q.S. al-Mā'idah/5: 48 dan hadis tentang kompetisi dalam kebaikan serta membiasakan sikap kompetitif secara sehat."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-02',
    'PABP',
    'E',
    "A. Al-Qur'an Hadis",
    "Memahami ayat Al-Qur'an dan hadis tentang perintah berlomba-lomba dalam kebaikan, larangan pergaulan bebas, dan zina.",
    'Larangan pergaulan bebas dan perbuatan zina',
    "Menganalisis bahaya pergaulan bebas dan zina berdasarkan Q.S. al-Isrā'/17: 32 serta merancang strategi menjaga kehormatan diri."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-03',
    'PABP',
    'E',
    'B. Akidah',
    "Memahami beberapa cabang iman (syu'ab al-īmān).",
    "Hakikat dan klasifikasi cabang iman (syu'ab al-īmān)",
    "Menguraikan hakikat dan klasifikasi cabang-cabang iman (syu'ab al-īmān) dalam dimensi hati, lisan, dan perbuatan."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-04',
    'PABP',
    'E',
    'B. Akidah',
    "Memahami beberapa cabang iman (syu'ab al-īmān).",
    "Implementasi syu'ab al-īmān dalam kehidupan sehari-hari",
    'Menunjukkan perilaku yang mencerminkan keterpenuhan cabang-cabang iman dalam pergaulan di sekolah dan masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-05',
    'PABP',
    'E',
    'C. Akhlak',
    'Memahami manfaat menghindari penyakit hati.',
    "Bahaya penyakit hati (riya', sum'ah, takabur, hasad)",
    'Menganalisis faktor penyebab dan dampak negatif penyakit hati bagi individu maupun keharmonisan sosial.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-06',
    'PABP',
    'E',
    'C. Akhlak',
    'Memahami manfaat menghindari penyakit hati.',
    "Pembiasaan akhlak terpuji (ikhlas, tawaduk, qana'ah)",
    'Menerapkan langkah-langkah pengendalian diri dan pembiasaan akhlak terpuji untuk menghindari penyakit hati.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-07',
    'PABP',
    'E',
    'D. Fikih',
    'Memahami sumber hukum Islam dan pentingnya menjaga lima prinsip dasar hukum Islam (al-kulliyāt al-khamsah).',
    "Sumber hukum Islam (Al-Qur'an, Hadis, Ijtihad)",
    "Menjelaskan kedudukan, fungsi, dan hubungan antara Al-Qur'an, Hadis, dan Ijtihad sebagai sumber hukum Islam."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-08',
    'PABP',
    'E',
    'D. Fikih',
    'Memahami sumber hukum Islam dan pentingnya menjaga lima prinsip dasar hukum Islam (al-kulliyāt al-khamsah).',
    'Lima prinsip dasar hukum Islam (al-kulliyāt al-khamsah)',
    'Menganalisis urgensi menjaga lima prinsip dasar hukum Islam (al-kulliyāt al-khamsah) demi kemaslahatan umat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-09',
    'PABP',
    'E',
    'E. Sejarah Peradaban Islam',
    'Memahami sejarah masuknya Islam ke Indonesia dan peran tokoh ulama dalam penyebarannya.',
    'Jalur dan sejarah masuknya Islam ke Indonesia',
    'Mengevaluasi berbagai teori dan jalur masuknya Islam ke Nusantara melalui perdagangan, pendidikan, dan akulturasi budaya.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-E-10',
    'PABP',
    'E',
    'E. Sejarah Peradaban Islam',
    'Memahami sejarah masuknya Islam ke Indonesia dan peran tokoh ulama dalam penyebarannya.',
    'Peran dan strategi dakwah tokoh ulama Nusantara',
    'Meneladani strategi dakwah para tokoh ulama Nusantara yang santun, kontekstual, dan menghargai kearifan lokal.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-01',
    'PABP',
    'F',
    "A. Al-Qur'an Hadis",
    "Memahami ayat Al-Qur'an dan hadis tentang pentingnya berpikir kritis, ilmu pengetahuan dan teknologi, memelihara kehidupan manusia, dan moderasi beragama.",
    'Berpikir kritis (tafakkur) dan pengembangan IPTEK',
    "Mengkaji dalil Al-Qur'an dan hadis tentang perintah berpikir kritis dan mengembangkan IPTEK untuk kemaslahatan."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-02',
    'PABP',
    'F',
    "A. Al-Qur'an Hadis",
    "Memahami ayat Al-Qur'an dan hadis tentang pentingnya berpikir kritis, ilmu pengetahuan dan teknologi, memelihara kehidupan manusia, dan moderasi beragama.",
    'Kewajiban memelihara kehidupan manusia (larangan kekerasan)',
    "Menganalisis nilai perlindungan jiwa manusia dan larangan tindakan kekerasan berdasarkan dalil Al-Qur'an dan hadis."
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-03',
    'PABP',
    'F',
    "A. Al-Qur'an Hadis",
    "Memahami ayat Al-Qur'an dan hadis tentang pentingnya berpikir kritis, ilmu pengetahuan dan teknologi, memelihara kehidupan manusia, dan moderasi beragama.",
    'Prinsip moderasi beragama (wasathiyah)',
    'Merumuskan sikap moderat dan toleran dalam keberagaman berdasarkan prinsip wasathiyah dalam Islam.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-04',
    'PABP',
    'F',
    'B. Akidah',
    "Memahami beberapa cabang iman (syu'ab al-īmān) serta keterkaitan antara iman, Islam, dan ihsan.",
    'Cabang iman terkait integritas dan tanggung jawab sosial',
    'Menganalisis penerapan cabang-cabang iman dalam menjaga amanah, kejujuran, dan tanggung jawab sosial.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-05',
    'PABP',
    'F',
    'B. Akidah',
    "Memahami beberapa cabang iman (syu'ab al-īmān) serta keterkaitan antara iman, Islam, dan ihsan.",
    'Keterkaitan integral iman, Islam, dan ihsan',
    'Menyimpulkan hubungan sinergis antara iman, Islam, dan ihsan dalam pembentukan karakter muslim yang utuh.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-06',
    'PABP',
    'F',
    'C. Akhlak',
    'Memahami manfaat menghindari penyakit sosial; memahami adab bermasyarakat dan etika digital dalam Islam.',
    'Pencegahan penyakit sosial (perundungan, narkoba, dll.)',
    'Menganalisis dampak penyakit sosial dan merancang upaya preventif di lingkungan remaja.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-07',
    'PABP',
    'F',
    'C. Akhlak',
    'Memahami manfaat menghindari penyakit sosial; memahami adab bermasyarakat dan etika digital dalam Islam.',
    'Adab bermasyarakat dan etika digital (tabayyun)',
    'Menerapkan adab bermasyarakat serta prinsip tabayyun dan etika Islami dalam bermedia digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-08',
    'PABP',
    'F',
    'D. Fikih',
    'Memahami ketentuan khotbah, tablig dan dakwah, muamalah, munakahat, dan mawāris.',
    'Ketentuan khotbah, tablig, dan dakwah',
    'Membedakan syarat, rukun, dan etika pelaksanaan khotbah, tablig, serta dakwah di era kontemporer.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-09',
    'PABP',
    'F',
    'D. Fikih',
    'Memahami ketentuan khotbah, tablig dan dakwah, muamalah, munakahat, dan mawāris.',
    'Prinsip dan transaksi muamalah syariah',
    'Menganalisis keabsahan transaksi muamalah syariah serta menjauhi praktik riba dan gharar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-10',
    'PABP',
    'F',
    'D. Fikih',
    'Memahami ketentuan khotbah, tablig dan dakwah, muamalah, munakahat, dan mawāris.',
    'Ketentuan pernikahan (munakahat) dan waris (mawāris)',
    'Menjelaskan rukun dan hikmah pernikahan (munakahat) serta menghitung pembagian harta waris (mawāris).'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-11',
    'PABP',
    'F',
    'E. Sejarah Peradaban Islam',
    'Memahami peran tokoh ulama dalam perkembangan peradaban Islam di dunia dan peran organisasi-organisasi Islam di Indonesia.',
    'Peran tokoh ulama dalam peradaban Islam dunia',
    'Mengevaluasi kontribusi pemikiran dan karya tokoh ulama/ilmuwan muslim bagi peradaban dunia.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PABP-F-12',
    'PABP',
    'F',
    'E. Sejarah Peradaban Islam',
    'Memahami peran tokoh ulama dalam perkembangan peradaban Islam di dunia dan peran organisasi-organisasi Islam di Indonesia.',
    'Peran organisasi-organisasi Islam di Indonesia',
    'Menganalisis kontribusi organisasi kemasyarakatan Islam di Indonesia dalam bidang pendidikan, sosial, dan kebangsaan.'
  ),

  // =========================================================================
  // 2. PP — Pendidikan Pancasila (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-PP-E-01',
    'PP',
    'E',
    'A. Pancasila',
    'Menganalisis cara pandang para perumus Pancasila tentang dasar negara; menganalisis kedudukan Pancasila sebagai dasar negara, pandangan hidup bangsa, dan ideologi negara.',
    'Cara pandang para perumus Pancasila tentang dasar negara',
    'Menganalisis dinamika gagasan para tokoh perumus Pancasila dalam sidang BPUPK hingga penetapan dasar negara.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-02',
    'PP',
    'E',
    'A. Pancasila',
    'Menganalisis cara pandang para perumus Pancasila tentang dasar negara; menganalisis kedudukan Pancasila sebagai dasar negara, pandangan hidup bangsa, dan ideologi negara.',
    'Kedudukan Pancasila sebagai dasar negara, pandangan hidup & ideologi',
    'Membedakan fungsi dan implementasi Pancasila sebagai dasar negara, pandangan hidup bangsa, dan ideologi terbuka.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-03',
    'PP',
    'E',
    'B. UUD NRI Tahun 1945',
    'Menerapkan perilaku taat hukum berdasarkan peraturan yang berlaku untuk mewujudkan harmoni; menganalisis tata urutan peraturan perundang-undangan di Indonesia dan Pancasila sebagai sumber dari segala sumber hukum negara.',
    'Penerapan perilaku taat hukum dalam kehidupan bermasyarakat',
    'Menunjukkan perilaku taat hukum dan menganalisis dampak kepatuhan hukum terhadap ketertiban masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-04',
    'PP',
    'E',
    'B. UUD NRI Tahun 1945',
    'Menerapkan perilaku taat hukum berdasarkan peraturan yang berlaku untuk mewujudkan harmoni; menganalisis tata urutan peraturan perundang-undangan di Indonesia dan Pancasila sebagai sumber dari segala sumber hukum negara.',
    'Tata urutan peraturan perundang-undangan & Pancasila sumber segala sumber hukum',
    'Menganalisis hierarki peraturan perundang-undangan di Indonesia serta keselarasan substansinya dengan nilai Pancasila.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-05',
    'PP',
    'E',
    'C. Bhinneka Tunggal Ika',
    'Menyajikan makna semboyan Bhinneka Tunggal Ika sebagai modal sosial; memahami prinsip gotong royong sebagai perwujudan sistem ekonomi Pancasila yang inklusif dan berkeadilan.',
    'Makna Bhinneka Tunggal Ika sebagai modal sosial bangsa',
    'Menyajikan analisis tentang peran keberagaman dan Bhinneka Tunggal Ika sebagai modal sosial pemersatu bangsa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-06',
    'PP',
    'E',
    'C. Bhinneka Tunggal Ika',
    'Menyajikan makna semboyan Bhinneka Tunggal Ika sebagai modal sosial; memahami prinsip gotong royong sebagai perwujudan sistem ekonomi Pancasila yang inklusif dan berkeadilan.',
    'Prinsip gotong royong dalam sistem ekonomi Pancasila yang berkeadilan',
    'Menganalisis penerapan prinsip gotong royong dalam praktik sistem ekonomi Pancasila yang inklusif dan berkeadilan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-07',
    'PP',
    'E',
    'D. Negara Kesatuan Republik Indonesia',
    'Memahami peran dan kedudukannya sebagai warga negara Indonesia; memahami sistem pertahanan dan keamanan negara; menganalisis peran Indonesia dalam hubungan antarnegara; memahami nilai-nilai Pancasila dalam pembangunan nasional.',
    'Peran, hak, dan kewajiban warga negara Indonesia',
    'Mengidentifikasi hak dan kewajiban konstitusional warga negara serta bentuk partisipasi aktif di masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-08',
    'PP',
    'E',
    'D. Negara Kesatuan Republik Indonesia',
    'Memahami peran dan kedudukannya sebagai warga negara Indonesia; memahami sistem pertahanan dan keamanan negara; menganalisis peran Indonesia dalam hubungan antarnegara; memahami nilai-nilai Pancasila dalam pembangunan nasional.',
    'Sistem pertahanan dan keamanan negara (Sishankamrata)',
    'Menjelaskan komponen dan mekanisme sistem pertahanan dan keamanan rakyat semesta (Sishankamrata).'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-E-09',
    'PP',
    'E',
    'D. Negara Kesatuan Republik Indonesia',
    'Memahami peran dan kedudukannya sebagai warga negara Indonesia; memahami sistem pertahanan dan keamanan negara; menganalisis peran Indonesia dalam hubungan antarnegara; memahami nilai-nilai Pancasila dalam pembangunan nasional.',
    'Peran Indonesia dalam hubungan antarnegara & pembangunan nasional',
    'Menganalisis kontribusi Indonesia dalam hubungan internasional dan perwujudan nilai Pancasila dalam pembangunan nasional.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-01',
    'PP',
    'F',
    'A. Pancasila',
    'Mendeskripsikan rumusan dan keterkaitan sila-sila dalam Pancasila; menganalisis peluang dan tantangan penerapan nilai-nilai Pancasila dalam kehidupan global serta membiasakan perilaku sesuai nilai Pancasila.',
    'Rumusan dan keterkaitan hierarkis sila-sila dalam Pancasila',
    'Mendeskripsikan hubungan organis dan saling menjiwai antar-sila dalam Pancasila sebagai satu kesatuan utuh.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-02',
    'PP',
    'F',
    'A. Pancasila',
    'Mendeskripsikan rumusan dan keterkaitan sila-sila dalam Pancasila; menganalisis peluang dan tantangan penerapan nilai-nilai Pancasila dalam kehidupan global serta membiasakan perilaku sesuai nilai Pancasila.',
    'Peluang dan tantangan penerapan nilai Pancasila di era global',
    'Mengevaluasi peluang serta merumuskan strategi menghadapi tantangan penerapan nilai Pancasila dalam kehidupan global.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-03',
    'PP',
    'F',
    'B. UUD NRI Tahun 1945',
    'Menganalisis dinamika pemberlakuan UUD 1945; menunjukkan sikap demokratis di era keterbukaan informasi; menganalisis kasus pelanggaran hak dan pengingkaran kewajiban warga negara serta merumuskan solusi perlindungan hukum; menganalisis kesatuan Pancasila dengan UUD 1945.',
    'Dinamika pemberlakuan UUD 1945 & kesatuannya dengan Pancasila',
    'Menganalisis periodisasi pemberlakuan dan amandemen UUD 1945 serta keterkaitannya dengan Pancasila.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-04',
    'PP',
    'F',
    'B. UUD NRI Tahun 1945',
    'Menganalisis dinamika pemberlakuan UUD 1945; menunjukkan sikap demokratis di era keterbukaan informasi; menganalisis kasus pelanggaran hak dan pengingkaran kewajiban warga negara serta merumuskan solusi perlindungan hukum; menganalisis kesatuan Pancasila dengan UUD 1945.',
    'Sikap demokratis di era keterbukaan informasi',
    'Menunjukkan praktik berdemokrasi yang santun, kritis, dan bertanggung jawab di era keterbukaan informasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-05',
    'PP',
    'F',
    'B. UUD NRI Tahun 1945',
    'Menganalisis dinamika pemberlakuan UUD 1945; menunjukkan sikap demokratis di era keterbukaan informasi; menganalisis kasus pelanggaran hak dan pengingkaran kewajiban warga negara serta merumuskan solusi perlindungan hukum; menganalisis kesatuan Pancasila dengan UUD 1945.',
    'Analisis kasus pelanggaran hak/kewajiban & solusi perlindungan hukum',
    'Menganalisis kasus pelanggaran hak dan pengingkaran kewajiban warga negara serta merumuskan solusi perlindungan hukum.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-06',
    'PP',
    'F',
    'C. Bhinneka Tunggal Ika',
    'Menganalisis potensi konflik dan memberi solusi yang berkeadilan terhadap permasalahan keberagaman di masyarakat; merancang kegiatan bersama dengan prinsip gotong royong dalam praktik hidup sehari-hari.',
    'Analisis potensi konflik keberagaman & resolusi yang berkeadilan',
    'Menganalisis potensi konflik dalam masyarakat majemuk serta merumuskan solusi penyelesaian yang adil dan damai.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-07',
    'PP',
    'F',
    'C. Bhinneka Tunggal Ika',
    'Menganalisis potensi konflik dan memberi solusi yang berkeadilan terhadap permasalahan keberagaman di masyarakat; merancang kegiatan bersama dengan prinsip gotong royong dalam praktik hidup sehari-hari.',
    'Perancangan kegiatan kolaboratif berbasis prinsip gotong royong',
    'Merancang dan melaksanakan kegiatan sosial bersama berbasis prinsip gotong royong di lingkungan masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-08',
    'PP',
    'F',
    'D. Negara Kesatuan Republik Indonesia',
    'Mendemonstrasikan praktik demokrasi berlandaskan Pancasila; menganalisis dan merumuskan solusi terkait ATHG yang dihadapi Indonesia; menganalisis sistem pemerintahan Indonesia dan peran lembaga negara.',
    'Praktik demokrasi berlandaskan Pancasila',
    'Mendemonstrasikan praktik pengambilan keputusan demokratis yang berlandaskan nilai-nilai Pancasila.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-09',
    'PP',
    'F',
    'D. Negara Kesatuan Republik Indonesia',
    'Mendemonstrasikan praktik demokrasi berlandaskan Pancasila; menganalisis dan merumuskan solusi terkait ATHG yang dihadapi Indonesia; menganalisis sistem pemerintahan Indonesia dan peran lembaga negara.',
    'Analisis Ancaman, Tantangan, Hambatan, dan Gangguan (ATHG) NKRI',
    'Menganalisis bentuk-bentuk ATHG terhadap keutuhan NKRI di berbagai bidang beserta strategi penanganannya.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PP-F-10',
    'PP',
    'F',
    'D. Negara Kesatuan Republik Indonesia',
    'Mendemonstrasikan praktik demokrasi berlandaskan Pancasila; menganalisis dan merumuskan solusi terkait ATHG yang dihadapi Indonesia; menganalisis sistem pemerintahan Indonesia dan peran lembaga negara.',
    'Sistem pemerintahan Indonesia dan peran lembaga-lembaga negara',
    'Menganalisis sistem pemerintahan Indonesia serta hubungan kewenangan antarlembaga negara.'
  ),

  // =========================================================================
  // 3. BIN — Bahasa Indonesia (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-01',
    'BIN',
    'E',
    'A. Menyimak',
    'Mengevaluasi gagasan, pandangan, arahan, dan/atau pesan dari teks nonsastra berbentuk teks aural; mengevaluasi unsur intrinsik dan ekstrinsik teks sastra berbentuk teks aural.',
    'Evaluasi gagasan teks nonsastra aural (LHO, anekdot, negosiasi)',
    'Mengevaluasi ketepatan gagasan, pandangan, dan pesan dari paparan lisan teks LHO, anekdot, dan negosiasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-02',
    'BIN',
    'E',
    'A. Menyimak',
    'Mengevaluasi gagasan, pandangan, arahan, dan/atau pesan dari teks nonsastra berbentuk teks aural; mengevaluasi unsur intrinsik dan ekstrinsik teks sastra berbentuk teks aural.',
    'Evaluasi unsur intrinsik & ekstrinsik teks sastra aural (hikayat, puisi)',
    'Menganalisis dan mengevaluasi unsur intrinsik serta nilai ekstrinsik dari hikayat dan puisi yang disimak.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-03',
    'BIN',
    'E',
    'B. Membaca dan Memirsa',
    'Mengevaluasi informasi berupa gagasan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat; menginterpretasi gagasan dan perasaan; mengevaluasi kredibilitas teks menggunakan sumber lain; membandingkan isi teks.',
    'Interpretasi makna tersurat & tersirat teks LHO, anekdot, dan negosiasi',
    'Menginterpretasi fakta, pesan tersurat, dan makna tersirat dari teks LHO, anekdot, dan negosiasi visual/audiovisual.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-04',
    'BIN',
    'E',
    'B. Membaca dan Memirsa',
    'Mengevaluasi informasi berupa gagasan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat; menginterpretasi gagasan dan perasaan; mengevaluasi kredibilitas teks menggunakan sumber lain; membandingkan isi teks.',
    'Evaluasi kredibilitas dan perbandingan isi teks biografi & artikel',
    'Mengevaluasi kredibilitas informasi teks biografi maupun artikel dengan membandingkannya terhadap sumber lain.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-05',
    'BIN',
    'E',
    'B. Membaca dan Memirsa',
    'Mengevaluasi informasi berupa gagasan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat; menginterpretasi gagasan dan perasaan; mengevaluasi kredibilitas teks menggunakan sumber lain; membandingkan isi teks.',
    'Interpretasi gagasan, perasaan & nilai estetis teks hikayat dan puisi',
    'Menginterpretasi suasana, perasaan, diksi, dan nilai-nilai kehidupan dalam teks hikayat serta puisi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-06',
    'BIN',
    'E',
    'C. Berbicara dan Mempresentasikan',
    'Mempresentasikan gagasan, pandangan, arahan, dan/atau pesan berbagai tipe teks berbentuk monolog, dialog, dan/atau gelar wicara secara sistematis, kritis, dan kreatif; mengungkapkan kepedulian dari teks multimodal secara kreatif.',
    'Presentasi monolog LHO, dialog negosiasi, dan gelar wicara',
    'Mempresentasikan gagasan secara sistematis dan kritis dalam bentuk monolog LHO, dialog negosiasi, dan gelar wicara.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-07',
    'BIN',
    'E',
    'C. Berbicara dan Mempresentasikan',
    'Mempresentasikan gagasan, pandangan, arahan, dan/atau pesan berbagai tipe teks berbentuk monolog, dialog, dan/atau gelar wicara secara sistematis, kritis, dan kreatif; mengungkapkan kepedulian dari teks multimodal secara kreatif.',
    'Penyajian kreatif karya sastra (musikalisasi puisi & penceritaan hikayat)',
    'Mengungkapkan kepedulian dan penghayatan estetis melalui musikalisasi puisi atau penyajian kreatif teks multimodal.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-08',
    'BIN',
    'E',
    'D. Menulis',
    'Menulis gagasan, pandangan, arahan, pesan, dan/atau imajinasi dalam berbagai tipe teks secara logis, kritis, dan kreatif; memublikasikan hasil karya di media cetak, elektronik, dan/atau digital.',
    'Penulisan teks nonsastra (teks LHO, teks negosiasi, teks biografi)',
    'Menulis teks LHO, negosiasi, dan biografi secara logis dengan struktur teks dan kaidah kebahasaan yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-E-09',
    'BIN',
    'E',
    'D. Menulis',
    'Menulis gagasan, pandangan, arahan, pesan, dan/atau imajinasi dalam berbagai tipe teks secara logis, kritis, dan kreatif; memublikasikan hasil karya di media cetak, elektronik, dan/atau digital.',
    'Penulisan karya sastra (anekdot, cerpen adaptasi hikayat, puisi) & publikasi',
    'Menulis teks anekdot, cerpen berbasis nilai hikayat, dan puisi secara kreatif serta memublikasikannya di media cetak/digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-01',
    'BIN',
    'F',
    'A. Menyimak',
    'Mengevaluasi gagasan, perasaan, pandangan, arahan, dan/atau pesan dari teks nonsastra berbentuk teks aural; mengapresiasi teks sastra berbentuk teks aural.',
    'Evaluasi argumen teks nonsastra aural (argumentasi, berita, editorial)',
    'Mengevaluasi kelogisan argumen dan objektivitas informasi pada teks berita, editorial, atau debat berbentuk aural.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-02',
    'BIN',
    'F',
    'A. Menyimak',
    'Mengevaluasi gagasan, perasaan, pandangan, arahan, dan/atau pesan dari teks nonsastra berbentuk teks aural; mengapresiasi teks sastra berbentuk teks aural.',
    'Apresiasi nilai estetika teks sastra aural (cerpen, puisi, drama)',
    'Mengapresiasi penghayatan estetis, penokohan, dan pesan moral dari pementasan drama atau pembacaan karya sastra aural.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-03',
    'BIN',
    'F',
    'B. Membaca dan Memirsa',
    'Mengevaluasi dan merefleksi informasi berupa gagasan, perasaan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat berdasarkan kaidah logika berpikir; mengapresiasi teks visual/audiovisual.',
    'Evaluasi logika berpikir pada teks argumentasi, berita & editorial',
    'Mengevaluasi koherensi argumen, fakta-opini, dan kaidah logika berpikir pada teks argumentasi, berita, dan editorial.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-04',
    'BIN',
    'F',
    'B. Membaca dan Memirsa',
    'Mengevaluasi dan merefleksi informasi berupa gagasan, perasaan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat berdasarkan kaidah logika berpikir; mengapresiasi teks visual/audiovisual.',
    'Analisis sistematika & kebahasaan Karya Tulis Ilmiah (KTI)',
    'Menganalisis sistematika, objektivitas data, dan ragam bahasa ilmiah pada Karya Tulis Ilmiah (KTI).'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-05',
    'BIN',
    'F',
    'B. Membaca dan Memirsa',
    'Mengevaluasi dan merefleksi informasi berupa gagasan, perasaan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks visual/audiovisual untuk menemukan makna tersurat dan tersirat berdasarkan kaidah logika berpikir; mengapresiasi teks visual/audiovisual.',
    'Apresiasi & refleksi makna teks sastra (cerpen, novel, puisi, drama)',
    'Merefleksikan nilai sosial, budaya, dan estetika dalam cerpen, novel, puisi, serta naskah drama.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-06',
    'BIN',
    'F',
    'C. Berbicara dan Mempresentasikan',
    'Mempresentasikan gagasan, perasaan, pandangan, arahan, dan kreativitas berbahasa dalam monolog, dialog, dan gelar wicara sesuai norma kesopanan dan budaya Indonesia; menyajikan karya sastra secara kreatif; mempertahankan hasil penelitian dengan argumentasi.',
    'Presentasi dan pertahanan hasil penelitian (KTI) berbasis data',
    'Mempresentasikan hasil penelitian dalam diskusi ilmiah dan mempertahankan simpulan dengan argumentasi logis.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-07',
    'BIN',
    'F',
    'C. Berbicara dan Mempresentasikan',
    'Mempresentasikan gagasan, perasaan, pandangan, arahan, dan kreativitas berbahasa dalam monolog, dialog, dan gelar wicara sesuai norma kesopanan dan budaya Indonesia; menyajikan karya sastra secara kreatif; mempertahankan hasil penelitian dengan argumentasi.',
    'Pementasan drama, penyajian karya sastra & gelar wicara santun',
    'Mementaskan drama atau menyajikan karya sastra secara kreatif sesuai norma kesopanan dan budaya Indonesia.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-08',
    'BIN',
    'F',
    'D. Menulis',
    'Menulis gagasan, pandangan, imajinasi, dan/atau pengetahuan metakognisi dalam berbagai tipe teks secara logis, kritis, dan kreatif; memublikasikan hasil karya di media cetak, elektronik, dan/atau digital.',
    'Penulisan teks argumentasi, berita, esai kritik, dan resensi',
    'Menulis teks argumentasi, berita, dan esai resensi secara logis dan kritis berbasis data.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-09',
    'BIN',
    'F',
    'D. Menulis',
    'Menulis gagasan, pandangan, imajinasi, dan/atau pengetahuan metakognisi dalam berbagai tipe teks secara logis, kritis, dan kreatif; memublikasikan hasil karya di media cetak, elektronik, dan/atau digital.',
    'Penulisan Karya Tulis Ilmiah (KTI) sesuai kaidah akademik',
    'Menyusun Karya Tulis Ilmiah (KTI) berdasarkan hasil pengamatan/penelitian secara sistematis dan bebas plagiarisme.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIN-F-10',
    'BIN',
    'F',
    'D. Menulis',
    'Menulis gagasan, pandangan, imajinasi, dan/atau pengetahuan metakognisi dalam berbagai tipe teks secara logis, kritis, dan kreatif; memublikasikan hasil karya di media cetak, elektronik, dan/atau digital.',
    'Penulisan karya sastra kreatif (cerpen & naskah drama) serta publikasi',
    'Menulis cerpen dan naskah drama kreatif serta memublikasikannya di media cetak, elektronik, atau digital.'
  ),

  // =========================================================================
  // 4. MAT — Matematika (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-01',
    'MAT',
    'E',
    'A. Bilangan',
    'Menggeneralisasi sifat-sifat bilangan berpangkat (termasuk bilangan pangkat pecahan), dan menggunakannya untuk menyelesaikan masalah.',
    'Sifat-sifat bilangan berpangkat bulat (eksponen) dan bentuk akar',
    'Menggeneralisasi sifat-sifat operasi bilangan berpangkat bulat dan menyederhanakan bentuk akar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-02',
    'MAT',
    'E',
    'A. Bilangan',
    'Menggeneralisasi sifat-sifat bilangan berpangkat (termasuk bilangan pangkat pecahan), dan menggunakannya untuk menyelesaikan masalah.',
    'Bilangan berpangkat pecahan dan pemodelan eksponensial sederhana',
    'Menerapkan sifat bilangan berpangkat pecahan untuk menyelesaikan masalah perhitungan kontekstual.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-03',
    'MAT',
    'E',
    'B. Aljabar dan Fungsi',
    'Menyelesaikan masalah sistem pertidaksamaan linear dua variabel; menyelesaikan masalah persamaan dan fungsi kuadrat (termasuk akar imajiner), serta persamaan dan fungsi eksponensial.',
    'Sistem Pertidaksamaan Linear Dua Variabel (SPtLDV)',
    'Memodelkan dan menentukan daerah himpunan penyelesaian masalah kontekstual menggunakan SPtLDV.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-04',
    'MAT',
    'E',
    'B. Aljabar dan Fungsi',
    'Menyelesaikan masalah sistem pertidaksamaan linear dua variabel; menyelesaikan masalah persamaan dan fungsi kuadrat (termasuk akar imajiner), serta persamaan dan fungsi eksponensial.',
    'Persamaan dan fungsi kuadrat (termasuk akar imajiner)',
    'Menyelesaikan persamaan kuadrat (termasuk akar imajiner) dan menganalisis grafik fungsi kuadrat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-05',
    'MAT',
    'E',
    'B. Aljabar dan Fungsi',
    'Menyelesaikan masalah sistem pertidaksamaan linear dua variabel; menyelesaikan masalah persamaan dan fungsi kuadrat (termasuk akar imajiner), serta persamaan dan fungsi eksponensial.',
    'Persamaan dan fungsi eksponensial (pertumbuhan & peluruhan)',
    'Menyelesaikan persamaan eksponensial dan memodelkan fenomena pertumbuhan maupun peluruhan menggunakan fungsi eksponensial.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-06',
    'MAT',
    'E',
    'C. Geometri',
    'Mengaplikasikan perbandingan trigonometri (sinus, cosinus, tangen) dari sudut lancip.',
    'Perbandingan trigonometri dasar (sinus, cosinus, tangen) sudut lancip',
    'Menentukan nilai perbandingan trigonometri (sin, cos, tan) sudut lancip pada segitiga siku-siku.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-07',
    'MAT',
    'E',
    'C. Geometri',
    'Mengaplikasikan perbandingan trigonometri (sinus, cosinus, tangen) dari sudut lancip.',
    'Aplikasi perbandingan trigonometri pada masalah tinggi dan jarak',
    'Mengaplikasikan perbandingan trigonometri sudut lancip untuk menyelesaikan masalah tinggi dan jarak (sudut elevasi/depresi).'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-08',
    'MAT',
    'E',
    'D. Analisis Data dan Peluang',
    'Merepresentasikan dan menginterpretasi data (jangkauan kuartil/interkuartil, box plot, histogram, dot plot); menggunakan diagram pencar untuk hubungan dua variabel numerik; mengevaluasi laporan statistika di media (termasuk matriks).',
    'Jangkauan kuartil/interkuartil, box plot, histogram, dan dot plot',
    'Menyajikan dan menginterpretasi distribusi data menggunakan ukuran penyebaran kuartil, box plot, histogram, dan dot plot.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-09',
    'MAT',
    'E',
    'D. Analisis Data dan Peluang',
    'Merepresentasikan dan menginterpretasi data (jangkauan kuartil/interkuartil, box plot, histogram, dot plot); menggunakan diagram pencar untuk hubungan dua variabel numerik; mengevaluasi laporan statistika di media (termasuk matriks).',
    'Diagram pencar (scatter plot) untuk hubungan dua variabel numerik',
    'Menggunakan diagram pencar untuk mengidentifikasi arah dan kekuatan hubungan linear dua variabel numerik.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-E-10',
    'MAT',
    'E',
    'D. Analisis Data dan Peluang',
    'Merepresentasikan dan menginterpretasi data (jangkauan kuartil/interkuartil, box plot, histogram, dot plot); menggunakan diagram pencar untuk hubungan dua variabel numerik; mengevaluasi laporan statistika di media (termasuk matriks).',
    'Evaluasi laporan statistika di media & representasi matriks',
    'Mengevaluasi keakuratan laporan statistika di media massa serta merepresentasikan data terstruktur dalam bentuk matriks.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-01',
    'MAT',
    'F',
    'A. Bilangan',
    'Menjelaskan barisan dan deret (aritmetika dan geometri), menerapkannya pada bunga tunggal, bunga majemuk, pinjaman, dan anuitas, serta menyelidiki pengaruh parameternya.',
    'Barisan dan deret aritmetika serta geometri (termasuk tak hingga)',
    'Menentukan suku ke-n dan jumlah n suku pertama barisan/deret aritmetika dan geometri untuk memecahkan masalah.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-02',
    'MAT',
    'F',
    'A. Bilangan',
    'Menjelaskan barisan dan deret (aritmetika dan geometri), menerapkannya pada bunga tunggal, bunga majemuk, pinjaman, dan anuitas, serta menyelidiki pengaruh parameternya.',
    'Aplikasi barisan/deret pada bunga tunggal, majemuk, pinjaman & anuitas',
    'Memodelkan perhitungan bunga tunggal, bunga majemuk, pinjaman, dan anuitas serta menyelidiki pengaruh parameternya.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-03',
    'MAT',
    'F',
    'B. Aljabar dan Fungsi',
    'Menentukan fungsi invers, komposisi fungsi, dan transformasi fungsi untuk memodelkan situasi dunia nyata menggunakan fungsi yang sesuai (linear, kuadrat, eksponensial).',
    'Komposisi fungsi dan fungsi invers beserta syarat keberadaannya',
    'Menentukan rumus serta daerah asal/hasil dari komposisi fungsi dan fungsi invers dalam pemecahan masalah.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-04',
    'MAT',
    'F',
    'B. Aljabar dan Fungsi',
    'Menentukan fungsi invers, komposisi fungsi, dan transformasi fungsi untuk memodelkan situasi dunia nyata menggunakan fungsi yang sesuai (linear, kuadrat, eksponensial).',
    'Transformasi fungsi pada fungsi linear, kuadrat, dan eksponensial',
    'Menerapkan transformasi fungsi (translasi, refleksi, dilatasi) untuk memodelkan situasi dunia nyata.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-05',
    'MAT',
    'F',
    'C. Geometri',
    'Menerapkan, mengidentifikasi, dan menjelaskan hubungan antara unsur-unsur lingkaran untuk menyelesaikan masalah.',
    'Hubungan sudut pusat, sudut keliling, busur, juring & segiempat tali busur',
    'Menerapkan sifat sudut pusat, sudut keliling, panjang busur, dan luas juring untuk menyelesaikan masalah geometris.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-06',
    'MAT',
    'F',
    'C. Geometri',
    'Menerapkan, mengidentifikasi, dan menjelaskan hubungan antara unsur-unsur lingkaran untuk menyelesaikan masalah.',
    'Garis singgung lingkaran (persekutuan dalam dan luar)',
    'Menentukan panjang garis singgung persekutuan lingkaran dan mengaplikasikannya dalam pemecahan masalah.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-07',
    'MAT',
    'F',
    'D. Analisis Data dan Peluang',
    'Melakukan penyelidikan statistika untuk asosiasi dua variabel kategorikal dan numerikal (best fit linear), membedakan asosiasi dan sebab-akibat; menghitung peluang kejadian majemuk, saling bebas, saling lepas, dan bersyarat menggunakan permutasi/kombinasi.',
    'Asosiasi bivariat, regresi linear (best fit) & perbedaan korelasi–kausalitas',
    'Melakukan penyelidikan statistika bivariat menggunakan regresi linear (best fit) serta membedakan asosiasi dan sebab-akibat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-08',
    'MAT',
    'F',
    'D. Analisis Data dan Peluang',
    'Melakukan penyelidikan statistika untuk asosiasi dua variabel kategorikal dan numerikal (best fit linear), membedakan asosiasi dan sebab-akibat; menghitung peluang kejadian majemuk, saling bebas, saling lepas, dan bersyarat menggunakan permutasi/kombinasi.',
    'Kaidah pencacahan (aturan perkalian, permutasi, dan kombinasi)',
    'Menerapkan prinsip permutasi dan kombinasi untuk menyelesaikan masalah pencacahan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MAT-F-09',
    'MAT',
    'F',
    'D. Analisis Data dan Peluang',
    'Melakukan penyelidikan statistika untuk asosiasi dua variabel kategorikal dan numerikal (best fit linear), membedakan asosiasi dan sebab-akibat; menghitung peluang kejadian majemuk, saling bebas, saling lepas, dan bersyarat menggunakan permutasi/kombinasi.',
    'Peluang kejadian majemuk, saling lepas, saling bebas & bersyarat',
    'Menghitung peluang kejadian majemuk, saling lepas, saling bebas, dan bersyarat dalam pengambilan keputusan.'
  ),

  // =========================================================================
  // 5. BIG — Bahasa Inggris (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-01',
    'BIG',
    'E',
    'A. Menyimak–Berbicara',
    'Memahami alur informasi, gagasan utama, dan detail dalam teks lisan fiksi dan nonfiksi tentang topik sehari-hari atau isu terkini; menggunakan bahasa Inggris untuk mengungkapkan pendapat dan mempertahankan argumen.',
    'Pemahaman gagasan utama & detail teks lisan fiksi/nonfiksi (3.000 high frequency words)',
    'Mengidentifikasi alur informasi, gagasan utama, dan detail dari teks lisan fiksi maupun nonfiksi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-02',
    'BIG',
    'E',
    'A. Menyimak–Berbicara',
    'Memahami alur informasi, gagasan utama, dan detail dalam teks lisan fiksi dan nonfiksi tentang topik sehari-hari atau isu terkini; menggunakan bahasa Inggris untuk mengungkapkan pendapat dan mempertahankan argumen.',
    'Ungkapan berpendapat dan mempertahankan argumen dalam diskusi lisan',
    'Menyampaikan pendapat dan mempertahankan argumen secara lisan dalam interaksi berbahasa Inggris.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-03',
    'BIG',
    'E',
    'B. Membaca–Memirsa',
    'Memahami alur informasi, menganalisis dan menyimpulkan informasi tersurat dan tersirat dari berbagai jenis teks fiksi dan nonfiksi tertulis atau multimodal tentang topik sehari-hari atau isu terkini.',
    'Analisis informasi tersurat & tersirat teks Descriptive, Recount, dan Narrative',
    'Menganalisis dan menyimpulkan informasi tersurat maupun tersirat dari teks fiksi dan nonfiksi tertulis.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-04',
    'BIG',
    'E',
    'B. Membaca–Memirsa',
    'Memahami alur informasi, menganalisis dan menyimpulkan informasi tersurat dan tersirat dari berbagai jenis teks fiksi dan nonfiksi tertulis atau multimodal tentang topik sehari-hari atau isu terkini.',
    'Analisis informasi tersurat & tersirat teks Procedure dan Analytical Exposition (tulis/multimodal)',
    'Mengevaluasi tujuan komunikatif dan struktur informasi pada teks multimodal bertema isu terkini.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-05',
    'BIG',
    'E',
    'C. Menulis–Mempresentasikan',
    'Mengomunikasikan gagasan dan pengalaman secara tertulis atau multimodal dalam berbagai jenis teks fiksi dan nonfiksi melalui media cetak/digital dengan struktur teks dan unsur kebahasaan tepat; mempertahankan argumen.',
    'Penulisan teks Descriptive, Recount, Narrative, Procedure & Analytical Exposition',
    'Menulis berbagai jenis teks fiksi dan nonfiksi dengan struktur teks dan unsur kebahasaan yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-E-06',
    'BIG',
    'E',
    'C. Menulis–Mempresentasikan',
    'Mengomunikasikan gagasan dan pengalaman secara tertulis atau multimodal dalam berbagai jenis teks fiksi dan nonfiksi melalui media cetak/digital dengan struktur teks dan unsur kebahasaan tepat; mempertahankan argumen.',
    'Presentasi multimodal karya tulis melalui media cetak atau digital dengan argumen tepat',
    'Mempresentasikan gagasan secara multimodal melalui media cetak atau digital serta mempertahankan argumen.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-01',
    'BIG',
    'F',
    'A. Menyimak–Berbicara',
    'Memahami alur informasi dari teks lisan fiksi dan nonfiksi tentang isu terkini atau topik lintas mata pelajaran; menggunakan bahasa Inggris untuk mengungkapkan pendapat dan mempertahankan argumen.',
    'Analisis wacana lisan isu terkini & topik lintas mata pelajaran (4.000 high frequency words)',
    'Mengevaluasi alur informasi dan gagasan dari teks lisan bertema isu global maupun lintas disiplin.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-02',
    'BIG',
    'F',
    'A. Menyimak–Berbicara',
    'Memahami alur informasi dari teks lisan fiksi dan nonfiksi tentang isu terkini atau topik lintas mata pelajaran; menggunakan bahasa Inggris untuk mengungkapkan pendapat dan mempertahankan argumen.',
    'Strategi debat dan argumentasi lisan untuk mempertahankan pendapat',
    'Mempertahankan argumen secara lisan dengan artikulasi jelas dan struktur logis dalam diskusi/debat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-03',
    'BIG',
    'F',
    'B. Membaca–Memirsa',
    'Mengevaluasi informasi tersurat dan tersirat dari berbagai jenis teks fiksi dan nonfiksi tertulis atau multimodal tentang isu terkini atau topik lintas mata pelajaran.',
    'Evaluasi teks Analytical Exposition dan Hortatory Exposition tulis/multimodal',
    'Mengevaluasi informasi tersurat dan tersirat pada teks eksposisi dan diskusi kompleks.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-04',
    'BIG',
    'F',
    'B. Membaca–Memirsa',
    'Mengevaluasi informasi tersurat dan tersirat dari berbagai jenis teks fiksi dan nonfiksi tertulis atau multimodal tentang isu terkini atau topik lintas mata pelajaran.',
    'Evaluasi teks Discussion dan Narrative kompleks bertema isu terkini/lintas disiplin',
    'Merefleksikan sudut pandang dan argumen penulis dari beragam teks multimodal lintas mata pelajaran.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-05',
    'BIG',
    'F',
    'C. Menulis–Mempresentasikan',
    'Mengomunikasikan gagasan secara tertulis atau multimodal dengan struktur kompleks menggunakan media cetak/digital; menunjukkan strategi koreksi kaidah menulis secara terbimbing maupun mandiri; mempertahankan argumen.',
    'Penulisan teks eksposisi dan diskusi berstruktur kompleks pada media cetak/digital',
    'Menulis teks eksposisi dan diskusi berstruktur kompleks serta menerapkan strategi koreksi kaidah tulisan secara mandiri.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-BIG-F-06',
    'BIG',
    'F',
    'C. Menulis–Mempresentasikan',
    'Mengomunikasikan gagasan secara tertulis atau multimodal dengan struktur kompleks menggunakan media cetak/digital; menunjukkan strategi koreksi kaidah menulis secara terbimbing maupun mandiri; mempertahankan argumen.',
    'Penerapan strategi penyuntingan mandiri (self-correction) & presentasi multimodal',
    'Mempresentasikan gagasan kompleks secara multimodal dan mempertahankan argumen secara meyakinkan.'
  ),

  // =========================================================================
  // 6. INF — Informatika (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-INF-E-01',
    'INF',
    'E',
    'A. Berpikir Komputasional',
    'Memahami struktur data dan algoritma standar; komputasi untuk data berkualitas; menuliskan solusi rancangan program dalam pseudocode; menyimulasikan model Input-Process-Output komputer Von Neumann serta peran sistem operasi.',
    'Struktur data dasar, algoritma standar, komputasi data berkualitas, dan penulisan pseudocode',
    'Menerapkan struktur data dan algoritma standar dalam rancangan pseudocode untuk menghasilkan data berkualitas.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-E-02',
    'INF',
    'E',
    'A. Berpikir Komputasional',
    'Memahami struktur data dan algoritma standar; komputasi untuk data berkualitas; menuliskan solusi rancangan program dalam pseudocode; menyimulasikan model Input-Process-Output komputer Von Neumann serta peran sistem operasi.',
    'Simulasi arsitektur komputer Von Neumann (Input-Process-Output) dan peran sistem operasi',
    'Menyimulasikan mekanisme kerja komputer Von Neumann serta menjelaskan peran dan fungsi sistem operasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-E-03',
    'INF',
    'E',
    'B. Literasi Digital',
    'Menggunakan mesin pencari multivariabel; periksa fakta & membaca lateral (lateral reading); aplikasi perkantoran terintegrasi; keamanan dasar jaringan; produksi konten digital; HAKI; profesi Informatika; digitalisasi budaya; menyaring konten negatif; manajer kata sandi, 2FA & privasi akun.',
    'Mesin pencari multivariabel, periksa fakta, membaca lateral (lateral reading), dan aplikasi perkantoran terintegrasi',
    'Menerapkan pencarian multivariabel, lateral reading untuk verifikasi informasi, serta pemanfaatan aplikasi perkantoran terintegrasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-E-04',
    'INF',
    'E',
    'B. Literasi Digital',
    'Menggunakan mesin pencari multivariabel; periksa fakta & membaca lateral (lateral reading); aplikasi perkantoran terintegrasi; keamanan dasar jaringan; produksi konten digital; HAKI; profesi Informatika; digitalisasi budaya; menyaring konten negatif; manajer kata sandi, 2FA & privasi akun.',
    'Produksi konten digital, HAKI, profesi Informatika, digitalisasi budaya, serta penyaringan konten negatif',
    'Memproduksi konten digital kreatif dengan menghormati HAKI, memahami profesi Informatika, serta menyaring konten negatif.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-E-05',
    'INF',
    'E',
    'B. Literasi Digital',
    'Menggunakan mesin pencari multivariabel; periksa fakta & membaca lateral (lateral reading); aplikasi perkantoran terintegrasi; keamanan dasar jaringan; produksi konten digital; HAKI; profesi Informatika; digitalisasi budaya; menyaring konten negatif; manajer kata sandi, 2FA & privasi akun.',
    'Keamanan dasar jaringan, manajer kata sandi, autentikasi dua faktor (2FA), dan privasi akun',
    'Mengonfigurasi keamanan jaringan dasar, manajer kata sandi, autentikasi dua faktor (2FA), dan privasi akun digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-01',
    'INF',
    'F',
    'A. Berpikir Komputasional',
    'Memahami alur pengembangan produk digital; menganalisis persoalan dengan beberapa strategi algoritmik beserta justifikasi efisiensinya; merancang struktur data kompleks/abstrak; mengenali model jaringan komputer, pengiriman data & troubleshooting jaringan.',
    'Alur pengembangan produk digital, strategi algoritmik beserta justifikasi efisiensinya',
    'Menganalisis persoalan menggunakan berbagai strategi algoritmik beserta justifikasi efisiensinya dalam alur pengembangan produk digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-02',
    'INF',
    'F',
    'A. Berpikir Komputasional',
    'Memahami alur pengembangan produk digital; menganalisis persoalan dengan beberapa strategi algoritmik beserta justifikasi efisiensinya; merancang struktur data kompleks/abstrak; mengenali model jaringan komputer, pengiriman data & troubleshooting jaringan.',
    'Perancangan struktur data kompleks/abstrak',
    'Merancang dan mengimplementasikan struktur data kompleks maupun abstrak untuk pemecahan masalah.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-03',
    'INF',
    'F',
    'A. Berpikir Komputasional',
    'Memahami alur pengembangan produk digital; menganalisis persoalan dengan beberapa strategi algoritmik beserta justifikasi efisiensinya; merancang struktur data kompleks/abstrak; mengenali model jaringan komputer, pengiriman data & troubleshooting jaringan.',
    'Model jaringan komputer, mekanisme pengiriman data, dan troubleshooting jaringan',
    'Menganalisis model jaringan komputer, alur pengiriman data, serta melakukan troubleshooting permasalahan jaringan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-04',
    'INF',
    'F',
    'B. Literasi Digital',
    'Melakukan riset informasi; verifikasi konten teks/gambar/video; merancang sistem komputer sesuai kebutuhan pengguna; keamanan jaringan lanjut; UU/hukum digital Indonesia; teknologi dalam demokrasi; manajer kata sandi/2FA beragam moda; keamanan loka pasar/perbankan digital.',
    'Riset informasi, verifikasi konten multimodal, dan perancangan spesifikasi sistem komputer sesuai kebutuhan pengguna',
    'Melakukan riset dan verifikasi konten digital serta merancang spesifikasi sistem komputer sesuai kebutuhan pengguna.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-05',
    'INF',
    'F',
    'B. Literasi Digital',
    'Melakukan riset informasi; verifikasi konten teks/gambar/video; merancang sistem komputer sesuai kebutuhan pengguna; keamanan jaringan lanjut; UU/hukum digital Indonesia; teknologi dalam demokrasi; manajer kata sandi/2FA beragam moda; keamanan loka pasar/perbankan digital.',
    'Keamanan jaringan tingkat lanjut, hukum siber (UU digital Indonesia), dan peran teknologi dalam demokrasi',
    'Mengevaluasi keamanan jaringan tingkat lanjut, regulasi hukum siber di Indonesia, dan pemanfaatan teknologi dalam demokrasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-06',
    'INF',
    'F',
    'B. Literasi Digital',
    'Melakukan riset informasi; verifikasi konten teks/gambar/video; merancang sistem komputer sesuai kebutuhan pengguna; keamanan jaringan lanjut; UU/hukum digital Indonesia; teknologi dalam demokrasi; manajer kata sandi/2FA beragam moda; keamanan loka pasar/perbankan digital.',
    'Manajer kata sandi/2FA beragam moda serta keamanan transaksi loka pasar dan perbankan digital',
    'Menerapkan otentikasi beragam moda serta prosedur keamanan dalam transaksi loka pasar dan perbankan digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-07',
    'INF',
    'F',
    'C. Analisis Data',
    'Memanfaatkan sumber data yang terbuka, terpercaya, dan legal untuk mengolah data bagi pengambilan keputusan dan prediksi secara efektif, efisien, dan optimal tanpa atau dengan komputer.',
    'Pemanfaatan dan pengolahan sumber data terbuka (open data) yang terpercaya dan legal',
    'Mengumpulkan, memvalidasi, dan mengolah sumber data terbuka yang legal dan terpercaya secara efektif dan efisien.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-08',
    'INF',
    'F',
    'C. Analisis Data',
    'Memanfaatkan sumber data yang terbuka, terpercaya, dan legal untuk mengolah data bagi pengambilan keputusan dan prediksi secara efektif, efisien, dan optimal tanpa atau dengan komputer.',
    'Pemodelan prediksi dan pengambilan keputusan berbasis analisis data',
    'Merancang model prediksi sederhana dan menarik kesimpulan berbasis data untuk mendukung pengambilan keputusan yang optimal.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-09',
    'INF',
    'F',
    'D. Algoritma dan Pemrograman',
    'Memahami strategi algoritmik; mengembangkan program komputer terstruktur dalam notasi algoritma/kode sumber; memelihara dan menyempurnakan kode program; merancang program menggunakan struktur data kompleks dan library.',
    'Strategi algoritmik, pengembangan program terstruktur, serta pemeliharaan dan penyempurnaan kode sumber',
    'Mengembangkan, memelihara, dan menyempurnakan program komputer terstruktur berdasarkan strategi algoritmik yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-INF-F-10',
    'INF',
    'F',
    'D. Algoritma dan Pemrograman',
    'Memahami strategi algoritmik; mengembangkan program komputer terstruktur dalam notasi algoritma/kode sumber; memelihara dan menyempurnakan kode program; merancang program menggunakan struktur data kompleks dan library.',
    'Perancangan program menggunakan struktur data kompleks dan pemanfaatan library',
    'Merancang solusi pemrograman dengan mengintegrasikan struktur data kompleks dan library yang relevan.'
  ),

  // =========================================================================
  // 7. PJOK — Pendidikan Jasmani, Olahraga, dan Kesehatan (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-01',
    'PJOK',
    'E',
    'A. Terampil Bergerak',
    'Menerapkan keterampilan gerak spesifik dan mengembangkan strategi gerak dalam berbagai situasi gerak menantang.',
    'Keterampilan gerak spesifik dalam berbagai cabang olahraga dan aktivitas jasmani',
    'Menerapkan keterampilan gerak spesifik secara efektif dalam berbagai aktivitas jasmani dan olahraga.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-02',
    'PJOK',
    'E',
    'A. Terampil Bergerak',
    'Menerapkan keterampilan gerak spesifik dan mengembangkan strategi gerak dalam berbagai situasi gerak menantang.',
    'Pengembangan strategi gerak dalam situasi permainan atau olahraga yang menantang',
    'Mengembangkan dan menyesuaikan strategi gerak untuk mengatasi situasi permainan atau olahraga yang menantang.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-03',
    'PJOK',
    'E',
    'B. Belajar Melalui Gerak',
    'Merefleksikan transfer strategi gerak, memperagakan fair play dan mengevaluasi pengaruh perilaku etis, serta menerapkan strategi pengambilan keputusan dalam kerja tim (kepemimpinan dan kolaborasi).',
    'Transfer strategi gerak, penerapan fair play, dan evaluasi pengaruh perilaku etis',
    'Merefleksikan transfer strategi gerak serta memperagakan perilaku fair play dan etika olahraga secara konsisten.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-04',
    'PJOK',
    'E',
    'B. Belajar Melalui Gerak',
    'Merefleksikan transfer strategi gerak, memperagakan fair play dan mengevaluasi pengaruh perilaku etis, serta menerapkan strategi pengambilan keputusan dalam kerja tim (kepemimpinan dan kolaborasi).',
    'Kepemimpinan dan kolaborasi dalam pengambilan keputusan kerja tim',
    'Menerapkan keterampilan kepemimpinan dan kolaborasi dalam strategi pengambilan keputusan kerja tim.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-05',
    'PJOK',
    'E',
    'C. Bergaya Hidup Aktif',
    'Berpartisipasi dalam aktivitas kebugaran, menginvestigasi dampak partisipasi teratur, dan merancang strategi peningkatan kebugaran jasmani.',
    'Partisipasi dalam aktivitas kebugaran jasmani dan investigasi dampak latihan teratur',
    'Berpartisipasi aktif dalam aktivitas kebugaran serta menginvestigasi dampak positif latihan fisik yang teratur terhadap tubuh.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-06',
    'PJOK',
    'E',
    'C. Bergaya Hidup Aktif',
    'Berpartisipasi dalam aktivitas kebugaran, menginvestigasi dampak partisipasi teratur, dan merancang strategi peningkatan kebugaran jasmani.',
    'Perancangan strategi dan program peningkatan kebugaran jasmani pribadi',
    'Merancang strategi dan program latihan yang sesuai untuk meningkatkan derajat kebugaran jasmani secara berkelanjutan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-07',
    'PJOK',
    'E',
    'D. Memilih Hidup yang Menyehatkan',
    'Mengevaluasi risiko kesehatan akibat gaya hidup dan pencegahannya, mengevaluasi pola makan sehat berdasarkan analisis gizi sesuai aktivitas jasmani, serta mempraktikkan pertolongan pertama.',
    'Evaluasi risiko kesehatan akibat gaya hidup tidak sehat beserta upaya pencegahannya',
    'Mengevaluasi berbagai risiko kesehatan akibat gaya hidup serta merumuskan langkah pencegahannya.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-08',
    'PJOK',
    'E',
    'D. Memilih Hidup yang Menyehatkan',
    'Mengevaluasi risiko kesehatan akibat gaya hidup dan pencegahannya, mengevaluasi pola makan sehat berdasarkan analisis gizi sesuai aktivitas jasmani, serta mempraktikkan pertolongan pertama.',
    'Analisis pola makan sehat bergizi seimbang sesuai kebutuhan aktivitas jasmani',
    'Menganalisis dan mengevaluasi pola makan sehat bergizi seimbang yang selaras dengan tingkat aktivitas jasmani.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-E-09',
    'PJOK',
    'E',
    'D. Memilih Hidup yang Menyehatkan',
    'Mengevaluasi risiko kesehatan akibat gaya hidup dan pencegahannya, mengevaluasi pola makan sehat berdasarkan analisis gizi sesuai aktivitas jasmani, serta mempraktikkan pertolongan pertama.',
    'Praktik tindakan pertolongan pertama pada kecelakaan (P3K)',
    'Mempraktikkan prosedur pertolongan pertama (P3K) secara tepat dan aman.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-01',
    'PJOK',
    'F',
    'A. Terampil Bergerak',
    'Mengevaluasi keterampilan gerak spesifik dan strategi gerak dalam situasi menantang untuk meningkatkan kinerja gerak.',
    'Evaluasi kinerja keterampilan gerak spesifik pada berbagai aktivitas olahraga',
    'Mengevaluasi efektivitas penerapan keterampilan gerak spesifik untuk meningkatkan kualitas performa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-02',
    'PJOK',
    'F',
    'A. Terampil Bergerak',
    'Mengevaluasi keterampilan gerak spesifik dan strategi gerak dalam situasi menantang untuk meningkatkan kinerja gerak.',
    'Optimalisasi strategi gerak tingkat lanjut dalam situasi kompetitif yang menantang',
    'Mengevaluasi dan mengoptimalkan strategi gerak dalam situasi menantang guna mencapai kinerja gerak terbaik.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-03',
    'PJOK',
    'F',
    'B. Belajar Melalui Gerak',
    'Mengevaluasi strategi gerak dalam situasi baru, mengevaluasi fair play dan merefleksikan pengaruh perilaku etis, serta mengevaluasi pengambilan keputusan dalam kerja tim.',
    'Evaluasi transfer strategi gerak pada situasi baru serta refleksi perilaku etis dan fair play',
    'Mengevaluasi penerapan strategi gerak dalam situasi baru serta merefleksikan dampak perilaku etis dan fair play.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-04',
    'PJOK',
    'F',
    'B. Belajar Melalui Gerak',
    'Mengevaluasi strategi gerak dalam situasi baru, mengevaluasi fair play dan merefleksikan pengaruh perilaku etis, serta mengevaluasi pengambilan keputusan dalam kerja tim.',
    'Evaluasi kepemimpinan dan pengambilan keputusan dalam kerja tim',
    'Mengevaluasi efektivitas kepemimpinan dan proses pengambilan keputusan kolaboratif dalam kerja tim.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-05',
    'PJOK',
    'F',
    'C. Bergaya Hidup Aktif',
    'Berpartisipasi dalam aktivitas kebugaran dan mengevaluasi dampak serta efektivitas strategi peningkatan kebugaran.',
    'Partisipasi dalam aktivitas kebugaran jasmani jangka panjang',
    'Berpartisipasi secara konsisten dalam program aktivitas kebugaran jasmani yang terukur.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-06',
    'PJOK',
    'F',
    'C. Bergaya Hidup Aktif',
    'Berpartisipasi dalam aktivitas kebugaran dan mengevaluasi dampak serta efektivitas strategi peningkatan kebugaran.',
    'Evaluasi dampak dan efektivitas strategi peningkatan kebugaran jasmani',
    'Mengevaluasi dampak fisiologis serta efektivitas strategi peningkatan kebugaran jasmani untuk pemeliharaan kesehatan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-07',
    'PJOK',
    'F',
    'D. Memilih Hidup yang Menyehatkan',
    'Mengadvokasi gaya hidup aktif dan sehat melalui berbagai media, mengadvokasi pola makan sehat bergizi seimbang sesuai aktivitas jasmani, serta mempraktikkan tindakan penyelamatan hidup sesuai prosedur operasional standar (POS).',
    'Advokasi gaya hidup aktif dan pola makan sehat bergizi seimbang melalui berbagai media',
    'Mengadvokasi penerapan gaya hidup aktif serta pola makan bergizi seimbang sesuai kebutuhan aktivitas jasmani melalui berbagai media.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-PJOK-F-08',
    'PJOK',
    'F',
    'D. Memilih Hidup yang Menyehatkan',
    'Mengadvokasi gaya hidup aktif dan sehat melalui berbagai media, mengadvokasi pola makan sehat bergizi seimbang sesuai aktivitas jasmani, serta mempraktikkan tindakan penyelamatan hidup sesuai prosedur operasional standar (POS).',
    'Praktik tindakan penyelamatan hidup sesuai prosedur operasional standar (POS)',
    'Mempraktikkan tindakan penyelamatan hidup secara sigap dan tepat sesuai prosedur operasional standar (POS).'
  ),

  // =========================================================================
  // 8. IPAS — Projek Ilmu Pengetahuan Alam dan Sosial (Fase E: IPA + IPS Terpadu)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-01',
    'IPAS',
    'E',
    'IPA · A. Pemahaman IPA',
    'Menerapkan prinsip klasifikasi dan pelestarian keanekaragaman hayati; mendeskripsikan peranan virus, bakteri, dan jamur; menganalisis interaksi ekosistem; menggunakan sistem pengukuran; menganalisis gerak dua dimensi dan pemanfaatan energi alternatif; menganalisis partikel penyusun materi dan stoikiometri kimia; menerapkan konsep IPA mengatasi perubahan iklim.',
    'Sistem pengukuran, gerak dua dimensi, dan pemanfaatan energi alternatif',
    'Menerapkan prinsip pengukuran, menganalisis gerak dua dimensi, serta merancang solusi pemanfaatan energi alternatif.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-02',
    'IPAS',
    'E',
    'IPA · A. Pemahaman IPA',
    'Menerapkan prinsip klasifikasi dan pelestarian keanekaragaman hayati; mendeskripsikan peranan virus, bakteri, dan jamur; menganalisis interaksi ekosistem; menggunakan sistem pengukuran; menganalisis gerak dua dimensi dan pemanfaatan energi alternatif; menganalisis partikel penyusun materi dan stoikiometri kimia; menerapkan konsep IPA mengatasi perubahan iklim.',
    'Partikel penyusun materi (struktur atom) dan hukum dasar/stoikiometri kimia',
    'Menganalisis struktur partikel penyusun materi dan menerapkan perhitungan stoikiometri kimia dalam reaksi sederhana.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-03',
    'IPAS',
    'E',
    'IPA · A. Pemahaman IPA',
    'Menerapkan prinsip klasifikasi dan pelestarian keanekaragaman hayati; mendeskripsikan peranan virus, bakteri, dan jamur; menganalisis interaksi ekosistem; menggunakan sistem pengukuran; menganalisis gerak dua dimensi dan pemanfaatan energi alternatif; menganalisis partikel penyusun materi dan stoikiometri kimia; menerapkan konsep IPA mengatasi perubahan iklim.',
    'Klasifikasi dan pelestarian keanekaragaman hayati serta peranan virus, bakteri, dan jamur',
    'Menerapkan prinsip klasifikasi makhluk hidup, upaya pelestarian keanekaragaman hayati, serta menganalisis peranan virus, bakteri, dan jamur.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-04',
    'IPAS',
    'E',
    'IPA · A. Pemahaman IPA',
    'Menerapkan prinsip klasifikasi dan pelestarian keanekaragaman hayati; mendeskripsikan peranan virus, bakteri, dan jamur; menganalisis interaksi ekosistem; menggunakan sistem pengukuran; menganalisis gerak dua dimensi dan pemanfaatan energi alternatif; menganalisis partikel penyusun materi dan stoikiometri kimia; menerapkan konsep IPA mengatasi perubahan iklim.',
    'Interaksi komponen ekosistem dan penerapan konsep IPA untuk mitigasi perubahan iklim',
    'Menganalisis dinamika interaksi dalam ekosistem dan mengintegrasikan konsep IPA untuk mengatasi dampak perubahan iklim.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-05',
    'IPAS',
    'E',
    'IPA · B. Keterampilan Proses',
    'Menerapkan siklus keterampilan proses ilmiah: mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan menggunakan alat ukur, memproses/menganalisis data (tabel, grafik, model), mengevaluasi ketidakpastian dan refleksi, serta mengomunikasikan hasil penyelidikan.',
    'Perumusan masalah ilmiah, hipotesis, dan perencanaan penyelidikan menggunakan alat ukur',
    'Merumuskan pertanyaan ilmiah dan hipotesis serta merencanakan penyelidikan menggunakan alat ukur dengan ketelitian yang sesuai.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-06',
    'IPAS',
    'E',
    'IPA · B. Keterampilan Proses',
    'Menerapkan siklus keterampilan proses ilmiah: mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan menggunakan alat ukur, memproses/menganalisis data (tabel, grafik, model), mengevaluasi ketidakpastian dan refleksi, serta mengomunikasikan hasil penyelidikan.',
    'Pengolahan dan analisis data eksperimen (tabel, grafik, model) serta evaluasi ketidakpastian',
    'Mengolah dan menganalisis data eksperimen dalam bentuk tabel, grafik, atau model serta mengevaluasi ketidakpastian pengukuran.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-07',
    'IPAS',
    'E',
    'IPA · B. Keterampilan Proses',
    'Menerapkan siklus keterampilan proses ilmiah: mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan menggunakan alat ukur, memproses/menganalisis data (tabel, grafik, model), mengevaluasi ketidakpastian dan refleksi, serta mengomunikasikan hasil penyelidikan.',
    'Refleksi proses dan komunikasi hasil penyelidikan ilmiah',
    'Merefleksikan tahapan penyelidikan dan mengomunikasikan hasil temuan ilmiah secara sistematis.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-08',
    'IPAS',
    'E',
    'IPS · A. Pemahaman Konsep',
    'Menjelaskan konsep geografi, fenomena geosfer (litosfer, atmosfer, hidrosfer) & teknologi geospasial (peta, penginderaan jauh, SIG); menelaah hakikat ilmu ekonomi, produk keuangan bank/nonbank, risiko & laporan keuangan pribadi; menjelaskan fungsi sosiologi, status/peran, gejala sosial & multikulturalisme; menelaah konsep & penelitian sejarah masa Hindu-Buddha hingga Islam.',
    'Konsep geografi, fenomena geosfer (litosfer, atmosfer, hidrosfer), dan teknologi geospasial (peta, penginderaan jauh, SIG)',
    'Menjelaskan konsep dasar geografi, menganalisis dinamika fenomena geosfer, serta memanfaatkan peta, penginderaan jauh, dan SIG.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-09',
    'IPAS',
    'E',
    'IPS · A. Pemahaman Konsep',
    'Menjelaskan konsep geografi, fenomena geosfer (litosfer, atmosfer, hidrosfer) & teknologi geospasial (peta, penginderaan jauh, SIG); menelaah hakikat ilmu ekonomi, produk keuangan bank/nonbank, risiko & laporan keuangan pribadi; menjelaskan fungsi sosiologi, status/peran, gejala sosial & multikulturalisme; menelaah konsep & penelitian sejarah masa Hindu-Buddha hingga Islam.',
    'Hakikat ilmu ekonomi, kelangkaan, produk keuangan bank/nonbank, risiko, dan laporan keuangan pribadi',
    'Menelaah masalah kelangkaan ekonomi, membandingkan produk keuangan bank/nonbank beserta risikonya, dan menyusun laporan keuangan pribadi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-10',
    'IPAS',
    'E',
    'IPS · A. Pemahaman Konsep',
    'Menjelaskan konsep geografi, fenomena geosfer (litosfer, atmosfer, hidrosfer) & teknologi geospasial (peta, penginderaan jauh, SIG); menelaah hakikat ilmu ekonomi, produk keuangan bank/nonbank, risiko & laporan keuangan pribadi; menjelaskan fungsi sosiologi, status/peran, gejala sosial & multikulturalisme; menelaah konsep & penelitian sejarah masa Hindu-Buddha hingga Islam.',
    'Fungsi sosiologi, status dan peran sosial, gejala sosial, serta masyarakat multikultural',
    'Menjelaskan fungsi sosiologi dalam mengkaji status, peran, gejala sosial, dan harmoni masyarakat multikultural.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-11',
    'IPAS',
    'E',
    'IPS · A. Pemahaman Konsep',
    'Menjelaskan konsep geografi, fenomena geosfer (litosfer, atmosfer, hidrosfer) & teknologi geospasial (peta, penginderaan jauh, SIG); menelaah hakikat ilmu ekonomi, produk keuangan bank/nonbank, risiko & laporan keuangan pribadi; menjelaskan fungsi sosiologi, status/peran, gejala sosial & multikulturalisme; menelaah konsep & penelitian sejarah masa Hindu-Buddha hingga Islam.',
    'Konsep dasar dan penelitian sejarah Indonesia masa Hindu-Buddha hingga Islam',
    'Menelaah konsep ilmu sejarah dan mengkaji perkembangan sejarah Indonesia pada masa Hindu-Buddha hingga Islam.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-12',
    'IPAS',
    'E',
    'IPS · B. Keterampilan Proses',
    'Mengamati fenomena kehidupan manusia dalam dimensi ruang dan waktu; menyusun pertanyaan penelitian secara mandiri; mengumpulkan informasi dari sumber primer/sekunder dan observasi; menarik simpulan; mengomunikasikan hasil dalam media digital/nondigital; merefleksikan serta menyusun rencana tindak lanjut.',
    'Observasi fenomena sosial-spasial dan pengumpulan informasi dari sumber primer/sekunder',
    'Mengamati fenomena kehidupan manusia dalam dimensi ruang dan waktu serta mengumpulkan data dari sumber primer maupun sekunder.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-IPAS-E-13',
    'IPAS',
    'E',
    'IPS · B. Keterampilan Proses',
    'Mengamati fenomena kehidupan manusia dalam dimensi ruang dan waktu; menyusun pertanyaan penelitian secara mandiri; mengumpulkan informasi dari sumber primer/sekunder dan observasi; menarik simpulan; mengomunikasikan hasil dalam media digital/nondigital; merefleksikan serta menyusun rencana tindak lanjut.',
    'Penarikan simpulan, komunikasi hasil dalam media digital/nondigital, dan rencana tindak lanjut',
    'Menarik simpulan penyelidikan, mengomunikasikannya melalui media digital/nondigital, serta menyusun rencana tindak lanjut.'
  ),

  // =========================================================================
  // 9. SI — Sejarah Wajib (Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-SI-F-01',
    'SI',
    'F',
    'A. Pemahaman Konsep',
    'Menjelaskan sejarah pada masa penjajahan bangsa Barat, perlawanan rakyat daerah, pergerakan kebangsaan Indonesia, pendudukan Jepang, Proklamasi Kemerdekaan, mempertahankan kemerdekaan, masa pemerintahan Sukarno, masa pemerintahan Suharto, dan Reformasi, serta mengevaluasi nilai sejarah untuk masa kini.',
    'Masa penjajahan bangsa Barat, perlawanan rakyat daerah, dan pergerakan kebangsaan Indonesia',
    'Menganalisis dampak penjajahan bangsa Barat, strategi perlawanan rakyat daerah, serta lahirnya pergerakan kebangsaan Indonesia.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SI-F-02',
    'SI',
    'F',
    'A. Pemahaman Konsep',
    'Menjelaskan sejarah pada masa penjajahan bangsa Barat, perlawanan rakyat daerah, pergerakan kebangsaan Indonesia, pendudukan Jepang, Proklamasi Kemerdekaan, mempertahankan kemerdekaan, masa pemerintahan Sukarno, masa pemerintahan Suharto, dan Reformasi, serta mengevaluasi nilai sejarah untuk masa kini.',
    'Masa pendudukan Jepang, Proklamasi Kemerdekaan, dan perjuangan mempertahankan kemerdekaan',
    'Menganalisis dinamika masa pendudukan Jepang, peristiwa Proklamasi Kemerdekaan, dan upaya mempertahankan kedaulatan bangsa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SI-F-03',
    'SI',
    'F',
    'A. Pemahaman Konsep',
    'Menjelaskan sejarah pada masa penjajahan bangsa Barat, perlawanan rakyat daerah, pergerakan kebangsaan Indonesia, pendudukan Jepang, Proklamasi Kemerdekaan, mempertahankan kemerdekaan, masa pemerintahan Sukarno, masa pemerintahan Suharto, dan Reformasi, serta mengevaluasi nilai sejarah untuk masa kini.',
    'Dinamika politik, ekonomi, dan sosial pada masa pemerintahan Sukarno, Suharto, dan era Reformasi',
    'Mengevaluasi perkembangan bangsa pada masa pemerintahan Sukarno, Suharto, hingga Reformasi serta merefleksikan nilai sejarahnya untuk masa kini.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SI-F-04',
    'SI',
    'F',
    'B. Keterampilan Proses',
    'Menerapkan keterampilan berpikir diakronis (kronologis) dan sinkronis, literasi sejarah, dan langkah penelitian sejarah (mengamati, menanya 5W1H, heuristik sumber primer/sekunder, kritik sumber/triangulasi, interpretasi, historiografi), serta merencanakan proyek lanjutan kolaboratif.',
    'Keterampilan berpikir diakronis (kronologis), sinkronis, dan literasi sumber sejarah',
    'Menerapkan cara berpikir diakronis dan sinkronis serta literasi sejarah dalam mengkaji peristiwa masa lalu.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SI-F-05',
    'SI',
    'F',
    'B. Keterampilan Proses',
    'Menerapkan keterampilan berpikir diakronis (kronologis) dan sinkronis, literasi sejarah, dan langkah penelitian sejarah (mengamati, menanya 5W1H, heuristik sumber primer/sekunder, kritik sumber/triangulasi, interpretasi, historiografi), serta merencanakan proyek lanjutan kolaboratif.',
    'Langkah penelitian sejarah (heuristik, kritik sumber, interpretasi, historiografi) dan proyek kolaboratif',
    'Melaksanakan tahapan penelitian sejarah (heuristik, kritik sumber, interpretasi, dan historiografi) serta merancang proyek sejarah kolaboratif.'
  ),

  // =========================================================================
  // 10. SB — Seni Budaya (Fase E: Seni Musik & Seni Rupa)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-SB-E-01',
    'SB',
    'E',
    'Seni Musik · A. Mengalami (Experiencing)',
    'Mengidentifikasi dan menjelaskan unsur-unsur musik (nada, irama, melodi, harmoni, timbre, tempo, dinamika) menggunakan alat musik berteknologi setempat, serta menganalisis musik dari berbagai genre, era, dan instrumen.',
    'Identifikasi unsur-unsur musik (nada, irama, melodi, harmoni, timbre, tempo, dinamika) dengan alat musik berteknologi setempat',
    'Mengidentifikasi dan menjelaskan unsur-unsur musik menggunakan alat musik maupun teknologi setempat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-02',
    'SB',
    'E',
    'Seni Musik · A. Mengalami (Experiencing)',
    'Mengidentifikasi dan menjelaskan unsur-unsur musik (nada, irama, melodi, harmoni, timbre, tempo, dinamika) menggunakan alat musik berteknologi setempat, serta menganalisis musik dari berbagai genre, era, dan instrumen.',
    'Analisis karakteristik musik dari berbagai genre, era, dan jenis instrumen',
    'Menganalisis perbedaan karakteristik karya musik lintas genre, era, dan instrumen secara musikal.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-03',
    'SB',
    'E',
    'Seni Musik · B. Merefleksikan (Reflecting)',
    'Menjelaskan hasil analisis kemampuan bermain musik dan karya musik diri sendiri atau orang lain sesuai teknik dan genre menggunakan istilah musik yang tepat.',
    'Analisis dan evaluasi kemampuan bermain musik serta karya musik diri sendiri maupun orang lain',
    'Mengevaluasi kelebihan dan kelemahan permainan musik serta karya musik diri sendiri maupun orang lain sesuai teknik dan genre.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-04',
    'SB',
    'E',
    'Seni Musik · B. Merefleksikan (Reflecting)',
    'Menjelaskan hasil analisis kemampuan bermain musik dan karya musik diri sendiri atau orang lain sesuai teknik dan genre menggunakan istilah musik yang tepat.',
    'Penggunaan istilah dan terminologi kritik musik yang tepat sesuai teknik dan genre',
    'Menjelaskan hasil analisis dan refleksi karya musik secara sistematis menggunakan terminologi musik yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-05',
    'SB',
    'E',
    'Seni Musik · C. Berpikir dan Bekerja Artistik',
    'Menjalani proses praktik musik dengan kesadaran untuk perbaikan keterampilan; menyajikan musik Nusantara dengan penuh ekspresi; menyajikan karya musik modern Indonesia secara individu maupun kelompok.',
    'Proses praktik musik secara sadar dan penyajian repertoar musik Nusantara dengan penuh ekspresi',
    'Menjalani proses latihan musik untuk perbaikan keterampilan serta menyajikan musik Nusantara secara ekspresif.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-06',
    'SB',
    'E',
    'Seni Musik · C. Berpikir dan Bekerja Artistik',
    'Menjalani proses praktik musik dengan kesadaran untuk perbaikan keterampilan; menyajikan musik Nusantara dengan penuh ekspresi; menyajikan karya musik modern Indonesia secara individu maupun kelompok.',
    'Penyajian karya musik modern Indonesia secara individu maupun kelompok',
    'Menyajikan karya musik modern Indonesia secara individu maupun kelompok dengan teknik dan penghayatan yang baik.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-07',
    'SB',
    'E',
    'Seni Musik · D. Menciptakan (Creating)',
    'Menciptakan, menyajikan, dan mendokumentasikan karya musik kreasi sendiri untuk mengekspresikan pengalaman pribadi maupun persoalan di masyarakat.',
    'Penciptaan karya musik kreasi sendiri untuk mengekspresikan pengalaman pribadi atau persoalan masyarakat',
    'Menciptakan karya musik kreasi orisinal yang mengekspresikan pengalaman pribadi maupun kepedulian terhadap persoalan masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-08',
    'SB',
    'E',
    'Seni Musik · D. Menciptakan (Creating)',
    'Menciptakan, menyajikan, dan mendokumentasikan karya musik kreasi sendiri untuk mengekspresikan pengalaman pribadi maupun persoalan di masyarakat.',
    'Penyajian dan pendokumentasian karya musik kreasi',
    'Menyajikan dan mendokumentasikan karya musik kreasi secara rapi dalam media audio atau audiovisual.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-09',
    'SB',
    'E',
    'Seni Musik · E. Berdampak (Impacting)',
    'Menerapkan dampak positif dari kegiatan bermusik dalam perilaku di kehidupan sehari-hari.',
    'Identifikasi nilai-nilai positif dari kegiatan berkesenian musik',
    'Mengidentifikasi nilai-nilai estetis, disiplin, dan empati yang diperoleh dari pengalaman bermusik.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-10',
    'SB',
    'E',
    'Seni Musik · E. Berdampak (Impacting)',
    'Menerapkan dampak positif dari kegiatan bermusik dalam perilaku di kehidupan sehari-hari.',
    'Penerapan dampak positif aktivitas bermusik dalam perilaku kehidupan sehari-hari',
    'Menerapkan kebiasaan dan perilaku positif hasil kegiatan bermusik dalam interaksi kehidupan sehari-hari.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-11',
    'SB',
    'E',
    'Seni Rupa · A. Mengalami (Experiencing)',
    'Mengeksplorasi unsur rupa dan prinsip desain dalam benda-benda di sekitar atau karya seni rupa.',
    'Eksplorasi unsur-unsur rupa (garis, bentuk, warna, tekstur, ruang) pada benda sekitar dan karya seni',
    'Mengidentifikasi dan mengeksplorasi unsur-unsur rupa yang terdapat pada benda di lingkungan sekitar maupun karya seni rupa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-12',
    'SB',
    'E',
    'Seni Rupa · A. Mengalami (Experiencing)',
    'Mengeksplorasi unsur rupa dan prinsip desain dalam benda-benda di sekitar atau karya seni rupa.',
    'Eksplorasi penerapan prinsip desain dalam benda di sekitar maupun karya seni rupa',
    'Menganalisis penerapan prinsip-prinsip desain pada objek di sekitar dan karya seni rupa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-13',
    'SB',
    'E',
    'Seni Rupa · B. Merefleksikan (Reflecting)',
    'Merefleksikan penggunaan unsur rupa, prinsip desain, dan fungsi dalam karya diri sendiri dan teman sekelas menggunakan kosakata seni rupa yang sesuai.',
    'Refleksi penggunaan unsur rupa, prinsip desain, dan fungsi karya diri sendiri maupun teman sekelas',
    'Merefleksikan kesesuaian unsur rupa, prinsip desain, dan fungsi dalam karya sendiri maupun karya teman sekelas.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-14',
    'SB',
    'E',
    'Seni Rupa · B. Merefleksikan (Reflecting)',
    'Merefleksikan penggunaan unsur rupa, prinsip desain, dan fungsi dalam karya diri sendiri dan teman sekelas menggunakan kosakata seni rupa yang sesuai.',
    'Penggunaan kosakata dan terminologi kritik seni rupa yang sesuai',
    'Mengomunikasikan hasil refleksi dan apresiasi karya menggunakan kosakata seni rupa yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-15',
    'SB',
    'E',
    'Seni Rupa · C. Berpikir dan Bekerja Artistik',
    'Mengeksplorasi alternatif/potensi alat dan bahan di lingkungan sekitar dan menghubungkan seni dengan kelompok atau bidang keilmuan lain dalam berkarya.',
    'Eksplorasi alternatif dan potensi alat serta bahan di lingkungan sekitar untuk berkarya',
    'Mengeksplorasi potensi dan alternatif alat serta bahan yang tersedia di lingkungan sekitar sebagai medium berkarya.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-16',
    'SB',
    'E',
    'Seni Rupa · C. Berpikir dan Bekerja Artistik',
    'Mengeksplorasi alternatif/potensi alat dan bahan di lingkungan sekitar dan menghubungkan seni dengan kelompok atau bidang keilmuan lain dalam berkarya.',
    'Integrasi seni rupa dengan kelompok atau bidang keilmuan lain dalam proses berkarya',
    'Menghubungkan konsep seni rupa dengan bidang keilmuan lain untuk menghasilkan karya lintas disiplin.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-17',
    'SB',
    'E',
    'Seni Rupa · D. Menciptakan (Making/Creating)',
    'Membuat karya seni rupa berdasarkan pengalaman dan/atau hasil pengamatan terhadap lingkungan sekitar dengan mempertimbangkan fungsi menggunakan gaya/teknik pilihan.',
    'Perancangan karya seni rupa berdasarkan pengalaman atau hasil pengamatan lingkungan sekitar',
    'Merancang gagasan karya seni rupa berdasarkan pengalaman pribadi maupun pengamatan lingkungan sekitar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-18',
    'SB',
    'E',
    'Seni Rupa · D. Menciptakan (Making/Creating)',
    'Membuat karya seni rupa berdasarkan pengalaman dan/atau hasil pengamatan terhadap lingkungan sekitar dengan mempertimbangkan fungsi menggunakan gaya/teknik pilihan.',
    'Pembuatan karya seni rupa dengan mempertimbangkan fungsi serta gaya/teknik pilihan',
    'Membuat karya seni rupa yang mempertimbangkan aspek fungsi dengan menggunakan gaya dan teknik pilihan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-19',
    'SB',
    'E',
    'Seni Rupa · E. Berdampak (Impacting)',
    'Menghasilkan karya seni rupa untuk mengajak orang lain, merespons pengalaman sehari-hari, dan mengekspresikan perasaan atau minat.',
    'Perancangan karya seni rupa sebagai medium ekspresi perasaan, minat, dan respons pengalaman sehari-hari',
    'Mengekspresikan perasaan, minat, dan respons terhadap pengalaman sehari-hari ke dalam karya seni rupa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-SB-E-20',
    'SB',
    'E',
    'Seni Rupa · E. Berdampak (Impacting)',
    'Menghasilkan karya seni rupa untuk mengajak orang lain, merespons pengalaman sehari-hari, dan mengekspresikan perasaan atau minat.',
    'Pembuatan karya seni rupa persuasif yang mampu mengajak orang lain',
    'Menghasilkan karya seni rupa komunikatif yang mampu mengajak orang lain peduli terhadap pesan yang disampaikan.'
  ),

  // =========================================================================
  // 11. KIK — Kreativitas, Inovasi, dan Kewirausahaan (Fase F: PKWU Pengolahan & Rekayasa)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-01',
    'KIK',
    'F',
    'PKWU Pengolahan · A. Observasi dan Eksplorasi',
    'Menganalisis produk olahan pangan/nonpangan berdasarkan peluang usaha dan keberlanjutan sumber daya alam.',
    'Analisis peluang usaha produk olahan pangan/nonpangan berdasarkan tren pasar',
    'Menganalisis peluang usaha produk olahan pangan maupun nonpangan yang memiliki prospek pasar tinggi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-02',
    'KIK',
    'F',
    'PKWU Pengolahan · A. Observasi dan Eksplorasi',
    'Menganalisis produk olahan pangan/nonpangan berdasarkan peluang usaha dan keberlanjutan sumber daya alam.',
    'Kajian keberlanjutan sumber daya alam dan ketersediaan bahan baku lokal',
    'Mengevaluasi aspek keberlanjutan sumber daya alam dalam pemilihan dan pemanfaatan bahan baku usaha.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-03',
    'KIK',
    'F',
    'PKWU Pengolahan · B. Perencanaan',
    'Merancang pengembangan produk olahan dan strategi bisnis dalam proposal usaha.',
    'Perancangan pengembangan produk olahan dan desain kemasan komersial',
    'Merancang inovasi produk olahan beserta desain label dan kemasan komersial yang memenuhi standar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-04',
    'KIK',
    'F',
    'PKWU Pengolahan · B. Perencanaan',
    'Merancang pengembangan produk olahan dan strategi bisnis dalam proposal usaha.',
    'Penyusunan strategi bisnis, analisis finansial, dan proposal usaha pengolahan',
    'Menyusun strategi pemasaran dan kelayakan finansial dalam dokumen proposal usaha pengolahan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-05',
    'KIK',
    'F',
    'PKWU Pengolahan · C. Produksi',
    'Membuat, mengemas, menyajikan, dan memasarkan produk olahan sesuai proposal usaha.',
    'Produksi dan pengemasan produk olahan berstandar mutu sesuai proposal usaha',
    'Memproduksi dan mengemas produk olahan dengan pelabelan yang informatif dan higienis sesuai proposal.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-06',
    'KIK',
    'F',
    'PKWU Pengolahan · C. Produksi',
    'Membuat, mengemas, menyajikan, dan memasarkan produk olahan sesuai proposal usaha.',
    'Penyajian dan pelaksanaan pemasaran produk olahan kepada konsumen',
    'Menyajikan dan memasarkan produk olahan secara efektif sesuai target pasar yang ditetapkan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-07',
    'KIK',
    'F',
    'PKWU Pengolahan · D. Refleksi dan Evaluasi',
    'Mengevaluasi kualitas produk dan merancang perbaikan berkelanjutan berbasis data.',
    'Evaluasi kualitas produk olahan berdasarkan umpan balik konsumen',
    'Mengevaluasi konsistensi mutu produk olahan berdasarkan hasil pengujian dan masukan pelanggan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-08',
    'KIK',
    'F',
    'PKWU Pengolahan · D. Refleksi dan Evaluasi',
    'Mengevaluasi kualitas produk dan merancang perbaikan berkelanjutan berbasis data.',
    'Perancangan strategi perbaikan dan pengembangan usaha pengolahan berbasis data',
    'Merancang langkah perbaikan berkelanjutan pada proses produksi dan pemasaran berdasarkan analisis data usaha.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-09',
    'KIK',
    'F',
    'PKWU Rekayasa · A. Observasi dan Eksplorasi',
    'Menganalisis peluang usaha produk rekayasa teknologi terapan inovatif.',
    'Analisis kebutuhan pasar dan peluang usaha produk rekayasa teknologi terapan inovatif',
    'Menganalisis peluang usaha produk rekayasa teknologi terapan yang inovatif dan solutif bagi masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-10',
    'KIK',
    'F',
    'PKWU Rekayasa · A. Observasi dan Eksplorasi',
    'Menganalisis peluang usaha produk rekayasa teknologi terapan inovatif.',
    'Kajian kelayakan komersial dan aspek perlindungan HAKI/paten produk rekayasa',
    'Mengevaluasi kelayakan komersial serta aspek perlindungan kekayaan intelektual (HAKI) produk rekayasa.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-11',
    'KIK',
    'F',
    'PKWU Rekayasa · B. Desain / Perencanaan',
    'Menyusun rencana produk rekayasa dalam business plan dan inovasi prototipe.',
    'Inovasi dan penyempurnaan prototipe produk rekayasa teknologi terapan',
    'Mengembangkan inovasi desain dan menyempurnakan prototipe produk rekayasa agar siap diproduksi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-12',
    'KIK',
    'F',
    'PKWU Rekayasa · B. Desain / Perencanaan',
    'Menyusun rencana produk rekayasa dalam business plan dan inovasi prototipe.',
    'Penyusunan rencana bisnis (business plan) dan kalkulasi biaya produksi rekayasa',
    'Menyusun rencana bisnis (business plan) yang mencakup kalkulasi biaya, strategi produksi, dan pemasaran.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-13',
    'KIK',
    'F',
    'PKWU Rekayasa · C. Produksi',
    'Menciptakan produk rekayasa yang layak fungsi, tahan lama, dan bernilai ekonomis serta memasarkannya.',
    'Penciptaan produk rekayasa yang layak fungsi, tahan lama, dan bernilai ekonomis',
    'Menciptakan produk rekayasa teknologi terapan yang layak fungsi, tahan lama, aman, dan bernilai ekonomis.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-14',
    'KIK',
    'F',
    'PKWU Rekayasa · C. Produksi',
    'Menciptakan produk rekayasa yang layak fungsi, tahan lama, dan bernilai ekonomis serta memasarkannya.',
    'Pengemasan dan pelaksanaan pemasaran produk rekayasa teknologi terapan',
    'Mengemas dan memasarkan produk rekayasa secara efektif kepada segmen pengguna yang tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-15',
    'KIK',
    'F',
    'PKWU Rekayasa · D. Refleksi dan Evaluasi',
    'Mengevaluasi dan memperbaiki produk rekayasa serta strategi usaha secara berkelanjutan.',
    'Evaluasi kinerja teknis dan kualitas produk rekayasa berdasarkan uji kelayakan/pengguna',
    'Mengevaluasi performa teknis dan tingkat kepuasan pengguna terhadap produk rekayasa yang dipasarkan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KIK-F-16',
    'KIK',
    'F',
    'PKWU Rekayasa · D. Refleksi dan Evaluasi',
    'Mengevaluasi dan memperbaiki produk rekayasa serta strategi usaha secara berkelanjutan.',
    'Perbaikan produk dan strategi usaha rekayasa secara berkelanjutan',
    'Merumuskan pengembangan versi produk dan perbaikan strategi usaha rekayasa secara berkelanjutan.'
  ),

  // =========================================================================
  // 12. KKA — Koding dan Kecerdasan Artifisial (Fase E & Fase F)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-01',
    'KKA',
    'E',
    'A. Berpikir Komputasional',
    'Menerapkan berpikir komputasional untuk memecahkan masalah kompleks dalam kehidupan sehari-hari.',
    'Empat fondasi berpikir komputasional (dekomposisi, pengenalan pola, abstraksi, dan algoritma)',
    'Menjelaskan dan menerapkan langkah dekomposisi, pengenalan pola, abstraksi, dan penyusunan algoritma.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-02',
    'KKA',
    'E',
    'A. Berpikir Komputasional',
    'Menerapkan berpikir komputasional untuk memecahkan masalah kompleks dalam kehidupan sehari-hari.',
    'Penerapan berpikir komputasional untuk memecahkan masalah kompleks dalam kehidupan sehari-hari',
    'Menerapkan berpikir komputasional untuk merumuskan solusi sistematis atas permasalahan kompleks di kehidupan sehari-hari.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-03',
    'KKA',
    'E',
    'B. Literasi Digital',
    'Menerapkan produksi dan diseminasi konten digital multimedia secara etis dan efektif.',
    'Perancangan dan produksi konten digital multimedia yang kreatif dan berkualitas',
    'Merancang dan memproduksi konten digital multimedia menggunakan perangkat lunak yang sesuai.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-04',
    'KKA',
    'E',
    'B. Literasi Digital',
    'Menerapkan produksi dan diseminasi konten digital multimedia secara etis dan efektif.',
    'Diseminasi konten digital multimedia secara etis, aman, dan efektif',
    'Mendiseminasikan konten digital multimedia melalui platform yang relevan secara etis dan efektif.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-05',
    'KKA',
    'E',
    'C. Algoritma Pemrograman',
    'Membandingkan beberapa algoritma dan menerapkannya untuk menghasilkan aplikasi sederhana.',
    'Analisis dan perbandingan beberapa algoritma pemecahan masalah',
    'Membandingkan alur logika dan kinerja beberapa algoritma dalam menyelesaikan suatu persoalan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-06',
    'KKA',
    'E',
    'C. Algoritma Pemrograman',
    'Membandingkan beberapa algoritma dan menerapkannya untuk menghasilkan aplikasi sederhana.',
    'Implementasi algoritma ke dalam kode program untuk menghasilkan aplikasi sederhana',
    'Menerapkan algoritma terpilih ke dalam bahasa pemrograman untuk membangun aplikasi sederhana yang berfungsi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-07',
    'KKA',
    'E',
    'D. Analisis Data',
    'Memahami konsep dasar basis data dan melakukan pengolahan data pada basis data.',
    'Konsep dasar basis data relasional (entitas, atribut, tabel, dan relasi)',
    'Menjelaskan konsep dasar, struktur tabel, dan komponen utama dalam sistem basis data.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-08',
    'KKA',
    'E',
    'D. Analisis Data',
    'Memahami konsep dasar basis data dan melakukan pengolahan data pada basis data.',
    'Operasi pengolahan dan manipulasi data sederhana pada basis data',
    'Melakukan operasi dasar pengolahan data (input, pembaruan, dan pencarian data) pada basis data.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-09',
    'KKA',
    'E',
    'E. Literasi dan Etika KA',
    'Memahami cara KA mengenali pola citra dan suara, mengenal profesi bidang KA, serta memahami tanggung jawab etika dan hukum manusia sebagai pengguna.',
    'Cara kerja Kecerdasan Artifisial (KA) dalam mengenali pola citra dan suara serta ragam profesi bidang KA',
    'Menjelaskan prinsip kerja KA dalam mengenali pola citra dan suara serta mengidentifikasi peluang profesi di bidang KA.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-10',
    'KKA',
    'E',
    'E. Literasi dan Etika KA',
    'Memahami cara KA mengenali pola citra dan suara, mengenal profesi bidang KA, serta memahami tanggung jawab etika dan hukum manusia sebagai pengguna.',
    'Tanggung jawab etika, bias data, dan aspek hukum manusia sebagai pengguna KA',
    'Mengevaluasi risiko bias data serta menerapkan tanggung jawab etika dan hukum sebagai pengguna teknologi KA.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-11',
    'KKA',
    'E',
    'F. Pemanfaatan dan Pengembangan KA',
    'Menerapkan prompt engineering pada KA generatif, mengevaluasi konten hasil KA, dan memahami AI system design melalui pendekatan design thinking.',
    'Teknik prompt engineering pada KA generatif dan evaluasi kritis terhadap akurasi konten hasil KA',
    'Menerapkan teknik prompt engineering yang efektif pada KA generatif serta mengevaluasi validitas dan akurasi keluaran KA.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-E-12',
    'KKA',
    'E',
    'F. Pemanfaatan dan Pengembangan KA',
    'Menerapkan prompt engineering pada KA generatif, mengevaluasi konten hasil KA, dan memahami AI system design melalui pendekatan design thinking.',
    'Perancangan konsep sistem KA (AI system design) melalui pendekatan design thinking',
    'Merancang purwarupa konsep sistem KA (AI system design) berbasis kebutuhan pengguna menggunakan pendekatan design thinking.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-01',
    'KKA',
    'F',
    'A. Berpikir Komputasional',
    'Menerapkan berpikir komputasional untuk pemecahan masalah kompleks di masyarakat dan pemodelan prediksi.',
    'Pemodelan dan pemecahan masalah kompleks di masyarakat menggunakan berpikir komputasional',
    'Menerapkan berpikir komputasional untuk memodelkan dan merancang solusi atas permasalahan kompleks di masyarakat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-02',
    'KKA',
    'F',
    'A. Berpikir Komputasional',
    'Menerapkan berpikir komputasional untuk pemecahan masalah kompleks di masyarakat dan pemodelan prediksi.',
    'Penerapan penalaran komputasional untuk simulasi dan pemodelan prediksi',
    'Menggunakan pendekatan komputasional untuk membangun model prediksi berbasis data.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-03',
    'KKA',
    'F',
    'B. Literasi Digital',
    'Menerapkan produksi dan diseminasi konten digital tingkat lanjut sebagai pendukung aplikasi dan sistem KA.',
    'Produksi konten digital dan antarmuka pengguna tingkat lanjut sebagai pendukung sistem KA',
    'Memproduksi konten digital dan aset antarmuka tingkat lanjut untuk mendukung fungsionalitas aplikasi berbasis KA.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-04',
    'KKA',
    'F',
    'B. Literasi Digital',
    'Menerapkan produksi dan diseminasi konten digital tingkat lanjut sebagai pendukung aplikasi dan sistem KA.',
    'Diseminasi konten serta dokumentasi teknis pendukung aplikasi dan sistem KA',
    'Mendiseminasikan konten serta menyusun dokumentasi teknis aplikasi dan sistem KA secara profesional.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-05',
    'KKA',
    'F',
    'C. Algoritma Pemrograman',
    'Memahami algoritma, Pemrograman Berorientasi Objek (OOP), engineering process, dan mengembangkan aplikasi IoT atau aplikasi kompleks.',
    'Konsep Pemrograman Berorientasi Objek (OOP) dan tahapan software engineering process',
    'Menerapkan algoritma, paradigma Pemrograman Berorientasi Objek (OOP), dan siklus rekayasa perangkat lunak (engineering process).'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-06',
    'KKA',
    'F',
    'C. Algoritma Pemrograman',
    'Memahami algoritma, Pemrograman Berorientasi Objek (OOP), engineering process, dan mengembangkan aplikasi IoT atau aplikasi kompleks.',
    'Pengembangan aplikasi kompleks atau perangkat Internet of Things (IoT)',
    'Mengembangkan aplikasi kompleks atau sistem berbasis Internet of Things (IoT) yang terintegrasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-07',
    'KKA',
    'F',
    'D. Analisis Data',
    'Memahami data encoding, penerapan basis data dalam aplikasi, serta konsep mahadata (big data).',
    'Teknik data encoding dan integrasi basis data dalam pengembangan aplikasi',
    'Menerapkan teknik data encoding serta mengintegrasikan basis data ke dalam arsitektur aplikasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-08',
    'KKA',
    'F',
    'D. Analisis Data',
    'Memahami data encoding, penerapan basis data dalam aplikasi, serta konsep mahadata (big data).',
    'Konsep, arsitektur, dan pemanfaatan mahadata (big data)',
    'Menjelaskan konsep dan prinsip pengelolaan mahadata (big data) untuk mendukung analisis skala besar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-09',
    'KKA',
    'F',
    'E. Literasi dan Etika KA',
    'Memahami dampak KA terhadap ketenagakerjaan dan menerapkan prinsip human-centered AI.',
    'Analisis dampak perkembangan KA terhadap struktur ketenagakerjaan dan sosio-ekonomi',
    'Mengevaluasi dampak transformasi KA terhadap dunia kerja, profesi masa depan, dan dinamika ketenagakerjaan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-10',
    'KKA',
    'F',
    'E. Literasi dan Etika KA',
    'Memahami dampak KA terhadap ketenagakerjaan dan menerapkan prinsip human-centered AI.',
    'Penerapan prinsip human-centered AI (keadilan, transparansi, akuntabilitas, dan keamanan)',
    'Merumuskan penerapan prinsip human-centered AI dalam perancangan dan pemanfaatan sistem cerdas.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-11',
    'KKA',
    'F',
    'F. Pemanfaatan dan Pengembangan KA',
    'Memahami dasar algoritma Machine Learning (ML) dan Natural Language Processing (NLP), mengembangkan model KA sederhana, serta mengintegrasikannya untuk memecahkan masalah sehari-hari.',
    'Konsep dasar algoritma Machine Learning (ML) dan Natural Language Processing (NLP) serta pelatihan model',
    'Menjelaskan cara kerja dasar algoritma Machine Learning (ML) dan Natural Language Processing (NLP) dalam melatih model.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-KKA-F-12',
    'KKA',
    'F',
    'F. Pemanfaatan dan Pengembangan KA',
    'Memahami dasar algoritma Machine Learning (ML) dan Natural Language Processing (NLP), mengembangkan model KA sederhana, serta mengintegrasikannya untuk memecahkan masalah sehari-hari.',
    'Pengembangan model KA sederhana dan integrasinya ke dalam aplikasi pemecah masalah sehari-hari',
    'Mengembangkan model KA sederhana dan mengintegrasikannya ke dalam aplikasi untuk memecahkan masalah sehari-hari.'
  ),

  // =========================================================================
  // 13. MPP — Mata Pelajaran Pilihan (Fase F: Ekonomi, Bahasa Jepang, Bahasa Arab)
  // =========================================================================
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-01',
    'MPP',
    'F',
    'Ekonomi · A. Pemahaman Konsep',
    'Menjelaskan konsep dasar ekonomi; mengidentifikasi permasalahan ekonomi dan keuangan digital; memahami pendapatan nasional, pertumbuhan ekonomi, kemiskinan & kesenjangan; ketenagakerjaan; uang, inflasi & kebijakan moneter; akuntansi keuangan dasar; kebijakan fiskal, APBN/APBD, perpajakan & ekonomi internasional.',
    'Konsep dasar ekonomi, identifikasi permasalahan ekonomi, dan literasi keuangan digital',
    'Menjelaskan konsep dasar dan permasalahan ekonomi serta mengevaluasi pemanfaatan layanan keuangan digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-02',
    'MPP',
    'F',
    'Ekonomi · A. Pemahaman Konsep',
    'Menjelaskan konsep dasar ekonomi; mengidentifikasi permasalahan ekonomi dan keuangan digital; memahami pendapatan nasional, pertumbuhan ekonomi, kemiskinan & kesenjangan; ketenagakerjaan; uang, inflasi & kebijakan moneter; akuntansi keuangan dasar; kebijakan fiskal, APBN/APBD, perpajakan & ekonomi internasional.',
    'Pendapatan nasional, pertumbuhan ekonomi, kemiskinan, kesenjangan, dan ketenagakerjaan',
    'Menganalisis penghitungan pendapatan nasional, pertumbuhan ekonomi, masalah ketimpangan, serta dinamika ketenagakerjaan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-03',
    'MPP',
    'F',
    'Ekonomi · A. Pemahaman Konsep',
    'Menjelaskan konsep dasar ekonomi; mengidentifikasi permasalahan ekonomi dan keuangan digital; memahami pendapatan nasional, pertumbuhan ekonomi, kemiskinan & kesenjangan; ketenagakerjaan; uang, inflasi & kebijakan moneter; akuntansi keuangan dasar; kebijakan fiskal, APBN/APBD, perpajakan & ekonomi internasional.',
    'Uang, inflasi, kebijakan moneter, kebijakan fiskal (APBN/APBD, perpajakan), dan ekonomi internasional',
    'Menganalisis mekanisme uang, inflasi, kebijakan moneter, kebijakan fiskal (APBN/APBD dan pajak), serta kerja sama ekonomi internasional.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-04',
    'MPP',
    'F',
    'Ekonomi · A. Pemahaman Konsep',
    'Menjelaskan konsep dasar ekonomi; mengidentifikasi permasalahan ekonomi dan keuangan digital; memahami pendapatan nasional, pertumbuhan ekonomi, kemiskinan & kesenjangan; ketenagakerjaan; uang, inflasi & kebijakan moneter; akuntansi keuangan dasar; kebijakan fiskal, APBN/APBD, perpajakan & ekonomi internasional.',
    'Persamaan dasar akuntansi dan siklus akuntansi keuangan dasar',
    'Menerapkan konsep akuntansi keuangan dasar dalam menyusun laporan keuangan sederhana.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-05',
    'MPP',
    'F',
    'Ekonomi · B. Keterampilan Proses',
    'Mengamati dan memprediksi faktor penyebab masalah ekonomi di lingkungan sekitar/regional/nasional; mengumpulkan dan memvalidasi data ekonomi; menarik kesimpulan dan merumuskan solusi; mengomunikasikan serta merefleksikan solusi dalam proyek kolaboratif pengurangan masalah ekonomi.',
    'Pengamatan masalah ekonomi dan pengumpulan serta validasi data ekonomi empiris',
    'Mengamati faktor penyebab masalah ekonomi di lingkungan sekitar/nasional serta mengumpulkan dan memvalidasi data ekonomi yang relevan.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-EKO-06',
    'MPP',
    'F',
    'Ekonomi · B. Keterampilan Proses',
    'Mengamati dan memprediksi faktor penyebab masalah ekonomi di lingkungan sekitar/regional/nasional; mengumpulkan dan memvalidasi data ekonomi; menarik kesimpulan dan merumuskan solusi; mengomunikasikan serta merefleksikan solusi dalam proyek kolaboratif pengurangan masalah ekonomi.',
    'Perumusan dan komunikasi solusi dalam proyek kolaboratif pengurangan masalah ekonomi',
    'Merumuskan dan mengomunikasikan solusi berbasis data melalui proyek kolaboratif untuk mengurangi permasalahan ekonomi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-01',
    'MPP',
    'F',
    'Bahasa Jepang · A. Menyimak (Kiku)',
    'Menyimpulkan teks tentang gagasan dan informasi lisan atau multimodal dalam bahasa Jepang sederhana.',
    'Kosakata dan ungkapan lisan sederhana tema kehidupan sehari-hari dalam bahasa Jepang',
    'Mengidentifikasi kosakata dan informasi rinci dari ujaran lisan sederhana berbahasa Jepang bertema kehidupan sehari-hari.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-02',
    'MPP',
    'F',
    'Bahasa Jepang · A. Menyimak (Kiku)',
    'Menyimpulkan teks tentang gagasan dan informasi lisan atau multimodal dalam bahasa Jepang sederhana.',
    'Penyimpulan gagasan dan informasi dari teks lisan atau multimodal bertema budaya Jepang',
    'Menyimpulkan gagasan utama dari teks lisan atau multimodal sederhana yang memuat konteks budaya Jepang.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-03',
    'MPP',
    'F',
    'Bahasa Jepang · B. Berbicara (Hanasu)',
    'Mengomunikasikan gagasan dan informasi secara lisan dalam bahasa Jepang sederhana sesuai konteks budaya.',
    'Pola kalimat dan ungkapan percakapan sehari-hari dalam bahasa Jepang sederhana',
    'Mengomunikasikan gagasan dan informasi secara lisan menggunakan pola kalimat sederhana bahasa Jepang.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-04',
    'MPP',
    'F',
    'Bahasa Jepang · B. Berbicara (Hanasu)',
    'Mengomunikasikan gagasan dan informasi secara lisan dalam bahasa Jepang sederhana sesuai konteks budaya.',
    'Penerapan etika komunikasi lisan sesuai konteks sosial-budaya Jepang',
    'Menerapkan sopan santun dan etika komunikasi lintas budaya dalam percakapan berbahasa Jepang.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-05',
    'MPP',
    'F',
    'Bahasa Jepang · C. Membaca (Yomu)',
    'Menyimpulkan teks tulis tentang gagasan/informasi kemudian menghubungkannya dengan teks lain.',
    'Pembacaan aksara Hiragana, Katakana, dan Kanji dasar dalam teks tulis sederhana',
    'Membaca dan memahami makna kata maupun kalimat beraksara Hiragana, Katakana, dan Kanji dasar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-06',
    'MPP',
    'F',
    'Bahasa Jepang · C. Membaca (Yomu)',
    'Menyimpulkan teks tulis tentang gagasan/informasi kemudian menghubungkannya dengan teks lain.',
    'Penyimpulan informasi teks bacaan dan penghubungannya dengan teks lain',
    'Menyimpulkan gagasan dari teks tulis berbahasa Jepang serta menghubungkan informasinya dengan teks lain.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-07',
    'MPP',
    'F',
    'Bahasa Jepang · D. Menulis (Kaku)',
    'Menyusun teks tulis atau multimodal sederhana dalam bahasa Jepang.',
    'Kaidah penulisan aksara Hiragana, Katakana, dan Kanji dasar',
    'Menuliskan kosakata dan kalimat sederhana menggunakan aksara Hiragana, Katakana, dan Kanji dasar secara tepat.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-JPN-08',
    'MPP',
    'F',
    'Bahasa Jepang · D. Menulis (Kaku)',
    'Menyusun teks tulis atau multimodal sederhana dalam bahasa Jepang.',
    'Penyusunan teks tulis atau multimodal sederhana dalam bahasa Jepang',
    'Menyusun teks tulis maupun multimodal pendek berbahasa Jepang sesuai konteks komunikasi.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-01',
    'MPP',
    'F',
    "Bahasa Arab · A. Menyimak (al-Istima')",
    "Menganalisis informasi dalam teks lisan sederhana berbahasa Arab tentang kehidupan sehari-hari (al-hayat al-yaumiyyah) dan lingkungan sekitar (al-bi'ah).",
    'Kosakata dan ungkapan teks lisan sederhana tema kehidupan sehari-hari (al-hayat al-yaumiyyah)',
    'Mengidentifikasi kosakata dan menganalisis informasi tersurat dari teks lisan sederhana berbahasa Arab bertema kehidupan sehari-hari.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-02',
    'MPP',
    'F',
    "Bahasa Arab · A. Menyimak (al-Istima')",
    "Menganalisis informasi dalam teks lisan sederhana berbahasa Arab tentang kehidupan sehari-hari (al-hayat al-yaumiyyah) dan lingkungan sekitar (al-bi'ah).",
    "Pemahaman informasi teks lisan sederhana tema lingkungan sekitar (al-bi'ah)",
    'Menganalisis informasi rinci dan tersirat dari teks lisan sederhana berbahasa Arab bertema lingkungan sekitar.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-03',
    'MPP',
    'F',
    'Bahasa Arab · B. Berbicara (al-Kalam)',
    'Mengomunikasikan informasi lisan secara santun sesuai pemahaman lintas budaya (tafahum tsaqafi).',
    'Ungkapan komunikatif lisan dan dialog santun dalam interaksi sehari-hari',
    'Mengomunikasikan gagasan dan informasi lisan secara santun dalam dialog sederhana berbahasa Arab.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-04',
    'MPP',
    'F',
    'Bahasa Arab · B. Berbicara (al-Kalam)',
    'Mengomunikasikan informasi lisan secara santun sesuai pemahaman lintas budaya (tafahum tsaqafi).',
    'Penerapan pemahaman lintas budaya (tafahum tsaqafi) dalam komunikasi lisan berbahasa Arab',
    'Menerapkan pemahaman lintas budaya (tafahum tsaqafi) saat berinteraksi lisan dalam bahasa Arab.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-05',
    'MPP',
    'F',
    "Bahasa Arab · C. Membaca (al-Qira'ah)",
    'Menganalisis informasi dalam teks tulis digital maupun nondigital berbahasa Arab.',
    'Pemahaman informasi umum dan rinci dalam teks bacaan sederhana (digital maupun nondigital)',
    'Menganalisis gagasan utama dan informasi rinci dari teks tulis berbahasa Arab baik cetak maupun digital.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-06',
    'MPP',
    'F',
    "Bahasa Arab · C. Membaca (al-Qira'ah)",
    'Menganalisis informasi dalam teks tulis digital maupun nondigital berbahasa Arab.',
    "Analisis kosakata dan struktur kalimat dasar (qawa'id) dalam teks tulis berbahasa Arab",
    "Mengidentifikasi makna kosakata dan pola struktur kalimat dasar (qawa'id) untuk memahami teks bacaan berbahasa Arab."
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-07',
    'MPP',
    'F',
    'Bahasa Arab · D. Menulis (al-Kitabah)',
    'Mengomunikasikan informasi dalam teks tulis sederhana berbahasa Arab.',
    'Penulisan kalimat dan paragraf sederhana bertema kehidupan sehari-hari (al-hayat al-yaumiyyah)',
    'Menyusun kalimat dan paragraf sederhana berbahasa Arab mengenai aktivitas kehidupan sehari-hari.'
  ),
  createBskapEntry(
    'CPTP-BSKAP-MPP-ARB-08',
    'MPP',
    'F',
    'Bahasa Arab · D. Menulis (al-Kitabah)',
    'Mengomunikasikan informasi dalam teks tulis sederhana berbahasa Arab.',
    "Penyusunan teks deskriptif pendek bertema lingkungan sekitar (al-bi'ah) dalam bahasa Arab",
    'Mengomunikasikan informasi tertulis secara runtut tentang lingkungan sekitar dalam bahasa Arab sederhana.'
  ),
];
