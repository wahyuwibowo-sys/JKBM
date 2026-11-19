import React, { useState } from 'react';
import { AppConfig } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_LOGO_SIDAYU, DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';

interface AdminLogoManagerProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
}

export const AdminLogoManager: React.FC<AdminLogoManagerProps> = ({ config, onUpdateConfig }) => {
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'jatim' | 'qr'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        let update: Partial<AppConfig> = {};
        if (type === 'logo') update = { logo_url: dataUrl };
        if (type === 'jatim') update = { logo_jatim_url: dataUrl };
        if (type === 'qr') update = { qr_code_ttd_url: dataUrl };
        const updated = StorageService.saveConfig(update);
        onUpdateConfig(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan logo dan QR code ke file aset resmi bawaan SMKN 1 Sidayu?')) {
      const updated = StorageService.saveConfig({
        logo_url: DEFAULT_LOGO_SIDAYU,
        logo_jatim_url: DEFAULT_LOGO_JATIM,
        qr_code_ttd_url: '/assets/ttd-jurnal.svg',
      });
      onUpdateConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Otoritas Administrator Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kelola Logo Sekolah & Barcode TTD QR Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan file citra resmi yang tampil pada Login, Dashboard, PDF, Halaman Validasi & Verifikasi.
          </p>
        </div>
        <button
          onClick={handleResetDefaults}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Aset Standar</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>File aset resmi berhasil diperbarui dan disinkronkan ke seluruh sistem!</span>
        </div>
      )}

      <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 text-xs text-amber-950 space-y-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>ATURAN WAJIB & LARANGAN KETAT PENGGUNAAN LOGO & QR CODE:</span>
        </div>
        <p className="leading-relaxed">
          Sesuai SOP Administrasi Sekolah SMKN 1 Sidayu Gresik, sistem <strong>WAJIB</strong> menggunakan file logo dan QR Code resmi yang diunggah administrator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">1. Lambang Jawa Timur (Resmi)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                jatim.svg
              </span>
            </div>
            <div className="h-44 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 mb-4">
              <img
                src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                alt="Logo Jawa Timur"
                className="max-h-full max-w-full object-contain drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Tampil pada Kop Surat Laporan PDF, Dashboard, dan header aplikasi resmi SMKN 1 Sidayu Gresik.
            </p>
          </div>
          <label className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Unggah / Ganti File jatim.png</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'jatim')}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">2. Logo SMKN 1 Sidayu (Resmi)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                smkn1sidayu.svg
              </span>
            </div>
            <div className="h-44 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 mb-4">
              <img
                src={config.logo_url || DEFAULT_LOGO_SIDAYU}
                alt="Logo SMKN 1 Sidayu"
                className="max-h-full max-w-full object-contain drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_SIDAYU;
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Lambang perisai dengan jangka teknik, jangkar maritim, ikan bandeng Gresik, dan komputer jaringan.
            </p>
          </div>
          <label className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Unggah / Ganti File Logo Sekolah</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'logo')}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between ring-2 ring-purple-600/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">3. Barcode TTD QR (Resmi)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                ttd-jurnal.svg
              </span>
            </div>
            <div className="h-44 rounded-2xl bg-white border border-slate-300 flex items-center justify-center p-3 mb-4 shadow-inner">
              <img
                src={config.qr_code_ttd_url || '/assets/ttd-jurnal.svg'}
                alt="Barcode TTD Jurnal QR Code Resmi"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/ttd-jurnal.svg';
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              QR Code dengan logo SMKN 1 Sidayu di tengah untuk tanda tangan elektronik dan verifikasi keaslian dokumen.
            </p>
          </div>
          <label className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Unggah / Ganti ttd jurnal.png</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'qr')}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
