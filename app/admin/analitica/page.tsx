import type { Metadata } from 'next';
import AnalyticsDashboard from '../../components/dashboard/AnalyticsDashboard';
import { buildInventory } from '../../lib/server/dashboard/inventory';
import { inventoryFromEnvironment } from '../../lib/server/dashboard/inventoryManifest';

export const metadata: Metadata = { title: 'Analítica del sitio | Camino Legal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AnalyticsPage() {
  return <AnalyticsDashboard inventory={buildInventory(inventoryFromEnvironment())} />;
}
