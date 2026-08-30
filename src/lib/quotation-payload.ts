import { isSubscriptionQuote, normalizeQuoteStatus } from "@/lib/quotation-catalog";

export type QuotationServiceBody = {
  title?: string;
  description?: string;
  amount?: number | string;
};

export type SpecGroupBody = {
  title?: string;
  items?: string[];
};

type QuotationBody = {
  name?: string;
  type?: string;
  clientName?: string;
  clientAttention?: string;
  clientAddress?: string;
  overview?: string;
  techStack?: string[];
  timelineValue?: number | string;
  timelineUnit?: string;
  estimateLabel?: string;
  services?: QuotationServiceBody[];
  features?: string[];
  gstPercent?: number | string;
  quoteDate?: string;
  validUntil?: string;
  notes?: string;
  commitment?: string;
  status?: string;
  packageName?: string;
  serviceType?: string;
  specGroups?: SpecGroupBody[];
  unitPrice?: number | string;
  durationMonths?: number | string;
  subscriptionYears?: number | string;
  renewalPrice?: number | string;
  financeNote?: string;
};

export function quotationTotals(
  services: { amount: number }[],
  gstPercent: number
) {
  const subtotal = services.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const gst = Math.round(((subtotal * (gstPercent || 0)) / 100) * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gst,
    total,
  };
}

export function subscriptionTotals(
  unitPrice: number,
  durationMonths: number,
  gstPercent: number
) {
  const subtotal = Math.round((Number(unitPrice) || 0) * (Number(durationMonths) || 0) * 100) / 100;
  const gst = Math.round(((subtotal * (gstPercent || 0)) / 100) * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  return { subtotal, gst, total };
}

export function quoteFinancials(quote: {
  type?: string;
  services?: { amount: number }[];
  gstPercent?: number;
  unitPrice?: number;
  durationMonths?: number;
}) {
  if (isSubscriptionQuote(quote.type)) {
    return subscriptionTotals(
      Number(quote.unitPrice) || 0,
      Number(quote.durationMonths) || 0,
      Number(quote.gstPercent) || 0
    );
  }
  return quotationTotals(quote.services ?? [], Number(quote.gstPercent) || 0);
}

function parseServices(raw: QuotationServiceBody[] | undefined) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .map((row) => ({
      title: String(row.title ?? "").trim(),
      description: String(row.description ?? "").trim(),
      amount: Number(row.amount) || 0,
    }))
    .filter((row) => row.title);
}

function parseSpecGroups(raw: SpecGroupBody[] | undefined) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((group) => ({
      title: String(group.title ?? "").trim(),
      items: Array.isArray(group.items)
        ? group.items.map((item) => String(item).trim()).filter(Boolean)
        : [],
    }))
    .filter((group) => group.title);
}

export function validateQuotationBody(body: QuotationBody): string | null {
  const name = String(body.name ?? "").trim() || String(body.packageName ?? "").trim();
  if (!name || !body.type || !body.clientName || !body.quoteDate || !body.validUntil) {
    return "Name, type, client name, quote date, and valid until are required.";
  }
  const gst = Number(body.gstPercent ?? 18);
  if (!Number.isFinite(gst) || gst < 0) return "Enter a valid GST percent.";

  if (isSubscriptionQuote(body.type)) {
    if (!String(body.packageName ?? "").trim()) {
      return "Enter the service package / subscription name.";
    }
    const unit = Number(body.unitPrice);
    const duration = Number(body.durationMonths);
    const years = Number(body.subscriptionYears ?? 1);
    if (!Number.isFinite(unit) || unit < 0) return "Enter a valid unit price.";
    if (!Number.isFinite(duration) || duration < 1) return "Enter a valid duration in months.";
    if (![1, 2, 3, 4].includes(years)) return "Select subscription years (1–4).";
    return null;
  }

  const services = parseServices(body.services);
  if (services.length === 0) return "Add at least one service with a title.";
  const months = Number(body.timelineValue);
  if (!Number.isFinite(months) || months < 1) return "Enter a valid project timeline.";
  return null;
}

export function toQuotationFields(body: QuotationBody) {
  const gstPercent = Number(body.gstPercent ?? 18);
  const subscription = isSubscriptionQuote(body.type);
  const specGroups = parseSpecGroups(body.specGroups);
  const durationMonths = subscription ? Number(body.durationMonths) || 12 : 0;
  const subscriptionYears = subscription ? Number(body.subscriptionYears) || 1 : 1;
  const packageName = String(body.packageName ?? "").trim();

  return {
    name: String(body.name ?? packageName).trim() || packageName,
    type: String(body.type).trim(),
    clientName: String(body.clientName).trim(),
    clientAttention: body.clientAttention ?? "",
    clientAddress: body.clientAddress ?? "",
    overview: body.overview ?? "",
    techStack: Array.isArray(body.techStack) ? body.techStack.filter(Boolean) : [],
    timelineValue: subscription ? durationMonths : Number(body.timelineValue),
    timelineUnit: subscription ? "Months" : body.timelineUnit || "Days",
    estimateLabel: subscription
      ? body.estimateLabel || "Annual Subscription"
      : body.estimateLabel || "One-time cost estimation",
    services: subscription ? [] : parseServices(body.services),
    features: Array.isArray(body.features) ? body.features.filter(Boolean) : [],
    gstPercent,
    quoteDate: new Date(String(body.quoteDate)),
    validUntil: new Date(String(body.validUntil)),
    notes: body.notes ?? "",
    commitment: body.commitment ?? "",
    status: normalizeQuoteStatus(body.status),
    packageName: subscription ? packageName : "",
    serviceType: subscription ? String(body.serviceType ?? "").trim() || "Annual Subscription" : "",
    specGroups: subscription ? specGroups : [],
    unitPrice: subscription ? Number(body.unitPrice) || 0 : 0,
    durationMonths: subscription ? durationMonths : 0,
    subscriptionYears: subscription ? subscriptionYears : 1,
    renewalPrice: subscription ? Number(body.renewalPrice) || 0 : 0,
    financeNote: subscription ? String(body.financeNote ?? "").trim() : "",
  };
}
