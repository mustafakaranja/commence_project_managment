import type { IInvoice } from "@/models/Invoice";
import { invoiceTotalPaise } from "@/lib/invoice-payload";
import { createRazorpayPaymentLink } from "@/lib/razorpay";

function clientNameFromInvoice(invoice: IInvoice) {
  const client = invoice.clientId as unknown;
  if (client && typeof client === "object" && "name" in client) {
    return String((client as { name?: string }).name ?? "");
  }
  return "";
}

export async function attachRazorpayPayLink(
  invoice: IInvoice,
  options?: { recreate?: boolean }
) {
  if (invoice.status === "Paid") {
    throw new Error("Invoice is already paid.");
  }
  if (invoice.status === "Close") {
    throw new Error("Closed invoices cannot take payments.");
  }
  if (!options?.recreate && invoice.razorpayShortUrl) {
    return { reused: true as const, payUrl: invoice.razorpayShortUrl };
  }

  const amountPaise = invoiceTotalPaise(invoice.amount, invoice.taxAmount);
  if (amountPaise < 100) {
    throw new Error("Razorpay needs a payable total of at least ₹1.");
  }

  const link = await createRazorpayPaymentLink({
    amountPaise,
    invoiceNumber: invoice.invoiceNumber,
    referenceId: options?.recreate
      ? `${invoice.invoiceNumber}-${Date.now()}`
      : invoice.invoiceNumber,
    description: `Invoice ${invoice.invoiceNumber} — ${invoice.invoiceFor}`.slice(0, 2048),
    invoiceId: String(invoice._id),
    customerName: clientNameFromInvoice(invoice) || undefined,
  });

  invoice.razorpayPaymentLinkId = link.id;
  invoice.razorpayShortUrl = link.short_url;
  invoice.razorpayPaymentStatus = link.status || "created";
  invoice.includeRazorpayLink = true;
  if (invoice.status === "Draft") invoice.status = "Unpaid";
  await invoice.save();

  return { reused: false as const, payUrl: link.short_url };
}
