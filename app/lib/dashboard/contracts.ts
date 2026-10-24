import type { AnalyticsEvent } from '../measurement/contracts.ts';

export type Provider = 'ga4' | 'meta';
export type AssetClass = 'active' | 'legacy' | 'excluded' | 'unclassified';
export type Availability = 'available' | 'not_connected' | 'forbidden' | 'unsupported' | 'error' | 'stale' | 'partial' | 'withheld' | 'no_observations';
export type EvidenceStatus = 'verified' | 'unknown' | 'needs_recheck' | 'inapplicable' | 'not_applicable';
export type ClaimKind = 'configuration' | 'registration' | 'observation';
export type Asset = {
  key: string; provider: Provider; name: string; idType: 'property' | 'measurement' | 'pixel';
  id: string; classification: AssetClass; reason: string; owner: string | null;
  environment: 'production' | 'test' | 'unknown'; consoleUrl: string; configuredDestination?: boolean;
};
export type ProductionSelection = { assetKey: string; configurationRevision: string; measurementRevision: string };
export type VerificationEvidence = {
  id: string; assetKey: string; environment: Asset['environment']; kind: ClaimKind; event?: AnalyticsEvent;
  configurationRevision: string; measurementRevision: string; method: 'manual' | 'api';
  source: string; verifiedAt: string; period: { start: string; end: string } | null; result: 'verified' | 'unknown';
};
export type EvidenceView = { status: EvidenceStatus; verifiedAt: string | null; source: string | null; method: VerificationEvidence['method'] | null };
export type EventDefinition = {
  name: AnalyticsEvent; label: string; trigger: string; scope: string;
  category: 'lead' | 'intent' | 'engagement'; google: AnalyticsEvent; meta: 'PageView' | 'Lead' | 'Contact' | null;
  registrationRequired: boolean;
};
export type EventCoverage = EventDefinition & { implementation: 'implemented'; destinations: Record<Provider, {
  configured: boolean; configuration: EvidenceView; registration: EvidenceView; observation: EvidenceView;
}> };
export type TrackingGap = { id: string; title: string; impact: string; nextAction: string; owner: string | null; verifiedAt: string | null; provider: Provider | null };
export type InventoryManifest = { assets: Asset[]; selections: ProductionSelection[]; evidence: VerificationEvidence[]; discovery: {
  checkedAt: string | null; scope: string; complete: boolean;
} };
export type DashboardInventory = InventoryManifest & { events: EventCoverage[]; gaps: TrackingGap[]; generatedAt: string };
export type ReportIdentity = Readonly<{ provider: Provider; resourceId: string; environment: string; start: string; end: string; timezone: string;
  metrics: readonly string[]; dimensions: readonly string[]; filters: string; definitionRevision: string; settingsRevision: string }>;
export type MetricResult = { value: number | null; availability: Availability; complete: boolean; zeroInterpretationVerified: boolean; limitation: string | null };
export type ReportResult = { identity: ReportIdentity; retrievedAt: string | null; metrics: Record<string, MetricResult>; availability: Availability };
export const VERIFICATION_REVIEW_DAYS = 30;
export const REPORT_REFRESH_MINUTES = 15;
export const MAX_REPORT_DAYS = 90;
