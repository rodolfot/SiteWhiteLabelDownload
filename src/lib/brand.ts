import { siteConfig } from './site-config';

/** Split site name into two halves for the branded logo display */
export function getBrandParts(): [string, string] {
  const name = siteConfig.name;
  const mid = Math.ceil(name.length / 2);
  return [name.slice(0, mid), name.slice(mid)];
}
