"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The admin/public boundary deliberately starts a fresh document to isolate marketing SDKs. */

import { useState, type KeyboardEvent } from 'react';
import type { DashboardInventory, EvidenceView, EventCoverage, AssetClass } from '../../lib/dashboard/contracts';
import styles from './AnalyticsDashboard.module.css';
import GoogleSummary from './GoogleSummary';

const tabs = [{ id: 'overview', label: 'Resumen' }, { id: 'accounts', label: 'Cuentas registradas' }, { id: 'events', label: 'Eventos y conversiones' }, { id: 'gaps', label: 'Pendientes de seguimiento' }] as const;
type Tab = (typeof tabs)[number]['id'];
const evidenceLabels: Record<EvidenceView['status'], string> = { verified: 'Verificado', unknown: 'Sin verificar', needs_recheck: 'Revisar de nuevo', inapplicable: 'Evidencia anterior', not_applicable: 'No aplica' };
const classLabels: Record<AssetClass, string> = { active: 'Activo', legacy: 'Anterior', excluded: 'Excluido', unclassified: 'Por clasificar' };
const providerLabel = { ga4: 'Google Analytics', meta: 'Meta' };
function date(value: string | null) {
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(timestamp) : 'Sin fecha de verificación válida';
}
function Evidence({ claim }: { claim: EvidenceView }) { return <span className={styles.evidence} data-state={claim.status}>{evidenceLabels[claim.status]}</span>; }

export default function AnalyticsDashboard({ inventory }: { inventory: DashboardInventory }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const [classification, setClassification] = useState('all');
  const [selected, setSelected] = useState<EventCoverage | null>(null);
  const assets = inventory.assets.filter(asset => (provider === 'all' || asset.provider === provider) && (classification === 'all' || asset.classification === classification));
  const events = inventory.events.filter(event => `${event.name} ${event.label}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  function selectTab(id: Tab) { setTab(id); setSelected(null); }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next].id); document.getElementById(`analytics-tab-${tabs[next].id}`)?.focus();
  }
  return <div className={styles.app}>
    <header className={styles.topbar}><a href="/" className={styles.brand}>camino legal<span>®</span></a><span>Analítica del sitio</span><a href="/" className={styles.returnLink}>Volver al sitio ↗</a></header>
    <div className={styles.frame}>
      <nav className={styles.navigation} aria-label="Analítica" role="tablist" aria-orientation="vertical">
        {tabs.map((item, index) => <button key={item.id} id={`analytics-tab-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`analytics-panel-${item.id}`} onClick={() => selectTab(item.id)} onKeyDown={event => keyboard(event, index)}>{item.label}{item.id === 'gaps' && <span className={styles.count}>{inventory.gaps.length}</span>}</button>)}
        <div className={styles.navNote}><strong>Seguimiento web</strong><p>Google Analytics y Meta.<br />Publicidad fuera de este alcance.</p></div>
      </nav>
      <main className={styles.sheet}>
        <div className={styles.heading}><div><h1>{tabs.find(item => item.id === tab)?.label}</h1><p>{tab === 'overview' ? 'Visitantes, vistas y rebote del sitio, separados de la verificación del seguimiento.' : tab === 'accounts' ? 'Identificadores configurados y recursos revisados, sin mezclar cuentas anteriores.' : tab === 'events' ? 'Acciones del visitante y la evidencia de cada destino.' : 'Comprobaciones concretas para confiar en el seguimiento.'}</p></div><span className={styles.preview}>Google Analytics · seguimiento web</span></div>
        <section id="analytics-panel-overview" role="tabpanel" aria-labelledby="analytics-tab-overview" hidden={tab !== 'overview'}>
          <GoogleSummary />
          <div className={styles.sectionTitle}><h2>Cobertura del seguimiento</h2><button type="button" onClick={() => selectTab('events')}>Ver los {inventory.events.length} eventos →</button></div>
          <div className={styles.coverage}>
            <article><h3>Google Analytics</h3><dl><div><dt>Implementación</dt><dd>{inventory.events.length} eventos definidos</dd></div><div><dt>Destino</dt><dd>{inventory.events[0]?.destinations.ga4.configured ? 'Identificador configurado' : 'Sin identificador disponible'}</dd></div><div><dt>Configuración en la cuenta</dt><dd>Sin verificar</dd></div><div><dt>Recepción de eventos</dt><dd>Sin verificar</dd></div></dl><p>El resumen consulta la propiedad y el flujo web configurados. La lectura de informes no confirma por sí sola todos los ajustes del seguimiento.</p></article>
            <article><h3>Meta</h3><dl><div><dt>Implementación</dt><dd>PageView, Lead y Contact</dd></div><div><dt>Destino</dt><dd>{inventory.events[0]?.destinations.meta.configured ? 'Identificador configurado' : 'Sin identificador disponible'}</dd></div><div><dt>Configuración en la cuenta</dt><dd>Sin verificar</dd></div><div><dt>Recepción de eventos</dt><dd>Sin verificar</dd></div></dl><p>La disponibilidad de métricas web se verifica por cuenta. Contact agrupa varias intenciones de contacto.</p></article>
          </div>
          <div className={styles.sectionTitle}><h2>Siguiente comprobación</h2><button type="button" onClick={() => selectTab('gaps')}>Ver pendientes →</button></div>
          <p className={styles.notice}>Confirmar los recursos de producción y registrar evidencia de recepción. La presencia de un identificador no demuestra que el proveedor esté recibiendo eventos.</p>
          <div className={styles.policy}><span>Período máximo: 90 días</span><span>Consulta disponible cada 15 minutos</span><span>Recordatorio de revisión: 30 días</span></div>
        </section>
        <section id="analytics-panel-accounts" role="tabpanel" aria-labelledby="analytics-tab-accounts" hidden={tab !== 'accounts'}>
          <div className={styles.filters}><label>Proveedor<select value={provider} onChange={event => setProvider(event.target.value)}><option value="all">Todos</option><option value="ga4">Google Analytics</option><option value="meta">Meta</option></select></label><label>Clasificación<select value={classification} onChange={event => setClassification(event.target.value)}><option value="all">Todas</option>{Object.entries(classLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <p className={styles.caption}>{assets.length} recursos en esta vista · {inventory.discovery.scope}</p>
          {assets.length === 0 ? <div className={styles.empty}><h2>{inventory.assets.length ? 'No hay recursos con estos filtros' : 'No hay identificadores disponibles en este entorno'}</h2><p>{inventory.assets.length ? 'Cambia el proveedor o la clasificación para ver otros recursos.' : 'Las cuentas aparecerán al disponer de la configuración revisada. Esto no significa que no existan cuentas en Google o Meta.'}</p></div> : <div className={styles.tableWrap}><table><thead><tr><th>Recurso</th><th>Identificador</th><th>Clasificación</th><th>Responsable</th></tr></thead><tbody>{assets.map(asset => <tr key={asset.key}><td><strong>{asset.name}</strong><span>{providerLabel[asset.provider]}</span><a href={asset.consoleUrl} target="_blank" rel="noopener noreferrer">Abrir proveedor ↗</a></td><td><code>{asset.id}</code><span>{asset.idType === 'property' ? 'Propiedad' : asset.idType === 'measurement' ? 'ID de medición' : 'Pixel / conjunto de datos'}</span></td><td>{classLabels[asset.classification]}<span>{asset.reason}</span></td><td>{asset.owner ?? 'Por confirmar'}</td></tr>)}</tbody></table></div>}
          <details className={styles.details}><summary>Alcance y selección de recursos</summary><p>Solo los recursos de producción seleccionados explícitamente pueden alimentar informes. Las cuentas anteriores y excluidas se conservan como referencia, sin sumarlas a los resultados.</p><p>Descubrimiento: {inventory.discovery.complete ? 'Completo dentro del alcance indicado' : 'Incompleto / pendiente'} · {date(inventory.discovery.checkedAt)}</p></details>
        </section>
        <section id="analytics-panel-events" role="tabpanel" aria-labelledby="analytics-tab-events" hidden={tab !== 'events'}>
          <div className={styles.filters}><label>Buscar una acción o evento<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Por ejemplo: cotización" /></label><p aria-live="polite">{events.length} de {inventory.events.length} eventos</p></div>
          <div className={styles.tableWrap}><table><thead><tr><th>Acción del visitante</th><th>Google</th><th>Meta</th><th>Detalle</th></tr></thead><tbody>{events.map(event => <tr key={event.name}><td><strong>{event.label}</strong><code>{event.name}</code><span>{event.category === 'lead' ? 'Solicitud aceptada' : event.category === 'intent' ? 'Intención de contacto' : 'Interacción'}</span></td><td><Evidence claim={event.destinations.ga4.observation} /><span>{event.registrationRequired ? 'Evento clave: ' + evidenceLabels[event.destinations.ga4.registration.status] : 'Evento sin registro especial requerido'}</span></td><td>{event.meta ?? 'No aplica'}<span>{event.meta === 'Contact' ? 'Medida compartida; no es un conteo por acción' : event.meta ? evidenceLabels[event.destinations.meta.observation.status] : 'No se envía a este proveedor'}</span></td><td><button type="button" aria-expanded={selected?.name === event.name} onClick={() => { setSelected(selected?.name === event.name ? null : event); }}>Ver detalle<span className={styles.srOnly}> de {event.label}</span></button></td></tr>)}</tbody></table></div>
          {events.length === 0 && <p className={styles.empty}>No hay eventos con ese nombre.</p>}
          {selected && <aside className={styles.eventDetail} aria-live="polite"><div className={styles.sectionTitle}><h2>{selected.label}</h2><button type="button" onClick={() => setSelected(null)}>Cerrar detalle</button></div><p>{selected.trigger}</p><p className={styles.caption}>{selected.scope} · {selected.name}</p><div className={styles.evidenceGrid}><div><strong>Implementado</strong><p>Sí, en el sitio</p></div><div><strong>Destino Google configurado</strong><p>{selected.destinations.ga4.configured ? 'Identificador disponible' : 'Sin identificar'}</p></div><div><strong>Registro como evento clave</strong><Evidence claim={selected.destinations.ga4.registration} /></div><div><strong>Observado por Google</strong><Evidence claim={selected.destinations.ga4.observation} /></div></div><p className={styles.caption}>{date(selected.destinations.ga4.observation.verifiedAt)} · Fuente: {selected.destinations.ga4.observation.source ?? 'Sin evidencia registrada'}</p>{selected.meta === 'Contact' && <p>Meta Contact agrupa WhatsApp, correo y solicitud de cotización. Su total no puede asignarse a cada acción sin evidencia adicional.</p>}</aside>}
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
