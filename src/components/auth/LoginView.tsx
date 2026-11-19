import React, { useState, useEffect } from 'react';
import { User, AppConfig } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  QrCode,
  AlertCircle,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { ShareAppModal } from '../common/ShareAppModal';
import { DEFAULT_LOGO_JATIM } from '../../data/defaultLogos';

interface LoginViewProps {
  config: AppConfig;
  users: User[];
  onLoginSuccess: (user: User) => void;
  onOpenVerificationModal: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export const LoginView: React.FC<LoginViewProps> = ({
  config,
  users: _users,
  onLoginSuccess,
  onOpenVerificationModal,
}) => {
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('ejurnal_remembered_identifier') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('ejurnal_remembered_identifier');
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Rate Limiting / Brute-force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Countdown effect when lockout active
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Silakan lengkapi NIP/Username dan Kata Sandi Anda.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = StorageService.authenticate(cleanIdentifier, cleanPassword);
      if (result.success && result.user) {
        // Save or clear remembered identifier
        if (rememberMe) {
          localStorage.setItem('ejurnal_remembered_identifier', cleanIdentifier);
        } else {
          localStorage.removeItem('ejurnal_remembered_identifier');
        }

        setFailedAttempts(0);
        onLoginSuccess(result.user);
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);

        if (nextFailed >= MAX_FAILED_ATTEMPTS) {
          setLockoutTimer(LOCKOUT_DURATION_SECONDS);
          setErrorMessage(
            `Akses terkunci sementara selama ${LOCKOUT_DURATION_SECONDS} detik demi keamanan akun karena ${MAX_FAILED_ATTEMPTS} kali percobaan gagal.`
          );
        } else {
          setErrorMessage(
            result.message ||
              `Kombinasi identitas atau kata sandi tidak cocok. Percobaan ${nextFailed} dari ${MAX_FAILED_ATTEMPTS}.`
          );
        }
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Top Bar Header */}
      <header className="relative z-10 py-3.5 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img
              src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
              alt="Logo Jawa Timur"
              className="h-8 w-auto object-contain drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
              }}
            />
            <div className="border-l border-slate-700 pl-3">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                SMKN 1 SIDAYU GRESIK
              </h1>
              <p className="text-[10px] sm:text-[11px] text-blue-300 font-medium hidden sm:block">
                Pemerintah Provinsi Jawa Timur • Dinas Pendidikan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-400/40 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Bagikan tautan aplikasi"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-blue-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Cek QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Main Card Container */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
            {/* Header: Muncul Logo di Awal */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-7 text-white text-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                {/* Logo Jawa Timur Resmi */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center mb-3.5 border-2 border-white/60">
                  <img
                    src={config.logo_jatim_url || DEFAULT_LOGO_JATIM}
                    alt="Logo Jawa Timur"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_JATIM;
                    }}
                  />
                </div>

                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 text-blue-100 border border-white/20 mb-1">
                  Pemerintah Provinsi Jawa Timur
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  SMKN 1 SIDAYU GRESIK
                </h2>
                <p className="text-xs font-semibold text-blue-200 mt-0.5">
                  E-Jurnal Pembelajaran Mendalam
                </p>
              </div>
            </div>

            {/* Disusul Masukkan User dan Password */}
            <div className="p-6 sm:p-7 space-y-4">
              {/* Brute-force Lockout Alert */}
              {lockoutTimer > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">Proteksi Keamanan Aktif</p>
                    <p className="mt-0.5">
                      Percobaan gagal berulang kali. Silakan tunggu{' '}
                      <strong className="font-mono font-black text-amber-900 underline">
                        {lockoutTimer} detik
                      </strong>{' '}
                      sebelum mencoba kembali.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && lockoutTimer === 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Gagal Masuk</p>
                    <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Input User (Nama, NIP, atau Username) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    NIP, Nama Lengkap, atau Username:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Masukkan NIP atau Username Anda..."
                      required
                      autoFocus
                      disabled={lockoutTimer > 0}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kata Sandi:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi resmi Anda..."
                      required
                      disabled={lockoutTimer > 0}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium bg-slate-50 focus:bg-white font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>Ingat NIP/Username di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || lockoutTimer > 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{lockoutTimer > 0 ? `Terkunci (${lockoutTimer}s)` : 'Masuk ke E-Jurnal'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Keamanan & Panduan Akun Resmi */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Akses Akun Terproteksi</span>
                    <span className="text-slate-500">
                      Gunakan NIP / Username dan kata sandi Anda. Hubungi Administrator Kurikulum jika membutuhkan bantuan akun.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end text-xs pt-1">
                  <button
                    type="button"
                    onClick={onOpenVerificationModal}
                    className="text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-500" />
                    <span>Pindai / Cek QR Dokumen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-slate-950/40">
        <p>
          © 2026 {config.sekolah || 'SMKN 1 SIDAYU GRESIK'} • Sistem Resmi E-Jurnal Pembelajaran Mendalam
        </p>
      </footer>

      {/* Share App Modal */}
      <ShareAppModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        appName="E-Jurnal Pembelajaran Mendalam"
        schoolName={config.sekolah || 'SMKN 1 Sidayu Gresik'}
      />
    </div>
  );
};
