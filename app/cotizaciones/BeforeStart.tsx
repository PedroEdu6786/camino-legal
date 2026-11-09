import styles from "./BeforeStart.module.css";

export default function BeforeStart() {
  return (
    <section
      data-analytics-section="before_start"
      aria-labelledby="before-start-title"
      className={`site-container ${styles.section}`}
    >
      <header className={styles.heading}>
        <h2 id="before-start-title">Antes de comenzar</h2>
        <p>Lo esencial sobre tu factura, los gastos y el alcance.</p>
      </header>

      <div className={styles.guide}>
        <article className={styles.invoice} aria-labelledby="invoice-title">
          <h3 id="invoice-title">Tu factura</h3>
          <p className={styles.deadline}>5 días hábiles</p>
          <p>
            Solicítala dentro de los cinco días hábiles posteriores al pago y
            <strong> antes del cierre de mes.</strong>
          </p>
          <p className={styles.tax}>Todos los importes incluyen IVA.</p>
        </article>

        <div className={styles.conditions}>
          <article className={styles.expenses} aria-labelledby="expenses-title">
            <h3 id="expenses-title">Gastos adicionales</h3>
            <dl className={styles.breakdown}>
              <div>
                <dt>Incluido</dt>
                <dd>La atención y el seguimiento del trámite de registro.</dd>
              </div>
              <div>
                <dt>No incluido</dt>
                <dd>
                  Cargos por requerimientos, multas o recargos que emita el IMPI.
                  Se revisan según el caso.
                </dd>
              </div>
            </dl>
          </article>

          <article className={styles.scope} aria-labelledby="scope-title">
            <h3 id="scope-title">Alcance por escrito</h3>
            <p>
              <strong>Revisa qué incluye tu cotización</strong> y sus gastos
              adicionales. Para otros servicios o necesidades adicionales,
              prepararemos una propuesta según tu proyecto.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
