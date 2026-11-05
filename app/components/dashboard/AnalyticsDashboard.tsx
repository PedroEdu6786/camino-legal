"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The admin/public boundary deliberately starts a fresh document to isolate marketing SDKs. */

import { useState, type KeyboardEvent } from 'react';
import type { DashboardInventory, AssetClass } from '../../lib/dashboard/contracts';
import styles from './AnalyticsDashboard.module.css';
import GoogleSummary from './GoogleSummary';
import PromotionPreviewControls from './PromotionPreviewControls';
import InsightsPanel from './InsightsPanel';

const tabs = [{ id: 'overview', label: 'Resumen' }, { id: 'accounts', label: 'Cuentas registradas' }, { id: 'gaps', label: 'Pendientes de seguimiento' }] as const;
type Tab = (typeof tabs)[number]['id'];
const classLabels: Record<AssetClass, string> = { active: 'Activo', legacy: 'Anterior', excluded: 'Excluido', unclassified: 'Por clasificar' };
const providerLabel = { ga4: 'Google Analytics', meta: 'Meta' };
function date(value: string | null) {
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(timestamp) : 'Sin fecha de verificación válida';
}
export default function AnalyticsDashboard({ inventory, signOutControl }: { inventory: DashboardInventory; signOutControl?: import('react').ReactNode }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [provider, setProvider] = useState('all');
  const [classification, setClassification] = useState('all');
  const assets = inventory.assets.filter(asset => (provider === 'all' || asset.provider === provider) && (classification === 'all' || asset.classification === classification));
  function selectTab(id: Tab) { setTab(id); }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next].id); document.getElementById(`analytics-tab-${tabs[next].id}`)?.focus();
  }
  return <div className={styles.app}>
    <header className={styles.topbar}><a href="/" className={styles.brand}>camino legal<span>®</span></a><span>Analítica del sitio</span><a href="/" className={styles.returnLink}>Volver al sitio ↗</a>{signOutControl}</header>
    <div className={styles.frame}>
      <nav className={styles.navigation} aria-label="Analítica" role="tablist" aria-orientation="vertical">
        {tabs.map((item, index) => <button key={item.id} id={`analytics-tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`analytics-panel-${item.id}`} onClick={() => selectTab(item.id)} onKeyDown={event => keyboard(event, index)}>{item.label}{item.id === 'gaps' && <span className={styles.count}>{inventory.gaps.length}</span>}</button>)}
        <div className={styles.navNote}><strong>Seguimiento web</strong><p>Google Analytics.<br />Publicidad fuera de este alcance.</p></div>
      </nav>
      <main className={styles.sheet}>
        <PromotionPreviewControls />
        <div className={styles.heading}><div><h1>{tabs.find(item => item.id === tab)?.label}</h1><p>{tab === 'overview' ? 'Visitantes, vistas y rebote del sitio, separados de la verificación del seguimiento.' : tab === 'accounts' ? 'Identificadores configurados y recursos revisados, sin mezclar cuentas anteriores.' : 'Comprobaciones concretas para confiar en el seguimiento.'}</p></div><span className={styles.preview}>Google Analytics · seguimiento web</span></div>
        <section id="analytics-panel-overview" role="tabpanel" aria-labelledby="analytics-tab-overview" hidden={tab !== 'overview'}>
          <GoogleSummary />
          <InsightsPanel days="28" />
          <div className={styles.sectionTitle}><h2>Cobertura del seguimiento</h2></div>
          <div className={styles.coverage}>
            <article><h3>Google Analytics</h3><dl><div><dt>Implementación</dt><dd>{inventory.events.length} eventos definidos</dd></div><div><dt>Destino</dt><dd>{inventory.events[0]?.destinations.ga4.configured ? 'Identificador configurado' : 'Sin identificador disponible'}</dd></div><div><dt>Configuración en la cuenta</dt><dd>Sin verificar</dd></div><div><dt>Recepción de eventos</dt><dd>Ver «Qué dicen los datos»</dd></div></dl><p>El resumen consulta la propiedad y el flujo web configurados. La lectura de informes no confirma por sí sola todos los ajustes del seguimiento.</p></article>
          </div>
          <div className={styles.sectionTitle}><h2>Siguiente comprobación</h2><button type="button" onClick={() => selectTab('gaps')}>Ver pendientes →</button></div>
          <p className={styles.notice}>Confirmar los recursos de producción y registrar evidencia de recepción. La presencia de un identificador no demuestra que el proveedor esté recibiendo eventos.</p>
          <div className={styles.policy}><span>Período máximo: 90 días</span><span>Consulta disponible cada 15 minutos</span><span>Recordatorio de revisión: 30 días</span></div>
        </section>
        <section id="analytics-panel-accounts" role="tabpanel" aria-labelledby="analytics-tab-accounts" hidden={tab !== 'accounts'}>
          <div className={styles.filters}><label>Proveedor<select value={provider} onChange={event => setProvider(event.target.value)}><option value="all">Todos</option><option value="ga4">Google Analytics</option></select></label><label>Clasificación<select value={classification} onChange={event => setClassification(event.target.value)}><option value="all">Todas</option>{Object.entries(classLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <p className={styles.caption}>{assets.length} recursos en esta vista · {inventory.discovery.scope}</p>
          {assets.length === 0 ? <div className={styles.empty}><h2>{inventory.assets.length ? 'No hay recursos con estos filtros' : 'No hay identificadores disponibles en este entorno'}</h2><p>{inventory.assets.length ? 'Cambia el proveedor o la clasificación para ver otros recursos.' : 'Las cuentas aparecerán al disponer de la configuración revisada. Esto no significa que no existan cuentas en Google o Meta.'}</p></div> : <div className={styles.tableWrap}><table><thead><tr><th>Recurso</th><th>Identificador</th><th>Clasificación</th><th>Responsable</th></tr></thead><tbody>{assets.map(asset => <tr key={asset.key}><td><strong>{asset.name}</strong><span>{providerLabel[asset.provider]}</span><a href={asset.consoleUrl} target="_blank" rel="noopener noreferrer">Abrir proveedor ↗</a></td><td><code>{asset.id}</code><span>{asset.idType === 'property' ? 'Propiedad' : asset.idType === 'measurement' ? 'ID de medición' : 'Pixel / conjunto de datos'}</span></td><td>{classLabels[asset.classification]}<span>{asset.reason}</span></td><td>{asset.owner ?? 'Por confirmar'}</td></tr>)}</tbody></table></div>}
          <details className={styles.details}><summary>Alcance y selección de recursos</summary><p>Solo los recursos de producción seleccionados explícitamente pueden alimentar informes. Las cuentas anteriores y excluidas se conservan como referencia, sin sumarlas a los resultados.</p><p>Descubrimiento: {inventory.discovery.complete ? 'Completo dentro del alcance indicado' : 'Incompleto / pendiente'} · {date(inventory.discovery.checkedAt)}</p></details>
        </section>
        <section id="analytics-panel-gaps" role="tabpanel" aria-labelledby="analytics-tab-gaps" hidden={tab !== 'gaps'}>
          <p className={styles.caption}>{inventory.gaps.length} comprobaciones pendientes · Las revisiones no modifican cuentas desde esta página.</p>
          {inventory.gaps.map(gap => <article key={gap.id} className={styles.gap}><h2>{gap.title}</h2><p>{gap.impact}</p><p><strong>Siguiente paso:</strong> {gap.nextAction}</p><div className={styles.gapMeta}><span>Responsable: {gap.owner ?? 'Por asignar'}</span><span>{date(gap.verifiedAt)}</span></div></article>)}
          <details className={styles.details}><summary>¿Qué significa revisar cada 30 días?</summary><p>La evidencia de configuración muestra un recordatorio después de 30 días. No expira la cuenta, no elimina datos y no detiene el seguimiento ni los informes. Si cambia el recurso o la configuración, la evidencia anterior deja de validar el estado actual.</p></details>
        </section>
      </main>
    </div>
  </div>;
}
