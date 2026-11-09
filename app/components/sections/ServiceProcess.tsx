import styles from "./ServiceProcess.module.css";

type Stage = {
  title: string;
  timing: string;
  price: string;
  description: string;
};

export default function ServiceProcess({ stages }: { stages: readonly Stage[] }) {
  return <section id="proceso" className={`site-container section-space ${styles.process}`} aria-labelledby="service-process-title">
    <header className={styles.header}>
      <h2 id="service-process-title">El proceso</h2>
      <p>Tu siguiente paso, claro desde el inicio.</p>
    </header>
    <ol className={styles.steps}>
      {stages.map(stage => <li key={stage.title} className={styles.step}>
        <div className={styles.summary}>
          <h3>{stage.title}</h3>
          {stage.timing && <p className={styles.timing}>{stage.timing}</p>}
        </div>
        <div className={styles.content}>
          {stage.price && <p className={styles.price}>{stage.price}</p>}
          <p>{stage.description}</p>
        </div>
      </li>)}
    </ol>
  </section>;
}
