"use client";

import { useEffect, useState } from "react";

type Tab = "privacidad" | "cookies" | "terminos";

const HASH_TO_TAB: Record<string, Tab> = {
  "#privacidad": "privacidad",
  "#cookies": "cookies",
  "#terminos": "terminos",
};

interface TermsModalProps {
  open: boolean;
  onOpen?: () => void;
  onClose: () => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-bold text-xs uppercase tracking-wide mt-5 mb-1 text-primary">
      {children}
    </h3>
  );
}

function PrivacidadContent() {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      <div>
        <h2 className="text-lg font-black">AVISO DE PRIVACIDAD</h2>
        <p className="text-xs opacity-50 mt-0.5">
          CL CAMINO LEGAL&reg; &mdash; &Uacute;ltima actualizaci&oacute;n: abril de 2026
        </p>
      </div>

      <p>
        En cumplimiento con lo dispuesto por la Ley Federal de Protecci&oacute;n de Datos Personales
        en Posesi&oacute;n de los Particulares y dem&aacute;s disposiciones aplicables, la marca comercial
        CL CAMINO LEGAL&reg;, con sitio web caminolegal.com.mx, correo electr&oacute;nico{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>{" "}
        y tel&eacute;fono +52 999 250 5160, es responsable del tratamiento de sus datos personales.
      </p>

      <p>
        CL CAMINO LEGAL&reg; tratar&aacute; sus datos personales conforme a los principios de licitud,
        consentimiento, informaci&oacute;n, calidad, finalidad, lealtad, proporcionalidad y responsabilidad.
      </p>

      <SectionHeading>I. Datos Personales que Recabamos</SectionHeading>
      <p>Para las finalidades descritas en el presente Aviso de Privacidad, podremos recabar:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          <strong>Datos de identificaci&oacute;n:</strong> nombre completo, firma aut&oacute;grafa o
          electr&oacute;nica.
        </li>
        <li>
          <strong>Datos de contacto:</strong> correo electr&oacute;nico, tel&eacute;fono.
        </li>
        <li>
          <strong>Datos fiscales:</strong> RFC, r&eacute;gimen fiscal, constancia de situaci&oacute;n
          fiscal y domicilio fiscal.
        </li>
        <li>
          <strong>Datos necesarios para los servicios legales:</strong> informaci&oacute;n requerida
          para la elaboraci&oacute;n de documentos, asesor&iacute;as o gestiones.
        </li>
      </ul>
      <p>
        Los datos personales recabados podr&aacute;n variar dependiendo del tipo de servicio contratado
        por cada cliente. CL CAMINO LEGAL&reg; no recaba datos personales sensibles.
      </p>

      <SectionHeading>II. Finalidades del Tratamiento</SectionHeading>
      <p>Los datos personales ser&aacute;n utilizados para las siguientes finalidades primarias:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>Brindar servicios legales y acompa&ntilde;amiento.</li>
        <li>Elaboraci&oacute;n de documentos legales.</li>
        <li>Asesor&iacute;a y seguimiento de procesos.</li>
        <li>Facturaci&oacute;n y cumplimiento de obligaciones fiscales.</li>
        <li>Procesamiento de pagos a trav&eacute;s de plataformas externas.</li>
        <li>Comunicaci&oacute;n relacionada con los servicios contratados.</li>
      </ul>
      <p>Las finalidades aplicables depender&aacute;n del tipo de servicio contratado en cada caso.</p>
      <p>De manera adicional, sus datos podr&aacute;n ser utilizados para:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          Env&iacute;o de informaci&oacute;n sobre servicios, actualizaciones o contenido legal relevante.
        </li>
        <li>Mejora de la experiencia del usuario.</li>
      </ul>
      <p>
        Si no desea que sus datos sean utilizados para estas finalidades secundarias, podr&aacute;
        solicitarlo enviando un correo a{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
        .
      </p>

      <SectionHeading>III. Transferencias de Datos Personales</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; podr&aacute; transferir sus datos personales sin requerir consentimiento
        en los casos previstos por la ley, incluyendo:
      </p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>Autoridades cuando exista obligaci&oacute;n legal.</li>
        <li>
          Proveedores tecnol&oacute;gicos necesarios para la operaci&oacute;n del sitio o la
          prestaci&oacute;n de servicios.
        </li>
        <li>
          Plataformas de pago, &uacute;nicamente cuando sea necesario para procesar transacciones.
        </li>
      </ul>
      <p>
        CL CAMINO LEGAL&reg; presta servicios dentro de M&eacute;xico y no vende ni comercializa datos
        personales.
      </p>

      <SectionHeading>IV. Derechos ARCO</SectionHeading>
      <p>
        Usted tiene derecho a acceder a sus datos personales, rectificarlos si son inexactos o
        incompletos, cancelarlos cuando considere que no son necesarios para las finalidades
        se&ntilde;aladas, u oponerse a su tratamiento para fines espec&iacute;ficos.
      </p>
      <p>
        Para ejercer sus derechos ARCO deber&aacute; enviar una solicitud al correo
        electr&oacute;nico{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
        , incluyendo su nombre completo, medio para comunicarle la respuesta, descripci&oacute;n
        clara del derecho que desea ejercer e identificaci&oacute;n oficial vigente.
      </p>
      <p>
        CL CAMINO LEGAL&reg; dar&aacute; respuesta en un plazo m&aacute;ximo de 20 d&iacute;as
        h&aacute;biles conforme a la legislaci&oacute;n aplicable.
      </p>

      <SectionHeading>V. Revocaci&oacute;n del Consentimiento</SectionHeading>
      <p>
        Usted podr&aacute; revocar el consentimiento otorgado para el tratamiento de sus datos
        personales enviando una solicitud al correo{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
        .
      </p>
      <p>
        No obstante, la revocaci&oacute;n no proceder&aacute; cuando exista obligaci&oacute;n legal
        de conservar la informaci&oacute;n, cuando sea necesaria para el cumplimiento de obligaciones
        contractuales vigentes o no tendr&aacute; efectos retroactivos.
      </p>

      <SectionHeading>VI. Limitaci&oacute;n del Uso o Divulgaci&oacute;n</SectionHeading>
      <p>
        Usted podr&aacute; solicitar la limitaci&oacute;n del uso o divulgaci&oacute;n de sus datos
        personales enviando un correo electr&oacute;nico a{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
        .
      </p>

      <SectionHeading>VII. Medidas de Seguridad</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; implementa medidas administrativas, t&eacute;cnicas y f&iacute;sicas
        razonables para proteger sus datos personales contra da&ntilde;o, p&eacute;rdida,
        alteraci&oacute;n, destrucci&oacute;n o uso no autorizado.
      </p>

      <SectionHeading>VIII. Uso de Cookies</SectionHeading>
      <p>
        El sitio web puede utilizar cookies y tecnolog&iacute;as similares para mejorar la experiencia
        del usuario. Puede configurar su navegador para rechazarlas; sin embargo, algunas
        funcionalidades podr&iacute;an no operar correctamente.
      </p>

      <SectionHeading>IX. Modificaciones</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; podr&aacute; modificar el presente Aviso de Privacidad en cualquier
        momento. Las actualizaciones estar&aacute;n disponibles en caminolegal.com.mx.
      </p>

      <SectionHeading>X. Contacto</SectionHeading>
      <p>
        <strong>Responsable:</strong> Luisa Camila Caballero V&aacute;zquez
      </p>
      <p>
        <strong>Correo electr&oacute;nico:</strong>{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
      </p>
      <p>
        <strong>Tel&eacute;fono:</strong> +52 999 250 5160
      </p>
    </div>
  );
}

function CookiesContent() {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      <div>
        <h2 className="text-lg font-black">AVISO DE COOKIES</h2>
      </div>

      <p>
        Este Aviso de uso de Cookies es parte de nuestro Aviso de Privacidad. Nuestro sitio web
        (caminolegal.com.mx) utiliza las cookies para poder identificar las p&aacute;ginas que son
        visitadas y su frecuencia. Esta informaci&oacute;n es empleada &uacute;nicamente para
        an&aacute;lisis estad&iacute;stico y despu&eacute;s la informaci&oacute;n se elimina de
        forma permanente.
      </p>

      <p>
        Usted puede eliminar las cookies en cualquier momento desde su ordenador, sin embargo, las
        cookies ayudan a proporcionar un mejor servicio de los sitios web, &eacute;stas no dan acceso
        a la informaci&oacute;n de su ordenador ni de usted, a menos de que usted as&iacute; lo quiera
        y la proporcione directamente, visitas a una web.
      </p>

      <p>
        Usted puede aceptar o negar el uso de cookies, sin embargo, la mayor&iacute;a de los
        navegadores aceptan cookies de forma autom&aacute;tica pues sirve para tener un mejor
        servicio web. Usted de igual forma puede optar por cambiar la configuraci&oacute;n de su
        ordenador para declinar las cookies.
      </p>

      <p>
        Las Cookies son archivo de datos que se almacena en el disco duro del equipo de
        c&oacute;mputo o del dispositivo de comunicaciones electr&oacute;nicas de un usuario al
        navegar en un sitio de internet espec&iacute;fico, el cual permite intercambiar
        informaci&oacute;n de estado entre dicho sitio y el navegador del usuario. La
        informaci&oacute;n de estado puede revelar medios de identificaci&oacute;n de
        sesi&oacute;n, autenticaci&oacute;n o preferencias del usuario, as&iacute; como cualquier
        dato almacenado por el navegador respecto al sitio de internet.
      </p>

      <p className="text-xs opacity-50">
        Lo anterior en t&eacute;rminos del art&iacute;culo 14, &uacute;ltimo p&aacute;rrafo del
        Reglamento de la Ley Federal de Protecci&oacute;n de Datos Personales en Posesi&oacute;n de
        Particulares (LFPDPPP).
      </p>
    </div>
  );
}

function TerminosContent() {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed">
      <div>
        <h2 className="text-lg font-black">T&Eacute;RMINOS Y CONDICIONES</h2>
        <p className="text-xs opacity-50 mt-0.5">
          CL CAMINO LEGAL&reg; &mdash; &Uacute;ltima actualizaci&oacute;n: abril de 2026
        </p>
      </div>

      <p>
        Estos T&eacute;rminos y Condiciones regulan el uso del sitio web caminolegal.com.mx (en
        adelante, el &#8220;Sitio&#8221;) y la contrataci&oacute;n de servicios ofrecidos por CL
        CAMINO LEGAL&reg;.
      </p>
      <p>
        Al acceder, navegar o contratar cualquier servicio, la persona usuaria acepta estos
        T&eacute;rminos y Condiciones en su totalidad.
      </p>

      <SectionHeading>1. Capacidad Legal</SectionHeading>
      <p>
        Los servicios est&aacute;n dirigidos a personas mayores de edad con capacidad legal suficiente
        para contratar conforme a la legislaci&oacute;n mexicana.
      </p>

      <SectionHeading>2. Uso del Sitio</SectionHeading>
      <p>
        La persona usuaria se compromete a utilizar el Sitio de forma adecuada, sin contravenir la
        ley, los derechos de terceros o el correcto funcionamiento del mismo.
      </p>
      <p>Queda prohibido:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>Usar el sitio con fines il&iacute;citos.</li>
        <li>Intentar acceder sin autorizaci&oacute;n a sistemas o informaci&oacute;n.</li>
        <li>Reproducir o utilizar contenido sin autorizaci&oacute;n.</li>
      </ul>
      <p>El uso del Sitio se realiza bajo la responsabilidad de la persona usuaria.</p>

      <SectionHeading>3. Naturaleza de los Servicios</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; brinda servicios legales y acompa&ntilde;amiento en materia de
        propiedad intelectual, civil, mercantil, notarial y &aacute;reas relacionadas.
      </p>
      <p>
        Los servicios se prestan conforme a la legislaci&oacute;n mexicana aplicable, incluyendo, de
        manera enunciativa mas no limitativa, la Ley Federal de Protecci&oacute;n a la Propiedad
        Industrial, la Ley Federal del Derecho de Autor, el C&oacute;digo Civil, el C&oacute;digo
        de Comercio y dem&aacute;s disposiciones aplicables.
      </p>
      <p>
        El contenido disponible en el Sitio tiene fines informativos y no constituye asesor&iacute;a
        legal personalizada.
      </p>

      <SectionHeading>4. Alcance del Servicio</SectionHeading>
      <p>El alcance de cada servicio depender&aacute; de lo contratado en cada caso.</p>
      <p>
        La persona cliente reconoce que cada servicio es personalizado y puede variar seg&uacute;n
        las caracter&iacute;sticas de su caso y la informaci&oacute;n proporcionada.
      </p>
      <p>
        Asimismo, es responsabilidad de la persona cliente proporcionar informaci&oacute;n completa
        y oportuna para el adecuado desarrollo del servicio.
      </p>

      <SectionHeading>5. Garant&iacute;a de Resultados</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; no garantiza resultados espec&iacute;ficos en los servicios prestados.
        Los servicios consisten en el an&aacute;lisis del caso, la elaboraci&oacute;n de estrategias
        y la gesti&oacute;n correspondiente conforme a la legislaci&oacute;n aplicable; no obstante,
        los resultados, resoluciones o respuestas pueden depender de factores externos y de las
        particularidades de cada asunto.
      </p>
      <p>
        El pago corresponde a la prestaci&oacute;n del servicio profesional y no a la
        obtenci&oacute;n de un resultado determinado.
      </p>

      <SectionHeading>6. Validez de Cotizaciones</SectionHeading>
      <p>
        Las cotizaciones tienen una vigencia de 30 d&iacute;as naturales a partir de su
        emisi&oacute;n.
      </p>
      <p>
        Su aceptaci&oacute;n implica la conformidad con los presentes T&eacute;rminos y Condiciones
        y el Aviso de Privacidad disponible en caminolegal.com.mx.
      </p>

      <SectionHeading>7. Tiempos de Entrega</SectionHeading>
      <p>
        Los tiempos de entrega son estimados y podr&aacute;n variar seg&uacute;n el servicio
        contratado, la complejidad del caso, la informaci&oacute;n proporcionada y factores externos.
      </p>
      <p>De manera referencial, algunos servicios pueden tomar:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>Registro de marca: hasta 6 meses.</li>
        <li>Registro de obra: hasta 2 meses.</li>
        <li>Elaboraci&oacute;n de contratos y documentos legales: hasta 1 mes.</li>
      </ul>
      <p>
        Los plazos comenzar&aacute;n a contar a partir de que se haya recibido la
        informaci&oacute;n completa requerida y se confirme el pago correspondiente.
      </p>

      <SectionHeading>8. Asesor&iacute;as</SectionHeading>
      <p>
        Las asesor&iacute;as deber&aacute;n ser previamente agendadas y, en su caso, pagadas
        conforme al servicio contratado. Su contenido y alcance se ajustar&aacute;n a las
        necesidades del caso y a la informaci&oacute;n disponible al momento de la consulta.
      </p>
      <p>
        En caso de inasistencia o cancelaci&oacute;n sin previo aviso, la asesor&iacute;a
        podr&aacute; considerarse como prestada.
      </p>

      <SectionHeading>9. Veracidad de la Informaci&oacute;n</SectionHeading>
      <p>
        Toda la informaci&oacute;n proporcionada por la persona cliente debe ser veraz, completa y
        actualizada.
      </p>
      <p>
        CL CAMINO LEGAL&reg; no ser&aacute; responsable por errores u omisiones derivados de
        informaci&oacute;n incorrecta, incompleta o no actualizada proporcionada por la persona
        cliente para su revisi&oacute;n.
      </p>

      <SectionHeading>10. Confidencialidad</SectionHeading>
      <p>
        Toda la informaci&oacute;n proporcionada ser&aacute; tratada de forma confidencial y
        utilizada exclusivamente para los fines del servicio contratado, de conformidad con el aviso
        de privacidad.
      </p>

      <SectionHeading>11. Condiciones de Pago</SectionHeading>
      <p>El servicio iniciar&aacute; una vez confirmado el pago correspondiente.</p>
      <p>
        Dependiendo del tipo de servicio, podr&aacute; acordarse un esquema de pago en una o varias
        exhibiciones, el cual se definir&aacute; al momento de la contrataci&oacute;n.
      </p>
      <p>En caso de pagos en parcialidades:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          El avance del servicio estar&aacute; sujeto al cumplimiento oportuno de cada pago.
        </li>
        <li>
          CL CAMINO LEGAL&reg; podr&aacute; pausar o reprogramar el servicio en caso de falta de
          pago.
        </li>
      </ul>
      <p>
        Los pagos realizados no son reembolsables una vez iniciado el servicio. Si la persona cliente
        decide no continuar, podr&aacute; evaluarse una devoluci&oacute;n &uacute;nicamente respecto
        de las partes del servicio que no hayan sido ejecutadas, considerando el avance del mismo.
      </p>

      <SectionHeading>12. Abandono del Servicio</SectionHeading>
      <p>
        La falta de entrega de informaci&oacute;n, documentaci&oacute;n o respuesta dentro de un
        plazo razonable podr&aacute; considerarse como abandono del servicio por parte de la persona
        cliente, sin derecho a reembolso.
      </p>

      <SectionHeading>13. Responsabilidad del Cliente</SectionHeading>
      <p>
        Las decisiones tomadas por la persona cliente con base en la informaci&oacute;n, documentos
        o asesor&iacute;a proporcionada son su responsabilidad.
      </p>
      <p>
        Previo a la presentaci&oacute;n de solicitudes, realizaci&oacute;n de tr&aacute;mites o
        entrega de documentos finales, CL CAMINO LEGAL&reg; podr&aacute; compartir la
        informaci&oacute;n o documentaci&oacute;n con la persona cliente para su revisi&oacute;n.
      </p>
      <p>
        La persona cliente es responsable de validar y confirmar que la informaci&oacute;n es veraz,
        completa y que est&aacute; de acuerdo con su contenido. Una vez validada la
        informaci&oacute;n, cualquier consecuencia derivada de la misma ser&aacute; responsabilidad
        de la persona cliente.
      </p>

      <SectionHeading>14. Limitaci&oacute;n de Responsabilidad</SectionHeading>
      <p>
        La responsabilidad de CL CAMINO LEGAL&reg;, en caso de proceder legalmente,
        estar&aacute; limitada al monto efectivamente pagado por el servicio contratado.
      </p>
      <p>CL CAMINO LEGAL&reg; no ser&aacute; responsable por:</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          Resoluciones, respuestas, requerimientos o cualquier actuaci&oacute;n de autoridades.
        </li>
        <li>
          Retrasos, cambios o incidencias en tr&aacute;mites que dependan de autoridades o terceros.
        </li>
        <li>
          Informaci&oacute;n incompleta, incorrecta o no actualizada proporcionada por la persona
          cliente.
        </li>
        <li>
          Retrasos, fallas o servicios atribuibles a terceros, incluyendo plataformas o proveedores
          externos.
        </li>
        <li>
          El uso, interpretaci&oacute;n o aplicaci&oacute;n de documentos por parte de la persona
          cliente.
        </li>
      </ul>
      <p>
        Previo a la presentaci&oacute;n de solicitudes, tr&aacute;mites o entrega de documentos
        finales, CL CAMINO LEGAL&reg; podr&aacute; compartir la informaci&oacute;n o
        documentaci&oacute;n con la persona cliente para su revisi&oacute;n.
      </p>

      <SectionHeading>15. Servicios en M&eacute;xico</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; presta servicios conforme a la legislaci&oacute;n mexicana y no ofrece
        servicios legales en otras jurisdicciones.
      </p>

      <SectionHeading>16. Servicios Adicionales</SectionHeading>
      <p>Cualquier servicio no contemplado inicialmente ser&aacute; cotizado por separado.</p>
      <p>
        En caso de existir m&aacute;s de una persona titular en un registro, podr&aacute; requerirse
        la elaboraci&oacute;n de un acuerdo de &#8220;Reglas de Uso&#8221;, el cual se ofrece como
        servicio adicional.
      </p>

      <SectionHeading>17. Propiedad Intelectual</SectionHeading>
      <p>
        El contenido del Sitio y los documentos generados son propiedad de CL CAMINO LEGAL&reg;
        y/o se proporcionan para uso del cliente dentro del servicio contratado.
      </p>

      <SectionHeading>18. Modificaciones</SectionHeading>
      <p>
        CL CAMINO LEGAL&reg; podr&aacute; actualizar estos T&eacute;rminos y Condiciones en
        cualquier momento. Las modificaciones estar&aacute;n disponibles en el Sitio.
      </p>

      <SectionHeading>19. Ley Aplicable</SectionHeading>
      <p>
        Estos T&eacute;rminos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos.
      </p>

      <SectionHeading>20. Contacto</SectionHeading>
      <p>CL CAMINO LEGAL&reg;</p>
      <p>
        <strong>Correo:</strong>{" "}
        <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
          info@caminolegal.com.mx
        </a>
      </p>
      <p>
        <strong>Tel&eacute;fono:</strong> +52 999 250 5160
      </p>
      <p>
        <strong>Sitio web:</strong> caminolegal.com.mx
      </p>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "privacidad", label: "Aviso de Privacidad" },
  { id: "cookies", label: "Aviso de Cookies" },
  { id: "terminos", label: "T\u00e9rminos y Condiciones" },
];

export default function TermsModal({ open, onOpen, onClose }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("privacidad");

  useEffect(() => {
    const syncFromHash = () => {
      const tab = HASH_TO_TAB[window.location.hash];
      if (tab) {
        setActiveTab(tab);
        onOpen?.();
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [onOpen]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  const handleClose = () => {
    if (HASH_TO_TAB[window.location.hash]) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-xl bg-background text-foreground shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tab bar */}
        <div className="flex-none border-b border-foreground/10 px-6 pt-6 pr-12 md:px-8 md:pt-6 md:pr-14">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/40 hover:text-foreground/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-foreground/50 hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === "privacidad" && <PrivacidadContent />}
          {activeTab === "cookies" && <CookiesContent />}
          {activeTab === "terminos" && <TerminosContent />}
        </div>
      </div>
    </div>
  );
}
