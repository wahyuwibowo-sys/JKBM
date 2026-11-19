/**
 * Utility untuk membersihkan nomor NIP dari semua karakter non-numerik (termasuk spasi).
 * Menghasilkan NIP murni digit angka tanpa spasi agar data NIP guru dan akun tetap konsisten.
 */

export function formatNip(nip?: string | null): string {
  if (!nip) return '-';
  const clean = String(nip).trim();
  if (clean === '' || clean === '-' || clean === 'null' || clean === 'undefined') return '-';

  // Bersihkan semua karakter non-numerik (termasuk spasi, titik, strip)
  const digits = clean.replace(/\D/g, '');
  return digits || '-';
}

/**
 * Normalisasi NIP untuk pencarian, login, atau pencocokan (mengabaikan spasi, tanda minus, titik)
 */
export function normalizeNip(nip?: string | null): string {
  if (!nip) return '';
  return String(nip).replace(/\D/g, '').trim();
}
