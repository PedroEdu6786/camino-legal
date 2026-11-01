import Image from "next/image";
import TrademarkRoute from "./TrademarkRoute";

const stages = [
  {
    title: "¡Tu solicitud está en camino!",
    image: "/stickers/Recurso 80.png",
    timing: "El punto de partida",
    description: "Recibes el acuse con tu número de expediente y la fecha de presentación. Esa fecha determina el orden de prioridad frente a otras solicitudes.",
  },
  {
    title: "Tu marca sale a la luz",
    image: "/stickers/Recurso 94.png",
    timing: "Publicación: hasta 10 días desde la recepción · Oposición: 1 mes",
    description: "El IMPI publica la solicitud en la Gaceta. Desde que la publicación surte efectos, otras personas tienen un mes para oponerse. Si ocurre, te avisamos y revisamos la respuesta contigo.",
  },
  {
    title: "Una revisión a fondo",
    image: "/stickers/Recurso 91.png",
    timing: "Examen de forma y de fondo",
    description: "Primero revisa los datos y documentos; después, si tu marca puede registrarse. Para valorar posibles confusiones con otras marcas, compara cómo suenan, cómo se ven y qué idea transmiten.",
  },
  {
    title: "¿Un oficio? Lo vemos contigo.",
    image: "/stickers/Recurso 95.png",
    timing: "Solo si el IMPI emite un oficio",
    description: "Un oficio pide aclaraciones o comunica un posible impedimento; no es una negativa. Hay dos meses para responder y dos adicionales con el pago correspondiente. Revisamos contigo los argumentos, documentos y cualquier costo adicional antes de actuar.",
  },
  {
    title: "La decisión del IMPI",
    image: "/stickers/Recurso 81.png",
    timing: "Concesión o negativa",
    description: "Si el IMPI concede el registro, recibes tu título. Si lo niega, revisamos las opciones para defender o replantear tu marca. Presentar una solicitud no garantiza que se conceda.",
  },
];

export default function TrademarkJourney() {
  return (
    <section data-analytics-section="trademark.route" id="ruta-de-tu-marca" aria-labelledby="trademark-journey-title" className="site-container section-space trademark-journey">
      <div className="trademark-journey-heading" data-reveal>
        <p className="hand-note">De la primera idea al ®</p>
        <h2 id="trademark-journey-title">La ruta de tu marca</h2>
        <p>Antes de presentar la solicitud, evaluamos la viabilidad de tu marca y preparamos los documentos. Una vez en el IMPI, este es el camino.</p>
      </div>
      <TrademarkRoute>
        {stages.map((stage, index) => (
          <li key={stage.title}>
            <span className="trademark-step" aria-hidden="true">Paso {String(index + 1).padStart(2, "0")}</span>
            <div data-analytics-step={String(index + 1).padStart(2, "0")} className="trademark-stage-copy">
              <p className="trademark-timing">{stage.timing}</p>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </div>
            <div className="trademark-stage-art" aria-hidden="true">
              <Image src={stage.image} alt="" width={200} height={200} />
              <span className="hand-note">{["¡Aquí empieza!", "Que se conozca", "Con lupa y calma", "Paso a paso", "Un nuevo comienzo"][index]}</span>
            </div>
          </li>
        ))}
      </TrademarkRoute>
      <div data-analytics-section="trademark.milestones" className="trademark-aftercare" data-reveal>
        <div className="trademark-aftercare-heading"><span className="trademark-registered" aria-hidden="true">®</span><div><p className="hand-note">La ruta no termina aquí.</p><h3>Tu marca tiene futuro.<br />Vamos a cuidarlo.</h3></div></div>
        <dl className="trademark-milestones">
          <div><dt>10 años</dt><dd>De vigencia desde que se concede el registro.</dd></div>
          <div><dt>Año 3</dt><dd>Declara el uso dentro de los tres meses posteriores al tercer aniversario del registro.</dd></div>
          <div><dt>Renovación</dt><dd>Solicítala en los seis meses anteriores al vencimiento o en los seis meses posteriores.</dd></div>
        </dl>
        <p className="fine-print">La declaración de uso, la renovación y las acciones de defensa se cotizan por separado.</p>
      </div>
      <div className="trademark-owner-note" data-reveal>
        <p className="hand-note">Tú también eres parte del camino.</p>
        <h3>De tu lado, tres cosas</h3>
        <ul className="trademark-owner-tips"><li><strong>Mantente cerca.</strong> Revisa tu correo y WhatsApp, responde a nuestras solicitudes y avísanos si encuentras una marca parecida.</li><li><strong>Guarda su historia.</strong> Conserva pruebas de uso con fecha: facturas, publicaciones, empaques o fotos.</li><li><strong>Usa tu marca con cuidado.</strong> Tal como fue solicitada; reserva el símbolo ® o M.R. para cuando tengas el registro.</li></ul>
      </div>
      <p className="fine-print trademark-legal-note">Los tiempos entre etapas pueden variar. Si hay un oficio, te indicaremos la fecha límite aplicable; dejarlo sin respuesta puede causar el abandono de la solicitud. Referencia: <a data-analytics-event="outbound_reference_click" data-analytics-action="trademark.law" data-analytics-source="trademark_journey" data-analytics-destination="trademark_law" href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPPI.pdf" target="_blank" rel="noopener noreferrer" aria-label="Ley Federal de Protección a la Propiedad Industrial (abre en otra pestaña)">Ley Federal de Protección a la Propiedad Industrial</a>.</p>
    </section>
  );
}
