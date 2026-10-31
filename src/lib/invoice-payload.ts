export const INVOICE_STATUSES = ["Draft", "Unpaid", "Paid", "Close"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export function normalizeInvoiceStatus(value?: string | null): InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as InvoiceStatus)
    : "Draft";
}

export type InvoiceItemBody = {
  description?: string;
  amount?: number | string;
};

type InvoiceBody = {
  clientId?: string;
  invoiceDate?: string;
  address?: string;
  amount?: number | string;
  taxAmount?: number | string;
  invoiceFor?: string;
  items?: InvoiceItemBody[];
  quoteId?: string | null;
  quoteNumber?: string;
  status?: string;
};

export type InvoiceItem = {
  description: string;
  amount: number;
};

export function parseInvoiceItems(body: InvoiceBody): InvoiceItem[] {
  if (Array.isArray(body.items)) {
    return body.items
      .map((row) => ({
        description: String(row.description ?? "").trim(),
        amount: Number(row.amount) || 0,
      }))
      .filter((row) => row.description);
  }
  const fallback = String(body.invoiceFor ?? "").trim();
  if (fallback) {
    return [{ description: fallback, amount: Number(body.amount) || 0 }];
  }
  return [];
}

export function invoiceSubtotal(items: InvoiceItem[]) {
  return Math.round(items.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) * 100) / 100;
}

export function validateInvoiceBody(body: InvoiceBody): string | null {
  if (!body.clientId || !body.invoiceDate || !body.address) {
    return "Client, invoice date, and address are required.";
  }
  const items = parseInvoiceItems(body);
  if (items.length === 0) {
    return "Add at least one invoice detail line.";
  }
  const invoiceFor = String(body.invoiceFor ?? "").trim() || items[0].description;
  if (!invoiceFor) return "Invoice for is required.";
  const tax = Number(body.taxAmount ?? 0);
  if (!Number.isFinite(tax) || tax < 0) return "Enter a valid tax amount.";
  return null;
}

export function toInvoiceFields(body: InvoiceBody) {
  const items = parseInvoiceItems(body);
  const amount = invoiceSubtotal(items);
  return {
    clientId: body.clientId,
    invoiceDate: new Date(String(body.invoiceDate)),
    address: String(body.address ?? "").trim(),
    amount,
    taxAmount: Number(body.taxAmount ?? 0) || 0,
    invoiceFor: String(body.invoiceFor ?? "").trim() || items[0]?.description || "",
    items,
    quoteId: body.quoteId || null,
    quoteNumber: body.quoteNumber ? String(body.quoteNumber) : "",
    status: normalizeInvoiceStatus(body.status),
  };
}
