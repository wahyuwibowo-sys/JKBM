import React, { useState } from 'react';
import { getGoogleAppsScriptCode } from '../../services/gasCodeGenerator';
import { AppConfig } from '../../types';
import { Copy, Check, Download, Code2, BookOpen, Globe, FileCode2, Sparkles, AlertCircle } from 'lucide-react';

interface AdminAppsScriptCodeProps {
  config: AppConfig;
}

export const AdminAppsScriptCode: React.FC<AdminAppsScriptCodeProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loadingHtml, setLoadingHtml] = useState<boolean>(false);

  const codeContent = getGoogleAppsScriptCode(config.spreadsheet_id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([codeContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadHtmlContent = async () => {
    if (htmlContent) return;
    setLoadingHtml(true);
    try {
      const res = await fetch('/Index.html');
      if (res.ok) {
        const text = await res.text();
        setHtmlContent(text);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHtml(false);
    }
  };

  const handleTabChange = (tab: 'codegs' | 'indexhtml') => {
    setActiveTab(tab);
    if (tab === 'indexhtml' && !htmlContent) {
      loadHtmlContent();
    }
  };

  const handleCopyHtml = async () => {
    if (!htmlContent) {
      setLoadingHtml(true);
      try {
        const res = await fetch('/Index.html');
        const text = await res.text();
        setHtmlContent(text);
        navigator.clipboard.writeText(text);
        setCopiedHtml(true);
      } catch {
        // ignore
      } finally {
        setLoadingHtml(false);
        setTimeout(() => setCopiedHtml(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(htmlContent);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleDownloadHtml = () => {
    const a = document.createElement('a');
    a.href = '/Index.html';
    a.download = 'Index.html';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-200">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Google Apps Script Deploy Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pindahkan Seluruh Aplikasi ke Google Apps Script
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jalankan E-Jurnal 100% di ekosistem Google Workspace tanpa perlu Vercel, Netlify, atau GitHub.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'codegs' ? (
            <>
              <button
                onClick={handleDownloadCode}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Unduh Code.gs</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Code.gs'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDownloadHtml}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Unduh Index.html</span>
              </button>
              <button
                onClick={handleCopyHtml}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                {copiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin Index.html'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => handleTabChange('codegs')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'codegs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Berkas 1: Code.gs (Backend &amp; Spreadsheet)</span>
        </button>
        <button
          onClick={() => handleTabChange('indexhtml')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'indexhtml'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Berkas 2: Index.html (Tampilan Frontend Web)</span>
        </button>
      </div>

      {/* Instruksi Penerapan Lengkap */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-blue-300">
            <BookOpen className="w-4 h-4" />
            <span>Cara Memasukkan 2 Berkas Ini ke Google Apps Script:</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
            Hanya 2 Berkas: Code.gs &amp; Index.html
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="text-amber-300 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px]">1</span>
              Langkah Berkas 1: Code.gs
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
              <li>Buka Google Spreadsheet di Google Drive Anda.</li>
              <li>Klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus semua isi bawaan di berkas <code className="text-amber-300">Code.gs</code>.</li>
              <li>Salin &amp; tempel kode dari tab <strong>Code.gs</strong> ke dalamnya.</li>
            </ol>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="text-emerald-300 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-[11px]">2</span>
              Langkah Berkas 2: Index.html
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed text-[11px]">
              <li>Di panel kiri Apps Script, klik tombol <strong>+ (Tambah Berkas)</strong> &gt; pilih <strong>HTML</strong>.</li>
              <li>Beri nama tepat: <code className="text-emerald-300">Index</code> (Apps Script akan otomatis membuat <code className="text-emerald-300">Index.html</code>).</li>
              <li>Hapus teks bawaan, lalu tempel kode dari tab <strong>Index.html</strong>.</li>
              <li>Simpan proyek (<kbd className="bg-slate-700 px-1 rounded">Ctrl+S</kbd>).</li>
            </ol>
          </div>
        </div>

        <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-500/30 text-blue-200 text-[11px] space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Langkah Terakhir: Publikasikan Sebagai Web App (Deploy)
          </div>
          <p>
            Di pojok kanan atas Apps Script, klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru (New Deployment)</strong> &gt; Pilih jenis <strong>Aplikasi Web (Web App)</strong> &gt; Set <em>Jalankan sebagai:</em> <strong>Saya</strong> &gt; <em>Akses:</em> <strong>Siapa saja (Anyone)</strong> &gt; Klik <strong>Terapkan</strong>.
          </p>
          <p className="text-emerald-300 font-semibold pt-1">
            Link web app resmi Anda langsung aktif dan dapat dibuka langsung di smartphone seluruh dewan guru!
          </p>
        </div>
      </div>

      {/* Editor Tampilan Kode */}
      {activeTab === 'codegs' ? (
        <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
            <span className="font-mono text-blue-400 font-bold flex items-center gap-2">
              <FileCode2 className="w-4 h-4" />
              Code.gs (Backend &amp; Skrip Otomatisasi Database)
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
          </div>
          <pre className="font-mono text-xs overflow-x-auto max-h-[500px] text-blue-300 p-2 leading-relaxed">
            {codeContent}
          </pre>
        </div>
      ) : (
        <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Index.html (Aplikasi Lengkap Bundled - 1 MB)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadHtml}
                className="text-xs text-slate-300 hover:text-white font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={handleCopyHtml}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              File <strong>Index.html</strong> ini menggabungkan semua styling CSS dan logika React menjadi 1 berkas mandiri. Tempelkan seluruh isinya ke dalam file <strong>Index.html</strong> di editor Google Apps Script Anda.
            </span>
          </div>

          {loadingHtml ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Memuat isi Index.html...
            </div>
          ) : (
            <pre className="font-mono text-[11px] overflow-x-auto max-h-[500px] text-emerald-400 p-2 leading-relaxed">
              {htmlContent ? htmlContent.slice(0, 5000) + '\n\n... [Sisa kode ~1MB - klik "Unduh Index.html" atau "Salin Index.html" untuk mengambil semua kode lengkap] ...' : 'Klik "Salin Index.html" atau "Unduh Index.html" di atas untuk mendapatkan berkas Index.html lengkap.'}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
