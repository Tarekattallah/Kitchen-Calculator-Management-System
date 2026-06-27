export interface CatalogItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  badge?: string;
  badgeType?: 'eco' | 'mid' | 'gd' | 'lux' | 'extra' | 'intel';
  patternId?: string;
  unit?: string;
}

export interface AddonItem {
  id: string;
  name: string;
  sub: string;
  price: number;
}

export interface CatalogData {
  wood: CatalogItem[];
  door: CatalogItem[];
  ctr: CatalogItem[];
  acc: CatalogItem[];
  height: CatalogItem[];
  handle: CatalogItem[];
  light: CatalogItem[];
  finish: CatalogItem[];
  addons: AddonItem[];
}

export interface GeneratedLogo {
  svg: string;
  explanation: string;
  styles?: string;
  animationType: string;
}
