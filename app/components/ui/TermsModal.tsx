"use client";

import { useEffect } from "react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background text-foreground p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-foreground/50 hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">T&eacute;rminos y Condiciones del Servicio</h2>

        <div className="flex flex-col gap-5 text-sm leading-relaxed">
          <section>
            <h3 className="font-semibold mb-1">1. Objeto</h3>
            <p>
              Los presentes T&eacute;rminos y Condiciones regulan la relaci&oacute;n entre
              Camino Legal&reg; (en adelante, &ldquo;el Despacho&rdquo;) y el cliente que contrata
              los servicios de consultor&iacute;a legal, registro de marca y protecci&oacute;n de
              propiedad intelectual ante el Instituto Mexicano de la Propiedad Industrial (IMPI)
              y dem&aacute;s autoridades competentes.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">2. Servicios</h3>
            <p>
              El Despacho ofrece, de manera enunciativa m&aacute;s no limitativa, los siguientes servicios:
            </p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>B&uacute;squeda de anterioridades y an&aacute;lisis de viabilidad de marca.</li>
              <li>Preparaci&oacute;n y presentaci&oacute;n de solicitudes de registro de marca ante el IMPI.</li>
              <li>Seguimiento del tr&aacute;mite hasta la obtenci&oacute;n del t&iacute;tulo de registro.</li>
              <li>Asesor&iacute;a en materia de propiedad intelectual y protecci&oacute;n de signos distintivos.</li>
              <li>Renovaciones, cambios de titular y modificaciones ante el IMPI.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-1">3. Obligaciones del Cliente</h3>
            <p>
              El cliente se compromete a proporcionar informaci&oacute;n veraz, completa y oportuna
              para la correcta prestaci&oacute;n de los servicios. Cualquier retraso o inexactitud
              en la informaci&oacute;n proporcionada podr&aacute; afectar los plazos y resultados del tr&aacute;mite.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">4. Honorarios y Forma de Pago</h3>
            <p>
              Los honorarios ser&aacute;n establecidos de com&uacute;n acuerdo previo a la
              contrataci&oacute;n del servicio. Las tarifas gubernamentales (derechos ante el IMPI)
              son independientes a los honorarios profesionales y est&aacute;n sujetas a los
              montos vigentes publicados por la autoridad. El pago deber&aacute; realizarse en los
              t&eacute;rminos y plazos acordados.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">5. Alcance y Limitaciones</h3>
            <p>
              El Despacho realizar&aacute; sus mejores esfuerzos profesionales en la gesti&oacute;n de
              los tr&aacute;mites encomendados. Sin embargo, la resoluci&oacute;n final de cualquier
              solicitud corresponde exclusivamente a la autoridad competente. El Despacho no
              garantiza un resultado favorable, ya que este depende de factores fuera de su control.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">6. Confidencialidad</h3>
            <p>
              El Despacho se obliga a mantener estricta confidencialidad respecto a toda la
              informaci&oacute;n proporcionada por el cliente, salvo cuando la divulgaci&oacute;n sea
              necesaria para el cumplimiento del servicio contratado o por requerimiento de
              autoridad competente.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">7. Protecci&oacute;n de Datos Personales</h3>
            <p>
              Los datos personales recabados ser&aacute;n tratados conforme a la Ley Federal de
              Protecci&oacute;n de Datos Personales en Posesi&oacute;n de los Particulares y se
              utilizar&aacute;n &uacute;nicamente para los fines relacionados con la prestaci&oacute;n
              del servicio.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">8. Legislaci&oacute;n Aplicable</h3>
            <p>
              Los presentes T&eacute;rminos se rigen por las leyes vigentes de los Estados Unidos
              Mexicanos. Para cualquier controversia derivada de los mismos, las partes se
              someten a la jurisdicci&oacute;n de los tribunales competentes de la Ciudad de M&eacute;xico.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-1">9. Contacto</h3>
            <p>
              Para cualquier duda o aclaraci&oacute;n sobre estos T&eacute;rminos, puede comunicarse
              al correo electr&oacute;nico:{" "}
              <a href="mailto:info@caminolegal.com.mx" className="underline font-medium">
                info@caminolegal.com.mx
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
