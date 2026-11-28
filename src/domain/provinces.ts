/**
 * Province-level grouping for the extant map.
 *
 * This is a navigation facet, not a historical claim: the value only decides
 * which shelf a documented current place is filed under. It never changes a
 * place's coordinates, collection assertion or sources.
 *
 * The list is deliberately closed. A new place outside these groups fails the
 * build until its province is added here, so the province sidebar cannot
 * silently drop a record.
 */

export const PROVINCES = [
  { id: 'beijing', zh: '北京', en: 'Beijing', order: 1 },
  { id: 'tianjin', zh: '天津', en: 'Tianjin', order: 2 },
  { id: 'hebei', zh: '河北', en: 'Hebei', order: 3 },
  { id: 'shanxi', zh: '山西', en: 'Shanxi', order: 4 },
  { id: 'liaoning', zh: '辽宁', en: 'Liaoning', order: 5 },
  { id: 'jilin', zh: '吉林', en: 'Jilin', order: 6 },
  { id: 'shanghai', zh: '上海', en: 'Shanghai', order: 7 },
  { id: 'jiangsu', zh: '江苏', en: 'Jiangsu', order: 8 },
  { id: 'shandong', zh: '山东', en: 'Shandong', order: 9 },
  { id: 'henan', zh: '河南', en: 'Henan', order: 10 },
  { id: 'hubei', zh: '湖北', en: 'Hubei', order: 11 },
  { id: 'hunan', zh: '湖南', en: 'Hunan', order: 12 },
  { id: 'yunnan', zh: '云南', en: 'Yunnan', order: 13 },
  { id: 'shaanxi', zh: '陕西', en: 'Shaanxi', order: 14 },
  { id: 'gansu', zh: '甘肃', en: 'Gansu', order: 15 },
  { id: 'taiwan', zh: '台湾', en: 'Taiwan', order: 16 },
  { id: 'overseas', zh: '海外', en: 'Overseas', order: 17 },
] as const;

export type Province = (typeof PROVINCES)[number];
export type ProvinceId = Province['id'];

export const PROVINCE_IDS: readonly ProvinceId[] = PROVINCES.map((province) => province.id);

const BY_ID = new Map<string, Province>(PROVINCES.map((province) => [province.id, province]));

export function findProvince(id: string | null | undefined): Province | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function provinceOrder(id: string | null | undefined): number {
  return findProvince(id)?.order ?? Number.POSITIVE_INFINITY;
}
