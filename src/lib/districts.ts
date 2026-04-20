export const MAURITIUS_DISTRICTS = [
  'Black River',
  'Flacq',
  'Grand Port',
  'Moka',
  'Pamplemousses',
  'Plaines Wilhems',
  'Port Louis',
  'Rivière du Rempart',
  'Rodrigues',
  'Savanne',
] as const;

export type MauritiusDistrict = (typeof MAURITIUS_DISTRICTS)[number];
