import { measurementCatalog } from '../../dashboard/catalog.ts';
import { VERIFICATION_REVIEW_DAYS, type DashboardInventory, type EvidenceView, type InventoryManifest, type VerificationEvidence, type ProductionSelection, type Asset, type TrackingGap, type Provider } from '../../dashboard/contracts.ts';

const unknown = (): EvidenceView => ({ status: 'unknown', verifiedAt: null, source: null, method: null });
const notApplicable = (): EvidenceView => ({ ...unknown(), status: 'not_applicable' });
export function evidenceView(evidence: VerificationEvidence | undefined, selection: ProductionSelection | undefined, asset: Asset | undefined, now: Date): EvidenceView {
  if (!evidence) return unknown();
  const view = { verifiedAt: evidence.verifiedAt, source: evidence.source, method: evidence.method };
  if (!selection || !asset || evidence.assetKey !== selection.assetKey || evidence.assetKey !== asset.key || evidence.environment !== asset.environment || evidence.configurationRevision !== selection.configurationRevision || evidence.measurementRevision !== selection.measurementRevision) return { ...view, status: 'inapplicable' };
  const age = now.getTime() - Date.parse(evidence.verifiedAt);
  if (!Number.isFinite(age) || age < 0 || evidence.result !== 'verified') return { ...view, status: 'unknown' };
  return { ...view, status: (evidence.kind === 'configuration' || evidence.method === 'manual') && age > VERIFICATION_REVIEW_DAYS * 86_400_000 ? 'needs_recheck' : 'verified' };
}
export function buildInventory(manifest: InventoryManifest, now = new Date()): DashboardInventory {
  const events = measurementCatalog.map(event => {
    const destination = (provider: Provider) => {
      const applicable = provider === 'ga4' || event.meta !== null;
      const selection = manifest.selections.find(item => manifest.assets.some(asset => asset.key === item.assetKey && asset.provider === provider && asset.classification === 'active' && asset.environment === 'production'));
      const asset = manifest.assets.find(item => item.key === selection?.assetKey);
      const claim = (kind: VerificationEvidence['kind']) => {
        if (!applicable) return notApplicable();
        const candidates = manifest.evidence.filter(item => item.assetKey === asset?.key && item.kind === kind && (kind === 'configuration' ? !item.event : item.event === event.name)).sort((a,b) => Date.parse(b.verifiedAt) - Date.parse(a.verifiedAt));
        return evidenceView(candidates[0], selection, asset, now);
      };
      return { configured: applicable && manifest.assets.some(item => item.provider === provider && item.configuredDestination === true && !['legacy', 'excluded'].includes(item.classification) && (provider === 'ga4' ? item.idType === 'measurement' : item.idType === 'pixel')), configuration: claim('configuration'), registration: provider === 'ga4' && event.registrationRequired ? claim('registration') : notApplicable(), observation: claim('observation') };
    };
    return { ...event, implementation: 'implemented' as const, destinations: { ga4: destination('ga4'), meta: destination('meta') } };
  });
  const gaps: TrackingGap[] = [];
  for (const provider of ['ga4', 'meta'] as const) {
    const label = provider === 'ga4' ? 'Google Analytics' : 'Meta';
    const selected = manifest.selections.find(selection => manifest.assets.some(asset => asset.key === selection.assetKey && asset.provider === provider && asset.classification === 'active' && asset.environment === 'production'));
    if (!selected) gaps.push({ id: `${provider}:selection`, provider, title: `Confirmar el recurso de producción de ${label}`, impact: 'La configuración local no demuestra qué cuenta pertenece al sitio en producción.', nextAction: 'Revisar los identificadores, clasificar las cuentas y registrar la selección aprobada.', owner: null, verifiedAt: null });
    const lead = events.find(event => event.name === 'lead_submitted')!.destinations[provider];
    if (lead.observation.status !== 'verified') gaps.push({ id: `${provider}:lead`, provider, title: `Verificar recepción de solicitudes en ${label}`, impact: 'El evento está implementado, pero su recepción actual no está verificada.', nextAction: provider === 'ga4' ? 'Revisar lead_submitted y su registro como evento clave en la propiedad seleccionada.' : 'Revisar Lead y la deduplicación de navegador/servidor en Events Manager.', owner: manifest.assets.find(asset => asset.key === selected?.assetKey)?.owner ?? null, verifiedAt: lead.observation.verifiedAt });
  }
  return { ...manifest, events, gaps, generatedAt: now.toISOString() };
}
