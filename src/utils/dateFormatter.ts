/**
 * Utility untuk memformat tanggal dari format database (tahun-bulan-hari / YYYY-MM-DD atau DD-MM-YYYY)
 * menjadi format resmi Indonesia dengan NAMA BULAN (hari - nama bulan - tahun).
 * Contoh: 2026-10-16 -> 16 Oktober 2026
 * Juga menangani tanggal dengan waktu: 2026-10-16 14:20 WIB -> 16 Oktober 2026 14:20 WIB
 */

export const NAMA_BULAN_INDONESIA: Record<string, string> = {
  '01': 'Januari',
  '02': 'Februari',
  '03': 'Maret',
  '04': 'April',
  '05': 'Mei',
  '06': 'Juni',
  '07': 'Juli',
  '08': 'Agustus',
  '09': 'September',
  '10': 'Oktober',
  '11': 'November',
  '12': 'Desember',
};

export function getNamaBulan(kodeBulan?: string | null): string {
  if (!kodeBulan) return '';
  const clean = String(kodeBulan).trim();
  const padded = clean.padStart(2, '0');
  return NAMA_BULAN_INDONESIA[padded] || clean;
}

export function formatTanggalDMY(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const clean = String(dateStr).trim();
  if (!clean || clean === '-') return '-';

  // 1. Format YYYY-MM-DD (misal: 2026-10-16 atau 2026-10-16 14:20 WIB)
  const regexIso = /^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/;
  const matchIso = clean.match(regexIso);
  if (matchIso) {
    const [, yyyy, mm, dd, rest] = matchIso;
    const bulan = getNamaBulan(mm);
    const tgl = parseInt(dd, 10);
    return `${tgl} ${bulan} ${yyyy}${rest || ''}`;
  }

  // 2. Format DD-MM-YYYY (misal: 16-10-2026)
  const regexDmy = /^(\d{1,2})-(\d{1,2})-(\d{4})(.*)$/;
  const matchDmy = clean.match(regexDmy);
  if (matchDmy) {
    const [, dd, mm, yyyy, rest] = matchDmy;
    const bulan = getNamaBulan(mm);
    const tgl = parseInt(dd, 10);
    return `${tgl} ${bulan} ${yyyy}${rest || ''}`;
  }

  return clean;
}
