import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { toInvoiceFields, validateInvoiceBody } from "@/lib/invoice-payload";
import { attachRazorpayPayLink } from "@/lib/invoice-razorpay";

function asJson(doc: { toObject?: () => unknown }) {
  return JSON.parse(JSON.stringify(doc.toObject ? doc.toObject() : doc));
}

export async function GET() {
  try {
    await connectDB();
    const invoices = await Invoice.find()
      .populate("clientId", "name")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(invoices);
  } catch (err) {
    console.error("[invoices GET]", err);
    const message = err instanceof Error ? err.message : "Failed to load invoices.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const invalid = validateInvoiceBody(body);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const client = await Client.findById(body.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const invoice = new Invoice(toInvoiceFields(body));
    await invoice.save();
    const populated = await invoice.populate("clientId", "name");

    let payLinkError: string | undefined;
    if (invoice.includeRazorpayLink) {
      try {
        await attachRazorpayPayLink(invoice);
      } catch (err) {
        payLinkError = err instanceof Error ? err.message : "Failed to create Razorpay pay link.";
      }
    }

    return NextResponse.json(
      { ...asJson(populated), payLinkError },
      { status: 201 }
    );
  } catch (err) {
    console.error("[invoices POST]", err);
    const message = err instanceof Error ? err.message : "Failed to save invoice.";
    const duplicate = /duplicate key|E11000/i.test(message);
    return NextResponse.json(
      { error: duplicate ? "Could not allocate a unique invoice number. Please try again." : message },
      { status: duplicate ? 409 : 500 }
    );
  }
}
