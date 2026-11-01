import type { Asset, InventoryManifest } from '../../dashboard/contracts.ts';

// Non-secret, reviewed records only. Never add credentials or visitor information.
export const reviewedInventory: InventoryManifest = {
  assets: [], selections: [], evidence: [],
  discovery: { checkedAt: null, scope: 'Configuración disponible en este entorno; descubrimiento de cuentas pendiente.', complete: false },
};

export function inventoryFromEnvironment(env: Record<string, string | undefined> = process.env): InventoryManifest {
  const assets: Asset[] = [...reviewedInventory.assets];
  const add = (asset: Asset) => { if (!assets.some(item => item.provider === asset.provider && item.idType === asset.idType && item.id === asset.id)) assets.push(asset); };
  const common = { classification: 'unclassified' as const, reason: 'Identificador configurado; selección de producción y propiedad pendientes de verificación.', owner: null, environment: 'unknown' as const };
  const measurement = env.NEXT_PUBLIC_GA4_ID;
  if (measurement && /^G-[A-Z0-9]+$/.test(measurement)) add({ ...common, key: `ga4:measurement:${measurement}`, provider: 'ga4', configuredDestination: true, idType: 'measurement', id: measurement, name: 'Flujo web de Google Analytics', consoleUrl: 'https://analytics.google.com/' });
  const property = env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (property && /^\d+$/.test(property)) add({ ...common, key: `ga4:property:${property}`, provider: 'ga4', idType: 'property', id: property, name: 'Propiedad de Google Analytics', consoleUrl: `https://analytics.google.com/analytics/web/#/p${property}/reports/intelligenthome` });
  const pixel = env.NEXT_PUBLIC_META_PIXEL_ID;
  if (pixel && /^\d+$/.test(pixel)) add({ ...common, key: `meta:pixel:${pixel}`, provider: 'meta', configuredDestination: true, idType: 'pixel', id: pixel, name: 'Pixel / conjunto de datos de Meta', consoleUrl: `https://business.facebook.com/events_manager2/list/pixel/${pixel}/overview` });
  return { ...reviewedInventory, assets };
}
