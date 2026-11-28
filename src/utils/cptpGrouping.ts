import { KurikulumCPTP, MapelItem } from '../types';

function cleanSpaces(value?: string | null): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function stripElemenPrefix(elemen: string): string {
  return elemen.replace(/^[A-Z]\.\s*/i, '').trim();
}

function inferInformatikaElemen(item: KurikulumCPTP): string {
  const combined = `${item.materi_pokok || ''} ${item.cp || ''} ${item.tp || ''}`.toLowerCase();
  if (
    combined.includes('analisis data') ||
    combined.includes('open data') ||
    combined.includes('sumber data terbuka') ||
    combined.includes('pemodelan prediksi')
  ) {
    return 'C. Analisis Data';
  }
  if (
    combined.includes('pemrograman') ||
    combined.includes('kode sumber') ||
    combined.includes('library') ||
    combined.includes('program komputer terstruktur')
  ) {
    return 'D. Algoritma dan Pemrograman';
  }
  if (
    combined.includes('literasi digital') ||
    combined.includes('lateral reading') ||
    combined.includes('periksa fakta') ||
    combined.includes('mesin pencari') ||
    combined.includes('perkantoran') ||
    combined.includes('konten digital') ||
    combined.includes('haki') ||
    combined.includes('2fa') ||
    combined.includes('kata sandi') ||
    combined.includes('hukum siber') ||
    combined.includes('perbankan digital') ||
    combined.includes('loka pasar')
  ) {
    return 'B. Literasi Digital';
  }
  if (
    combined.includes('berpikir komputasional') ||
    combined.includes('struktur data') ||
    combined.includes('algoritma') ||
    combined.includes('pseudocode') ||
    combined.includes('von neumann') ||
    combined.includes('sistem operasi') ||
    combined.includes('produk digital') ||
    combined.includes('jaringan komputer')
  ) {
    return 'A. Berpikir Komputasional';
  }
  return '';
}

function inferKkaElemen(item: KurikulumCPTP): string {
  const combined = `${item.materi_pokok || ''} ${item.cp || ''} ${item.tp || ''}`.toLowerCase();
  if (combined.includes('prompt engineering') || combined.includes('ai system design') || combined.includes('ka generatif')) {
    return 'F. Pemanfaatan dan Pengembangan KA';
  }
  if (combined.includes('etika') || combined.includes('bias data') || combined.includes('profesi bidang ka')) {
    return 'E. Literasi dan Etika KA';
  }
  if (combined.includes('basis data') || combined.includes('mahadata') || combined.includes('big data') || combined.includes('data encoding')) {
    return 'D. Analisis Data';
  }
  if (combined.includes('oop') || combined.includes('iot') || combined.includes('bahasa pemrograman') || combined.includes('algoritma pemrograman')) {
    return 'C. Algoritma Pemrograman';
  }
  if (combined.includes('literasi digital') || combined.includes('konten digital') || combined.includes('diseminasi')) {
    return 'B. Literasi Digital';
  }
  if (combined.includes('berpikir komputasional') || combined.includes('dekomposisi') || combined.includes('abstraksi')) {
    return 'A. Berpikir Komputasional';
  }
  return '';
}

export function resolveCanonicalElemen(
  item: KurikulumCPTP,
  canonicalByBase?: Map<string, string>
): string {
  const mapelKode = (item.mapel_kode || '').trim().toUpperCase();
  let raw = cleanSpaces(item.elemen);

  if (!raw) {
    if (mapelKode === 'INF') raw = inferInformatikaElemen(item);
    else if (mapelKode === 'KKA') raw = inferKkaElemen(item);
  }

  if (!raw) return 'Umum / Lainnya';

  const baseLower = stripElemenPrefix(raw).toLowerCase();
  if (mapelKode === 'INF') {
    if (baseLower === 'berpikir komputasional') return 'A. Berpikir Komputasional';
    if (baseLower === 'literasi digital') return 'B. Literasi Digital';
    if (baseLower === 'analisis data') return 'C. Analisis Data';
    if (baseLower === 'algoritma dan pemrograman') return 'D. Algoritma dan Pemrograman';
  } else if (mapelKode === 'KKA') {
    if (baseLower === 'berpikir komputasional') return 'A. Berpikir Komputasional';
    if (baseLower === 'literasi digital') return 'B. Literasi Digital';
    if (baseLower === 'algoritma pemrograman') return 'C. Algoritma Pemrograman';
    if (baseLower === 'analisis data') return 'D. Analisis Data';
    if (baseLower === 'literasi dan etika ka') return 'E. Literasi dan Etika KA';
    if (baseLower === 'pemanfaatan dan pengembangan ka') return 'F. Pemanfaatan dan Pengembangan KA';
  }

  if (canonicalByBase && canonicalByBase.has(baseLower)) {
    return canonicalByBase.get(baseLower)!;
  }

  return raw;
}

const FASE_ORDER: Record<string, number> = {
  E: 1,
  'E/F': 2,
  F: 3,
};

function compareFase(a?: string, b?: string): number {
  const oa = FASE_ORDER[(a || '').toUpperCase()] ?? 99;
  const ob = FASE_ORDER[(b || '').toUpperCase()] ?? 99;
  if (oa !== ob) return oa - ob;
  return (a || '').localeCompare(b || '');
}

function buildCanonicalMapForItems(items: KurikulumCPTP[]): Map<string, Map<string, string>> {
  const mapByMapel = new Map<string, Map<string, string>>();
  for (const item of items) {
    const raw = cleanSpaces(item.elemen);
    if (!raw || !/^[A-Z]\.\s+/i.test(raw)) continue;
    const mapelKey = (item.mapel_kode || '').trim().toUpperCase();
    const baseLower = stripElemenPrefix(raw).toLowerCase();
    if (!baseLower) continue;
    let baseMap = mapByMapel.get(mapelKey);
    if (!baseMap) {
      baseMap = new Map<string, string>();
      mapByMapel.set(mapelKey, baseMap);
    }
    if (!baseMap.has(baseLower)) {
      baseMap.set(baseLower, raw);
    }
  }
  return mapByMapel;
}

export interface ElemenCptpGroup {
  elemen: string;
  items: KurikulumCPTP[];
}

export function groupCptpByElemen(items: KurikulumCPTP[]): ElemenCptpGroup[] {
  const canonicalMaps = buildCanonicalMapForItems(items);
  const groups = new Map<string, KurikulumCPTP[]>();

  for (const item of items) {
    const mapelKey = (item.mapel_kode || '').trim().toUpperCase();
    const elemenKey = resolveCanonicalElemen(item, canonicalMaps.get(mapelKey));
    const bucket = groups.get(elemenKey) || [];
    bucket.push(item);
    groups.set(elemenKey, bucket);
  }

  const entries = Array.from(groups.entries()).map(([elemen, groupItems]) => ({
    elemen,
    items: [...groupItems].sort((a, b) => {
      const faseCmp = compareFase(a.fase, b.fase);
      if (faseCmp !== 0) return faseCmp;
      return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
    }),
  }));

  entries.sort((a, b) => {
    if (a.elemen === 'Umum / Lainnya') return 1;
    if (b.elemen === 'Umum / Lainnya') return -1;
    return a.elemen.localeCompare(b.elemen, 'id', { numeric: true });
  });

  return entries;
}

export interface MapelCptpGroup {
  mapel_kode: string;
  mapel_nama: string;
  elemenGroups: ElemenCptpGroup[];
  totalItems: number;
}

export function groupCptpByMapelAndElemen(
  items: KurikulumCPTP[],
  mapelList: MapelItem[]
): MapelCptpGroup[] {
  const byMapel = new Map<string, KurikulumCPTP[]>();
  for (const item of items) {
    const code = (item.mapel_kode || 'LAINNYA').trim().toUpperCase();
    const bucket = byMapel.get(code) || [];
    bucket.push(item);
    byMapel.set(code, bucket);
  }

  const mapelOrder = new Map<string, number>();
  mapelList.forEach((m, idx) => mapelOrder.set(m.kode.toUpperCase(), idx));

  const mapelNameMap = new Map<string, string>();
  mapelList.forEach((m) => mapelNameMap.set(m.kode.toUpperCase(), m.nama));

  const sortedCodes = Array.from(byMapel.keys()).sort((a, b) => {
    const oa = mapelOrder.get(a) ?? 999;
    const ob = mapelOrder.get(b) ?? 999;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b);
  });

  return sortedCodes.map((code) => {
    const mapelItems = byMapel.get(code) || [];
    return {
      mapel_kode: code,
      mapel_nama: mapelNameMap.get(code) || code,
      elemenGroups: groupCptpByElemen(mapelItems),
      totalItems: mapelItems.length,
    };
  });
}
