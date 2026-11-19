import React, { useState, useEffect } from 'react';
import { AppConfig, JurnalPembelajaran, User, Guru, KelasItem, MapelItem, JadwalMengajar } from '../../types';
import { StorageService } from '../../services/storageService';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../../services/googleAuthService';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Link2,
  RefreshCw,
  CheckCircle2,
  Database,
  Lock,
  ExternalLink,
  Table,
  LogOut,
  Sparkles,
  Cloud,
  Download,
  AlertCircle,
} from 'lucide-react';
import { formatTanggalDMY } from '../../utils/dateFormatter';

interface AdminSpreadsheetViewProps {
  config: AppConfig;
  journals: JurnalPembelajaran[];
  users: User[];
  teachers: Guru[];
  kelasList: KelasItem[];
  mapelList: MapelItem[];
  jadwalList: JadwalMengajar[];
  onUpdateConfig: (newConfig: AppConfig) => void;
  onRefreshAllData: () => void;
}

export const AdminSpreadsheetView: React.FC<AdminSpreadsheetViewProps> = ({
  config,
  journals,
  users,
  teachers,
  kelasList,
  mapelList,
  jadwalList,
  onUpdateConfig,
}) => {
  const [sheetTab, setSheetTab] = useState<'Jurnal' | 'User' | 'Guru' | 'Kelas' | 'Jadwal'>('Jurnal');
  const [gasUrl, setGasUrl] = useState<string>(config.gas_web_app_url || '');
  const [spreadsheetInput, setSpreadsheetInput] = useState<string>(config.spreadsheet_id || '');

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMsg({
          type: 'success',
          text: `Berhasil terhubung dengan Google Workspace (${res.user.email}).`,
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Gagal masuk Google Workspace: ${err.message || 'Silakan izinkan popup otentikasi.'}`,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessToken(null);
    setStatusMsg({
      type: 'info',
      text: 'Telah keluar dari akun Google Workspace.',
    });
  };

  const extractSheetId = (input: string): string => {
    const trimmed = input.trim();
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  };

  const handleSaveConnection = () => {
    const cleanId = extractSheetId(spreadsheetInput);
    const updated = StorageService.saveConfig({
      gas_web_app_url: gasUrl,
      spreadsheet_id: cleanId,
    });
    onUpdateConfig(updated);
    setStatusMsg({
      type: 'success',
      text: 'Konfigurasi Spreadsheet ID & Apps Script berhasil disimpan!',
    });
  };

  const handleCreateNewGoogleSheet = async () => {
    let token = accessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      setStatusMsg({
        type: 'error',
        text: 'Silakan "Sign in with Google" terlebih dahulu untuk membuat spreadsheet di Google Drive Anda.',
      });
      return;
    }
    setIsCreatingSheet(true);
    setStatusMsg({
      type: 'info',
      text: 'Membuat file Google Spreadsheet baru di Google Drive...',
    });
    try {
      const { spreadsheetId } = await GoogleSheetsService.createDatabaseSpreadsheet(
        token,
        'E-JURNAL PEMBELAJARAN MENDALAM SMKN 1 SIDAYU'
      );
      await GoogleSheetsService.populateAllSheets(
        spreadsheetId,
        {
          journals,
          users,
          teachers,
          kelasList,
          mapelList,
          jadwalList,
        },
        token
      );
      setSpreadsheetInput(spreadsheetId);
      const updated = StorageService.saveConfig({
        spreadsheet_id: spreadsheetId,
      });
      onUpdateConfig(updated);
      setStatusMsg({
        type: 'success',
        text: `Google Spreadsheet berhasil dibuat di Google Drive! ID: ${spreadsheetId}`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Gagal membuat spreadsheet: ${err.message}`,
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const currentSheetId = extractSheetId(spreadsheetInput || config.spreadsheet_id || '');

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Integrasi Google Workspace & Spreadsheet Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Database Google Spreadsheet & Apps Script
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hubungkan akun Google Workspace Anda untuk membuat, membaca, dan menyinkronkan data e-jurnal ke Google Spreadsheet secara langsung.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 self-start md:self-auto">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>LockService Guard: AKTIF (30s)</span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span>Otentikasi Google Workspace (Drive &amp; Spreadsheets API)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Memberikan izin aplikasi untuk mengelola file Google Spreadsheet di Google Drive Anda.
            </p>
          </div>
          <div>
            {googleUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 truncate max-w-xs">{googleUser.email}</span>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-blue-500 bg-white shadow-xs text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleCreateNewGoogleSheet}
            disabled={isCreatingSheet}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            {isCreatingSheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>✨ Buat Spreadsheet Baru di Google Drive</span>
          </button>
          {currentSheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka di Google Sheets ↗</span>
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-600" />
          <span>Pengaturan Spreadsheet ID &amp; Google Apps Script Web App</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Spreadsheet ID / URL Lengkap:
            </label>
            <input
              type="text"
              value={spreadsheetInput}
              onChange={(e) => setSpreadsheetInput(e.target.value)}
              placeholder="Contoh: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Apps Script Web App URL:
            </label>
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleSaveConnection}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Simpan Konfigurasi ID
          </button>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-extrabold text-slate-900">
              Pratinjau Lembar Kerja (Sheet View)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['Jurnal', 'User', 'Guru', 'Kelas', 'Jadwal'] as const).map((sheet) => (
              <button
                key={sheet}
                onClick={() => setSheetTab(sheet)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  sheetTab === sheet ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sheet {sheet}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-2xl">
          {sheetTab === 'Jurnal' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 sticky top-0 font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-3">ID Jurnal</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Guru</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Materi</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{j.id}</td>
                    <td className="p-3">{formatTanggalDMY(j.tanggal)}</td>
                    <td className="p-3 font-sans text-xs">{j.guru_nama}</td>
                    <td className="p-3 text-blue-700 font-bold">{j.kelas}</td>
                    <td className="p-3 font-sans text-xs">{j.materi}</td>
                    <td className="p-3">
                      <span className="font-sans px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sheetTab === 'User' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 sticky top-0 font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-3 w-16 text-center">Kode</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-bold text-slate-900">{u.kode_guru ? `#${u.kode_guru}` : '-'}</td>
                    <td className="p-3 text-blue-700">{u.username}</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">{u.nama}</td>
                    <td className="p-3 uppercase">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'kepsek' ? 'bg-purple-100 text-purple-800' : u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.nip}</td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sheetTab === 'Guru' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 sticky top-0 font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-3 w-16 text-center">Kode</th>
                  <th className="p-3">Nama Lengkap Guru</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Mapel Diampu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {teachers.map((t) => (
                  <tr key={t.kode_guru} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-bold text-slate-900">#{t.kode_guru}</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">{t.nama}</td>
                    <td className="p-3">{t.nip}</td>
                    <td className="p-3 text-slate-500">{t.email}</td>
                    <td className="p-3 font-sans text-xs">{t.mapel_diampu.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sheetTab === 'Kelas' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 sticky top-0 font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-3">ID Kelas</th>
                  <th className="p-3">Nama Kelas</th>
                  <th className="p-3">Tingkat</th>
                  <th className="p-3">Jurusan</th>
                  <th className="p-3">Jumlah Siswa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{k.id}</td>
                    <td className="p-3 font-sans font-bold text-slate-900">{k.nama}</td>
                    <td className="p-3">{k.tingkat}</td>
                    <td className="p-3 text-blue-700 font-bold">{k.jurusan}</td>
                    <td className="p-3">{k.jumlah_siswa} Siswa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {sheetTab === 'Jadwal' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 sticky top-0 font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Hari</th>
                  <th className="p-3">Jam Ke</th>
                  <th className="p-3">Guru</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Mata Pelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {jadwalList.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{j.id}</td>
                    <td className="p-3 font-bold text-amber-900">{j.hari}</td>
                    <td className="p-3">{j.jam_ke}</td>
                    <td className="p-3 font-sans text-xs">{j.guru_nama}</td>
                    <td className="p-3 text-blue-700 font-bold">{j.kelas}</td>
                    <td className="p-3 font-sans text-xs">{j.mapel_nama} ({j.mapel_kode})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
