import type { TrafficInsights } from '../../lib/dashboard/traffic';
import styles from './AnalyticsDashboard.module.css';

export default function ServiceInterestTable({ rows }: { rows: TrafficInsights['serviceInterest'] }) {
  return <article className={styles.rank}>
    <h3 id="service-interest">Servicios elegidos en el cotizador</h3>
    <p className={styles.caption}>Cada sesión cuenta una vez por servicio elegido, aunque no se envíe una solicitud. Una sesión puede aparecer en varios servicios.</p>
    {rows == null ? <p className={styles.missing}>No disponible: no se pudo leer el desglose por servicio.</p>
      : !rows.length ? <p className={styles.missing}>No se observaron selecciones en este período.</p>
      : <table className={styles.serviceTable} aria-labelledby="service-interest"><thead><tr><th scope="col">Servicio</th><th scope="col">Sesiones</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.sessions.toLocaleString('es-MX')}</td></tr>)}</tbody></table>}
  </article>;
}
