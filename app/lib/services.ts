import { promotion } from "./promotion.ts";

export const services = [
  {
    slug: "registro-de-marca", title: "Registro de marca", short: "Tu nombre, con respaldo.",
    description: "Evaluamos tu marca y te acompañamos en su registro ante el IMPI, desde la primera búsqueda hasta la resolución.",
    image: "/stickers/Recurso 81.png",
    includes: ["Evaluación de clasificación, distintividad y disponibilidad", "Búsqueda fonética y documental de marcas en conflicto", "Definición de clase y estrategia de protección", "Preparación, presentación y seguimiento de la solicitud"],
    needs: ["Nombre de tu marca y logotipo, si lo tienes", "Productos o servicios que ofreces", "Datos de la persona o personas titulares"],
    factors: "La evaluación se cobra una vez por marca. Los honorarios de gestión y la tarifa del IMPI se calculan por cada clase.",
    deliverables: ["Resultado de la evaluación de viabilidad y una segunda evaluación incluida", "Acuse de presentación y seguimiento del trámite", "Título de registro, si el IMPI lo concede", "Manual de uso de tu marca y recordatorios calendarizables"],
  },
  {
    slug: "contratos-y-convenios", title: "Contratos y convenios", short: "Acuerdos que sí entiendes.",
    description: "Redactamos y revisamos acuerdos adaptados a tu forma de trabajar. Te ayudamos a entender tus compromisos antes de firmar.",
    image: "/stickers/Recurso 80.png",
    includes: ["Redacción de distintos tipos de contratos, como prestación de servicios", "Acuerdos de confidencialidad (NDA) y acuerdos comerciales", "Revisión y orientación antes de firmar", "Documentos complementarios según el caso: avisos de privacidad, términos y condiciones, cláusulas de cookies"],
    needs: ["Tipo de acuerdo y objetivo", "Personas involucradas y responsabilidades", "Documento existente, si necesitas una revisión"],
    factors: "La cotización depende de si necesitas una revisión o una redacción, la complejidad del acuerdo y los documentos involucrados. Definimos el alcance y las revisiones en tu propuesta.",
    deliverables: ["Documento redactado o revisado según el alcance acordado", "Explicación de compromisos, riesgos y puntos a considerar"],
  },
  {
    slug: "derechos-de-autor", title: "Derechos de autor", short: "Dale respaldo a tu obra.",
    description: "Te acompañamos en el registro de tu obra ante INDAUTOR y te orientamos sobre la protección y el uso de tu trabajo creativo.",
    image: "/stickers/Recurso 94.png",
    includes: ["Orientación para el registro de tu obra", "Preparación de la solicitud ante INDAUTOR", "Seguimiento del trámite", "Asesoría ante usos no autorizados, con alcance por definir"],
    needs: ["Tipo de obra y una descripción", "Datos de autoría y titularidad", "Tu objetivo: registro, uso o atención de un conflicto"],
    factors: "El tipo y número de obras, la titularidad y el trámite requerido definen la propuesta. Separamos los honorarios de las tarifas oficiales que correspondan.",
    deliverables: ["Documentación del trámite contratado", "Orientación sobre los siguientes pasos para tu obra"],
  },
  {
    slug: "consultoria-legal", title: "Consultoría legal", short: "Decide con más claridad.",
    description: "Revisamos contigo una situación concreta y trazamos los siguientes pasos para proteger tu trabajo o hacer avanzar tu negocio.",
    image: "/stickers/Recurso 91.png",
    includes: ["Reunión en línea de aprox. 45 minutos. Recibes el enlace por correo al agendar.", "Revisión de tu caso: analizamos tu idea o proyecto y los documentos que compartas.", "Orientación legal: te explicamos tus opciones de protección (marca, obra, contratos u otras).", "Diagnóstico por escrito en 3 días hábiles, con riesgos identificados y la vía recomendada.", "Cotización personalizada del servicio que necesitas."],
    needs: ["Una descripción de tu idea, proyecto o situación", "Las preguntas que quieres resolver", "Documentos relevantes y fechas importantes"],
    factors: "La consultoría tiene un costo de $399 MXN, abonable al costo total del servicio cotizado si lo contratas dentro de los 30 días naturales siguientes a la entrega de tu diagnóstico.",
    deliverables: ["Diagnóstico por escrito con riesgos identificados y la vía recomendada", "Cotización personalizada del servicio que necesitas"],
  },
  {
    slug: "marco-legal-digital", title: "Marco Legal Digital", short: "Tu sitio, con reglas claras.",
    description: "Preparamos el marco legal digital de tu sitio web o app, con documentos adaptados a tu negocio y a la relación que tienes con tus usuarios.",
    image: "/stickers/Recurso 95.png",
    includes: ["Aviso de privacidad integral", "Términos y condiciones de tu sitio web o app", "Cláusula de confidencialidad para correos electrónicos", "Política de cookies", "Documentos adaptados a tu operación y una ronda de cambios sobre el borrador"],
    needs: ["Dirección y descripción de tu sitio web o app", "Servicios o productos que ofreces", "Información sobre formularios, datos y herramientas que utilizas"],
    factors: "El marco legal digital cuesta $2,799 MXN, IVA incluido. Elige pago único, dos o tres pagos; con tres pagos empiezas con $399 MXN por el diagnóstico, incluidos en el total.",
    deliverables: ["Aviso de privacidad, términos y condiciones, cláusula de confidencialidad para correos y política de cookies", "Documentos finales en Word y PDF, adaptados a tu logo y diseño", "Indicaciones para publicarlos en tu sitio web"],
  },
] as const;

// Dedicated detail pages also include services outside the homepage's five categories.
export const serviceDetails = [...services, {
  slug: "registro-de-aviso-comercial", title: "Registro de aviso comercial", short: "Tu frase, con respaldo.",
  description: "Te acompañamos en el registro de la frase que distingue tu negocio, producto o servicio ante el IMPI.",
  image: "/stickers/Recurso 81.png",
  includes: ["Estudio de distintividad y disponibilidad de tu frase", "Búsqueda de avisos y marcas en conflicto", "Definición de clase y vía de protección", "Preparación, presentación y seguimiento ante el IMPI"],
  needs: ["La frase que quieres proteger", "Los productos o servicios que anuncia", "Datos de la persona o personas titulares"],
  factors: "El estudio se cobra una vez por aviso. Los honorarios de gestión y la tarifa IMPI se calculan por cada clase.",
  deliverables: ["Resultado del estudio de viabilidad", "Documentación y seguimiento de tu solicitud"],
}];

export const money = (cents: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
export const trademarkRates = { evaluation: 79900, management: 228700, official: 281377, rules: 61600 };

export function trademarkQuote(classes: number, rules = false, promotional = false) {
  if (!Number.isInteger(classes) || classes < 1 || classes > 10) throw new RangeError("Selecciona de 1 a 10 clases.");
  const evaluation = promotional ? promotion.evaluation : trademarkRates.evaluation;
  // The study is credited against the package total; additional classes keep regular rates.
  const management = promotional
    ? promotion.total - evaluation - trademarkRates.official + trademarkRates.management * (classes - 1)
    : trademarkRates.management * classes;
  const official = trademarkRates.official * classes;
  const extra = rules ? trademarkRates.rules : 0;
  return { evaluation, management, official, extra, total: evaluation + management + official + extra };
}

export function quoteEmail(service: string, detail = "") {
  return `mailto:info@caminolegal.com.mx?subject=${encodeURIComponent(`Cotización · ${service}`)}&body=${encodeURIComponent(`Hola, Camino Legal. Me interesa ${service}.\n\n${detail}\n\nMi proyecto:\nMi nombre:\n`)}`;
}

export function quoteWhatsApp(service: string, detail = "") {
  return `https://wa.me/529992505160?text=${encodeURIComponent(`Hola, Camino Legal. Me interesa ${service}.\n\n${detail}`)}`;
}
