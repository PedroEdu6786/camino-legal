import type { Metadata } from 'next';
import AnalyticsDashboard from '../../components/dashboard/AnalyticsDashboard';
import { buildInventory } from '../../lib/server/dashboard/inventory';
import { inventoryFromEnvironment } from '../../lib/server/dashboard/inventoryManifest';
import { redirect } from 'next/navigation';
import { getReaderAccess } from '../../lib/server/dashboard/readerAccess';
import ReaderSessionBoundary from '../../components/dashboard/ReaderSessionBoundary';
import { logoutReader } from '../acceso/actions';

export const metadata: Metadata = { title: 'Analítica del sitio | Camino Legal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AnalyticsPage() {
  const access = await getReaderAccess();
  if (access.status !== 200) {
    const reason = access.status === 403 ? 'denied' : access.status === 503 ? 'unavailable' : 'expired';
    redirect(`/admin/acceso?reason=${reason}`);
  }
  // Google Analytics only for now: Meta assets and checks are hidden, not deleted.
  const inventory = buildInventory(inventoryFromEnvironment());
  return <ReaderSessionBoundary expiresAt={access.reader.expiresAt}>
    <AnalyticsDashboard signOutControl={<form action={logoutReader}><button type="submit">Cerrar sesión</button></form>} inventory={{ ...inventory, assets: inventory.assets.filter(asset => asset.provider === 'ga4'), gaps: inventory.gaps.filter(gap => gap.provider !== 'meta') }} />
  </ReaderSessionBoundary>;
}
