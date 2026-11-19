import React, { useState, useEffect } from 'react';
import { JurnalPembelajaran, AppConfig } from '../../types';
import { OfficialQRCode } from '../common/OfficialQRCode';
import { DEFAULT_LOGO_SIDAYU, DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Copy,
  Check,
  Volume2,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal?: JurnalPembelajaran | null;
  config: AppConfig;
  semester?: string;
  guruNama?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  journal,
  config,
  semester = 'Ganjil',
  guruNama,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const playScannerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch {
      // AudioContext not supported or restricted
    }
  };

  useEffect(() => {
    if (isOpen) {
      playScannerBeep();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const target = journal || {
    id: 'JRN-20261016-001',
    tanggal: '2026-10-16',
    guru_nama: guruNama || 'Ahmad Heru Wahyu Wibowo, S.Pd',
    guru_nip: '198312162024211002',
    mapel: 'Mata Pelajaran Konsentrasi Keahlian',
    kelas: 'XI TKJ 1',
    materi: 'Konfigurasi VLAN & Inter-VLAN Routing pada Switch Manageable',
    status: 'Disetujui',
    validator_nama: config.kepala_sekolah,
    tanggal_validasi: '2026-10-16 14:20 WIB',
    qr_token: 'SMKN1SIDAYU-VAL-JRN20261016001-OK',
  };

  const currentGuru = journal?.guru_nama || guruNama || target.guru_nama || 'Ahmad Heru Wahyu Wibowo, S.Pd';
  const currentKepsek = config.kepala_sekolah || 'Arni Sulistyowati, S.Pd., M.Pd';
  const exactScannedText = `File Jurnal KBM Semester ${semester} ini valid sudah di tanda tangani secara elektronik Oleh : Nama Guru : ${currentGuru} Kepala Sekolah : ${currentKepsek}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exactScannedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
              alt="Logo Jatim"
              className="h-14 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
              }}
            />
            <img
              src={config.logo_url || DEFAULT_LOGO_SIDAYU}
              alt="Logo SMKN 1 Sidayu"
              className="h-14 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_SIDAYU;
              }}
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DOKUMEN TERVERIFIKASI RESMI</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            VERIFIKASI TANDA TANGAN ELEKTRONIK
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Sistem E-Jurnal Pembelajaran Mendalam SMKN 1 Sidayu Gresik
          </p>
        </div>
        <div className="my-4 p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-purple-950 text-xs space-y-2.5 leading-relaxed shadow-xs">
          <div className="flex items-center justify-between font-bold text-purple-900 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hasil Pindai (Scan) Barcode TTD:</span>
            </div>
            <button
              onClick={playScannerBeep}
              className="text-[10px] text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded-full transition-colors"
              title="Putar Bunyi Beep Scanner"
            >
              <Volume2 className="w-3 h-3" />
              <span>Beep</span>
            </button>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-1.5 font-medium font-sans relative">
            <p className="font-extrabold text-slate-900 text-[13px] leading-snug">
              File Jurnal KBM Semester {semester} ini valid sudah di tanda tangani secara elektronik Oleh :
            </p>
            <div className="pt-1 space-y-1">
              <p className="text-slate-800 flex items-baseline gap-1">
                <span className="font-semibold text-slate-600 min-w-[110px]">Nama Guru :</span>
                <strong className="text-blue-900 text-xs">{currentGuru}</strong>
              </p>
              <p className="text-slate-800 flex items-baseline gap-1">
                <span className="font-semibold text-slate-600 min-w-[110px]">Kepala Sekolah :</span>
                <strong className="text-purple-900 text-xs">{currentKepsek}</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Status: Tervalidasi Otentik & Sah
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span className="text-emerald-800">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Teks Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="my-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
          <OfficialQRCode
            guruNama={currentGuru}
            kepsekNama={currentKepsek}
            semester={semester}
            size={135}
            logoUrl={config.logo_url || DEFAULT_LOGO_SIDAYU}
            showScanTooltip={false}
          />
          <div className="mt-2 text-[10px] font-mono text-slate-600 font-semibold tracking-wider text-center">
            TOKEN: {target.qr_token || 'SMKN1SIDAYU-VERIFIED-AUTH'}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
        >
          Tutup Verifikasi
        </button>
      </div>
    </div>
  );
};
