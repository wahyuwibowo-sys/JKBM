import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  QrCode,
  Globe,
  Shield,
  Smartphone,
  AlertTriangle,
  Rocket,
  Server,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
  Download,
  FileCode2,
} from 'lucide-react';
import { OfficialQRCode } from './OfficialQRCode';
import { getGoogleAppsScriptCode } from '../../services/gasCodeGenerator';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  schoolName?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  appName = 'E-Jurnal Pembelajaran Mendalam',
  schoolName = 'SMKN 1 Sidayu Gresik',
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'deploy'>('share');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  // Use current window location
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-2fhi7atci6k6zhtqo5ygod-51317451676.asia-east1.run.app';

  const shareMessage = `*E-JURNAL PEMBELAJARAN MENDALAM*
*${schoolName}*

Yth. Bapak/Ibu Guru dan Tenaga Pendidik,
Silakan akses aplikasi E-Jurnal untuk pengisian jurnal kegiatan belajar mengajar (KBM) harian melalui tautan berikut:

🌐 *Link Aplikasi:*
${currentUrl}

🔑 *Panduan Login Awal:*
• *Username:* Username masing-masing atau Nomor NIP (tersedia daftar di menu pencarian login)
• *Kata Sandi Default:* \`guru123\`
• *Admin:* \`admin.kurikulum\` (Sandi: \`admin123\`)
• *Kepala Sekolah:* \`kepsek.sidayu\` (Sandi: \`kepsek123\`)

📱 Dapat diakses lancar melalui HP/Smartphone maupun Laptop.
_Bapak/Ibu dapat mengubah kata sandi setelah berhasil masuk pada menu profil pojok kanan atas._`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownloadCode = () => {
    const codeContent = getGoogleAppsScriptCode();
    const blob = new Blob([codeContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const a = document.createElement('a');
    a.href = '/Index.html';
    a.download = 'Index.html';
    a.click();
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
              <Share2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Pusat Distribusi & Publikasi
              </span>
              <h3 className="text-xl font-bold leading-tight">
                {appName}
              </h3>
            </div>
          </div>
          <p className="text-xs text-blue-100/90 mt-1">
            Bagikan tautan resmi kepada rekan guru {schoolName} atau publikasikan web agar online 24 jam.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'share'
                  ? 'bg-white text-blue-800 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Bagikan ke Guru
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'deploy'
                  ? 'bg-amber-400 text-slate-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Rocket className="w-4 h-4 text-amber-300" />
              Solusi Link Error & Panduan Deploy
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'share' ? (
            <>
              {/* Alert notice about AI Studio preview link permission */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    Penting: Mengapa Rekan Guru Tidak Bisa Membuka Link?
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Tautan internal Cloud Run (<code>ais-pre-...run.app</code>) secara default memerlukan izin login akun Google pemilik project. Jika rekan guru mengalami <strong>Error 403 Forbidden / Akses Ditolak</strong>, buka tab <strong className="text-blue-700 underline cursor-pointer" onClick={() => setActiveTab('deploy')}>"Solusi Link Error & Panduan Deploy"</strong> untuk langkah publikasi gratis di Vercel atau Netlify.
                  </p>
                </div>
              </div>

              {/* Main URL box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Tautan Web Aplikasi Saat Ini
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Aktif
                  </span>
                </label>
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border-2 border-blue-200 focus-within:border-blue-500 transition-all">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full bg-transparent px-2.5 py-1 text-sm font-mono font-medium text-slate-800 outline-none select-all"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Share to WhatsApp */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Send className="w-5 h-5 ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Kirim Pesan WhatsApp ke Grup Guru
                    </h4>
                    <p className="text-xs text-emerald-800/80 mt-0.5">
                      Format pesan sudah rapi lengkap dengan panduan username & kata sandi default.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs shrink-0 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Buka WhatsApp
                </button>
              </div>

              {/* Preview Format Teks Pengumuman */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    Format Pesan Informasi untuk Guru
                  </label>
                  <button
                    onClick={handleCopyText}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Teks Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Pesan Lengkap</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-40 overflow-y-auto">
                  {shareMessage}
                </pre>
              </div>

              {/* QR Code and Mobile Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="shrink-0 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
                  <OfficialQRCode
                    customText={currentUrl}
                    guruNama="Dewan Guru SMKN 1 Sidayu"
                    kepsekNama="Kepala Sekolah"
                    size={110}
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                    <QrCode className="w-3 h-3" /> Scan Langsung via Smartphone
                  </span>
                  <h5 className="text-xs font-bold text-slate-800">
                    Cocok Ditampilkan saat Rapat / Briefing Guru
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Bapak/Ibu Guru cukup arahkan kamera smartphone ke QR Code ini untuk membuka halaman E-Jurnal secara otomatis tanpa mengetik manual.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Tab Deploy & Solusi Error */
            <div className="space-y-6">
              {/* Card 1: Penjelasan Error */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  Mengapa Muncul Error 403 / Link Tidak Bisa Dibuka?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Link <code>ais-dev-...</code> dan <code>ais-pre-...</code> adalah <em>development container</em> internal Google AI Studio. Server ini hanya dapat dibuka oleh akun Google pembuat dan akan tidur (sleep) saat tab editor AI Studio tidak aktif.
                </p>
              </div>

              {/* Pilihan 1: Deploy Gratis ke Vercel (Rekomendasi Utama) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-2 border-blue-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] tracking-wide uppercase">
                    Paling Direkomendasikan
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Gratis 100% Selamanya
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  Opsi 1: Deploy ke Vercel (Aktif 24 Jam Nonstop)
                </h4>
                <p className="text-xs text-slate-600">
                  Aplikasi ini sudah dilengkapi berkas <code>vercel.json</code> siap pakai. Hasilnya berupa link publik cepat seperti <code>https://ejurnal-smkn1sidayu.vercel.app</code> yang bisa dibuka kapan saja di HP/laptop seluruh guru tanpa perlu akun Google Cloud.
                </p>

                <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-800">Langkah Cepat (2 Menit):</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>
                      <strong>Unduh Project:</strong> Di pojok atas AI Studio, klik menu titik tiga atau <strong>Export / Download as ZIP</strong> ke komputer Anda (atau push ke GitHub).
                    </li>
                    <li>
                      <strong>Buka Vercel:</strong> Buka situs{' '}
                      <a
                        href="https://vercel.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5"
                      >
                        vercel.com <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      dan masuk dengan akun Google atau GitHub.
                    </li>
                    <li>
                      <strong>Import Project:</strong> Klik <em>Add New &gt; Project</em> &gt; Hubungkan repositori GitHub Anda.
                    </li>
                    <li>
                      <strong>Deploy:</strong> Pastikan Framework Preset adalah <strong>Vite</strong> dan Output Directory adalah <strong>dist</strong>. Klik tombol <strong>Deploy</strong>.
                    </li>
                    <li>
                      <strong>Selesai:</strong> Dalam 1 menit tautan publik resmi sekolah sudah siap dibagikan ke semua guru!
                    </li>
                  </ol>
                </div>

                {/* Box Solusi Error Vercel */}
                <div className="bg-amber-50/90 p-3.5 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Jika Muncul Error Saat Deploy di Vercel:
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-amber-900 leading-relaxed list-disc list-inside">
                    <li>
                      <strong>Error Output Directory:</strong> Di pengaturan Vercel (<em>Project Settings &gt; General &gt; Build &amp; Development Settings</em>), pastikan <strong>Output Directory</strong> diisi <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-amber-900">dist</code>.
                    </li>
                    <li>
                      <strong>Error Dependency (ERESOLVE / npm error):</strong> Kami sudah menambahkan berkas konfigurasi <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">vercel.json</code> dan <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">.npmrc</code> dengan perintah <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">npm install --legacy-peer-deps</code>.
                    </li>
                    <li>
                      <strong>Error "Failed to resolve /src/main.tsx":</strong> Masalah ini terjadi jika berkas HTML menggunakan path absolut atau nama folder di GitHub berupa huruf besar (<code className="bg-amber-100 px-1 py-0.2 rounded font-mono">Src/</code> bukan <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">src/</code>). Berkas <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">index.html</code> sudah kami perbarui ke <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">./src/main.tsx</code> dan <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">vite.config.ts</code> ke <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">base: './'</code>.
                    </li>
                    <li>
                      <strong>Error Node.js:</strong> Di Vercel <em>Project Settings &gt; Node.js Version</em>, pilih versi <strong>20.x</strong> atau <strong>22.x</strong>.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pilihan 2: Netlify Drop (Tanpa GitHub - Cukup Drag & Drop Folder) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Opsi 2: Netlify Drop (Drag &amp; Drop Folder dist Tanpa Coding)
                </h4>
                <p className="text-xs text-slate-600">
                  Jika Anda tidak menggunakan GitHub, cukup jalankan perintah build dan seret folder <code>dist</code>:
                </p>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                    <li>Ketik perintah di terminal: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-blue-700">npm run build</code></li>
                    <li>Buka <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-700 underline font-semibold">app.netlify.com/drop</a></li>
                    <li>Tarik dan lepas (drag &amp; drop) folder <code>dist</code> ke browser. Website langsung online seketika!</li>
                  </ol>
                </div>
              </div>

              {/* Pilihan: Google Apps Script Web App (Resmi Akun Belajar.id) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-2 border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-bold text-[10px] tracking-wide uppercase">
                    100% Ekosistem Google Belajar.id
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Langsung di Google Drive Sekolah
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-700" />
                  Opsi: Deploy via Google Apps Script (Web App Resmi)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Bisa banget!</strong> Anda dapat menerbitkan aplikasi ini langsung melalui Google Apps Script yang terhubung ke Google Spreadsheet SMKN 1 Sidayu dengan tautan resmi <code>script.google.com</code>:
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unduh Berkas 1: Code.gs</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas 2: Index.html (100% Bundled)</span>
                  </button>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900">Langkah Penerapan di Google Spreadsheet:</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <li>
                      Buka Google Spreadsheet data sekolah Anda, lalu pilih menu <strong>Ekstensi &gt; Apps Script</strong>.
                    </li>
                    <li>
                      <strong>Berkas 1 (Code.gs):</strong> Tempel kode backend dari menu <em>Admin &gt; Integrasi Apps Script</em> ke dalam <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono">Code.gs</code>.
                    </li>
                    <li>
                      <strong>Berkas 2 (Index.html):</strong> Di panel kiri Apps Script, klik tombol <strong>+ (Tambah Berkas)</strong> &gt; pilih <strong>HTML</strong> &gt; beri nama <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono">Index</code> &gt; tempel kode tampilan dari tab <em>Index.html</em>.
                    </li>
                    <li>
                      Jalankan fungsi <code>setupDatabase()</code> 1x untuk otomatis membentuk 9 sheet spreadsheet (User, Guru, Role, Mapel, Kelas, Jurnal, dll).
                    </li>
                    <li>
                      Klik tombol biru <strong>Deploy (Terapkan) &gt; New Deployment (Penerapan Baru)</strong> di kanan atas.
                    </li>
                    <li>
                      Pilih jenis: <strong>Web App (Aplikasi Web)</strong>.
                    </li>
                    <li>
                      <span className="text-emerald-800 font-semibold">Kunci agar tidak Error 403:</span> Atur <em>Execute as</em>: <strong>Saya (Akun Anda)</strong> dan <em>Who has access</em>: <strong>Anyone (Siapa saja)</strong> atau akun domain belajar.id.
                    </li>
                    <li>
                      Klik <strong>Deploy</strong>. Salin link Web App yang dihasilkan (<code>https://script.google.com/macros/s/.../exec</code>) dan bagikan ke rekan guru!
                    </li>
                  </ol>
                </div>
              </div>

              {/* Pilihan 3: Tombol Share di Google AI Studio */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h4 className="text-xs font-bold text-purple-950 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  Opsi Lain: Fitur Share / Publish di Google AI Studio
                </h4>
                <p className="text-xs text-purple-900/80 leading-relaxed">
                  Di bilah atas Google AI Studio Build, periksa tombol <strong>Share</strong> atau <strong>Deploy</strong>. Anda dapat mengatur akses agar dapat dilihat oleh akun organisasi Google Workspace (misal domain <code>@guru.sma.belajar.id</code>) atau publik jika diizinkan oleh kebijakan admin akun Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Aman &amp; Terintegrasi Google Spreadsheet</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
