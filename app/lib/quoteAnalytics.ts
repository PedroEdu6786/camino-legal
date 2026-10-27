import { trademarkQuote } from "./services.ts";

import { quoteServices as services, getServiceQuote, serviceQuoteTotal, servicePaymentPlan } from "./serviceQuotes.ts";

/** One source of money truth: all analytics amounts use the displayed calculator. */
export function quoteSnapshot(quoteId: string, slug: string, classes = 1, rules = false, payments = 3) {
  const service = services.find(item => item.slug === slug) ?? services[0];
  const trademark = service.slug === "registro-de-marca";
  const fixed = getServiceQuote(service.slug);
  const quote = trademark ? trademarkQuote(classes, rules) : null;
  return {
    quote_id: quoteId, quote_type: trademark || fixed ? "estimate" : "custom", service_id: service.slug,
    classes: trademark ? classes : null, ownership_rules: trademark ? rules : null,
    payment_count: trademark ? payments : fixed ? servicePaymentPlan(service.slug, payments)!.length : null, estimated_total_minor: quote?.total ?? serviceQuoteTotal(service.slug) ?? null,
    evaluation_minor: quote?.evaluation ?? null, currency: "MXN", price_kind: "estimate",
  };
}
