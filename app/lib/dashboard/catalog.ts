import { EVENT_NAMES, providerEventName, type AnalyticsEvent } from '../measurement/contracts.ts';
import type { EventDefinition } from './contracts.ts';

type Description = [label: string, trigger: string, scope: string];
const descriptions: Record<AnalyticsEvent, Description> = {
  page_view: ['Visita una página', 'Se abre una página pública con consentimiento.', 'Todas las páginas públicas'],
  navigation_click: ['Navega por el sitio', 'Activa un enlace de navegación.', 'Navegación y pie de página'],
  cta_click: ['Elige un siguiente paso', 'Activa una llamada a la acción registrada.', 'Páginas y servicios'],
  service_select: ['Selecciona un servicio', 'Elige deliberadamente un servicio.', 'Directorio de servicios'],
  quote_view: ['Ve una cotización', 'La cotización permanece visible el tiempo requerido.', 'Cotizaciones'],
  quote_change: ['Cambia su cotización', 'Modifica servicio, clases, reglas o pagos.', 'Cotizaciones'],
  quote_request_intent: ['Solicita cotización por correo', 'Abre el correo con una solicitud preparada.', 'Cotizaciones'],
  evaluation_open: ['Abre la evaluación', 'Abre el formulario de evaluación de marca.', 'Evaluación de marca'],
  evaluation_close: ['Cierra la evaluación', 'Cierra el formulario de evaluación.', 'Evaluación de marca'],
  form_view: ['Ve un formulario', 'El formulario cumple el umbral de visibilidad.', 'Contacto y evaluación'],
  form_start: ['Comienza un formulario', 'Realiza la primera edición del formulario.', 'Contacto y evaluación'],
  form_submit_attempt: ['Intenta enviar un formulario', 'Activa el envío del formulario.', 'Contacto y evaluación'],
  form_validation_failed: ['Encuentra un campo inválido', 'La validación detecta un campo inválido.', 'Contacto y evaluación'],
  form_submit_failed: ['El envío no se confirma', 'El servidor informa un fallo o resultado incierto.', 'Contacto y evaluación'],
  lead_submitted: ['Envía una solicitud aceptada', 'El servidor confirma aceptación del envío elegible; no prueba entrega en la bandeja.', 'Contacto y evaluación'],
  whatsapp_click: ['Hace clic en WhatsApp', 'Activa un enlace de WhatsApp; no confirma conversación.', 'Opciones de contacto'],
  email_click: ['Hace clic en correo', 'Activa un enlace de correo; no confirma envío.', 'Opciones de contacto'],
  social_click: ['Abre una red social', 'Activa un enlace a una red social.', 'Pie de página'],
  outbound_reference_click: ['Consulta una referencia externa', 'Activa una referencia oficial.', 'Ruta de registro de marca'],
  section_view: ['Ve una sección', 'Una sección cumple el umbral de visibilidad.', 'Secciones públicas'],
  trademark_step_view: ['Ve una etapa del registro', 'Una etapa cumple el umbral de visibilidad.', 'Registro de marca'],
  faq_toggle: ['Abre o cierra una pregunta', 'Cambia una pregunta frecuente deliberadamente.', 'Preguntas frecuentes'],
  process_step_select: ['Explora el proceso', 'Selecciona manualmente una etapa del proceso.', 'Proceso'],
  review_interaction: ['Explora testimonios', 'Cambia manualmente un testimonio.', 'Testimonios'],
  quote_disclosure_toggle: ['Consulta un desglose', 'Abre o cierra costos o calendario de pagos.', 'Cotizaciones'],
  scroll_depth: ['Avanza por una página', 'Alcanza un hito de desplazamiento registrado.', 'Páginas públicas'],
  utility_interaction: ['Usa una opción del sitio', 'Activa menú, tema o contenido legal.', 'Opciones del sitio'],
};
const intents = new Set<AnalyticsEvent>(['whatsapp_click', 'email_click', 'quote_request_intent']);
export const measurementCatalog: EventDefinition[] = EVENT_NAMES.map(name => ({
  name, label: descriptions[name][0], trigger: descriptions[name][1], scope: descriptions[name][2],
  category: name === 'lead_submitted' ? 'lead' : intents.has(name) ? 'intent' : 'engagement',
  google: name, meta: providerEventName(name, 'meta'), registrationRequired: name === 'lead_submitted',
}));
