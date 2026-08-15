type POBody = {
  name?: string;
  type?: string;
  clientName?: string;
  clientAttention?: string;
  clientAddress?: string;
  packageName?: string;
  tagline?: string;
  serviceType?: string;
  listPrice?: number | string;
  salePrice?: number | string;
  durationMonths?: number | string;
  renewalPrice?: number | string;
  gstPercent?: number | string;
  poDate?: string;
  validUntil?: string;
  topFeatures?: string[];
  managedFeatures?: string[];
  notes?: string;
};

export function validatePOBody(body: POBody): string | null {
  if (!body.name || !body.type || !body.clientName || !body.packageName || !body.poDate || !body.validUntil) {
    return "Name, type, client, package name, PO date, and valid until are required.";
  }
  const sale = Number(body.salePrice);
  const list = Number(body.listPrice);
  const months = Number(body.durationMonths);
  const renewal = Number(body.renewalPrice);
  if (!Number.isFinite(sale) || sale < 0) return "Enter a valid sale amount.";
  if (!Number.isFinite(list) || list < 0) return "Enter a valid list amount.";
  if (!Number.isInteger(months) || months < 1) return "Duration must be at least 1 month.";
  if (!Number.isFinite(renewal) || renewal < 0) return "Enter a valid renewal amount.";
  return null;
}

export function toPOFields(body: POBody) {
  return {
    name: String(body.name),
    type: String(body.type),
    clientName: String(body.clientName).trim(),
    clientAttention: body.clientAttention ?? "",
    clientAddress: body.clientAddress ?? "",
    packageName: String(body.packageName),
    tagline: body.tagline ?? "",
    serviceType: body.serviceType || "Annual Subscription",
    listPrice: Number(body.listPrice),
    salePrice: Number(body.salePrice),
    durationMonths: Number(body.durationMonths),
    renewalPrice: Number(body.renewalPrice),
    gstPercent: Number(body.gstPercent ?? 18),
    poDate: new Date(String(body.poDate)),
    validUntil: new Date(String(body.validUntil)),
    topFeatures: Array.isArray(body.topFeatures) ? body.topFeatures : [],
    managedFeatures: Array.isArray(body.managedFeatures) ? body.managedFeatures : [],
    notes: body.notes ?? "",
  };
}

export function poFinancials(po: {
  salePrice: number;
  listPrice: number;
  durationMonths: number;
  gstPercent: number;
}) {
  const subtotal = po.salePrice * po.durationMonths;
  const listTotal = po.listPrice * po.durationMonths;
  const gst = Math.round((subtotal * (po.gstPercent ?? 0) / 100) * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    listTotal: Math.round(listTotal * 100) / 100,
    savings: Math.round((listTotal - subtotal) * 100) / 100,
    gst,
    total,
  };
}
