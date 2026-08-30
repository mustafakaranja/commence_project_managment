import { normalizeQuoteStatus } from "@/lib/quotation-catalog";

export type QuotationServiceBody = {
  title?: string;
  description?: string;
  amount?: number | string;
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

export function validateQuotationBody(body: QuotationBody): string | null {
  if (!body.name || !body.type || !body.clientName || !body.quoteDate || !body.validUntil) {
    return "Name, type, client name, quote date, and valid until are required.";
  }
  const services = parseServices(body.services);
  if (services.length === 0) return "Add at least one service with a title.";
  const months = Number(body.timelineValue);
  if (!Number.isFinite(months) || months < 1) return "Enter a valid project timeline.";
  const gst = Number(body.gstPercent ?? 18);
  if (!Number.isFinite(gst) || gst < 0) return "Enter a valid GST percent.";
  return null;
}

export function toQuotationFields(body: QuotationBody) {
  const services = parseServices(body.services);
  const gstPercent = Number(body.gstPercent ?? 18);
  return {
    name: String(body.name).trim(),
    type: String(body.type).trim(),
    clientName: String(body.clientName).trim(),
    clientAttention: body.clientAttention ?? "",
    clientAddress: body.clientAddress ?? "",
    overview: body.overview ?? "",
    techStack: Array.isArray(body.techStack) ? body.techStack.filter(Boolean) : [],
    timelineValue: Number(body.timelineValue),
    timelineUnit: body.timelineUnit || "Days",
    estimateLabel: body.estimateLabel || "One-time cost estimation",
    services,
    features: Array.isArray(body.features) ? body.features.filter(Boolean) : [],
    gstPercent,
    quoteDate: new Date(String(body.quoteDate)),
    validUntil: new Date(String(body.validUntil)),
    notes: body.notes ?? "",
    commitment: body.commitment ?? "",
    status: normalizeQuoteStatus(body.status),
  };
}
