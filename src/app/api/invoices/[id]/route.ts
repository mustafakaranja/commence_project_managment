import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { toInvoiceFields, validateInvoiceBody } from "@/lib/invoice-payload";
import { attachRazorpayPayLink } from "@/lib/invoice-razorpay";

function asJson(doc: { toObject?: () => unknown }) {
  return JSON.parse(JSON.stringify(doc.toObject ? doc.toObject() : doc));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const invalid = validateInvoiceBody(body);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const client = await Client.findById(body.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: toInvoiceFields(body) },
      { new: true }
    ).populate("clientId", "name");
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let payLinkError: string | undefined;
    if (invoice.includeRazorpayLink && !invoice.razorpayShortUrl) {
      try {
        await attachRazorpayPayLink(invoice);
      } catch (err) {
        payLinkError = err instanceof Error ? err.message : "Failed to create Razorpay pay link.";
      }
    }

    return NextResponse.json({ ...asJson(invoice), payLinkError });
  } catch (err) {
    console.error("[invoices PUT]", err);
    const message = err instanceof Error ? err.message : "Failed to save invoice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Invoice.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
