import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { invoiceTotalPaise } from "@/lib/invoice-payload";
import { attachRazorpayPayLink } from "@/lib/invoice-razorpay";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const recreate = Boolean(
      (await request.json().catch(() => ({})))?.recreate
    );

    const invoice = await Invoice.findById(id).populate("clientId", "name");
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const amountPaise = invoiceTotalPaise(invoice.amount, invoice.taxAmount);
    if (!invoice.razorpayShortUrl && amountPaise < 100) {
      return NextResponse.json(
        { error: "Razorpay needs a payable total of at least ₹1." },
        { status: 400 }
      );
    }

    const result = await attachRazorpayPayLink(invoice, { recreate });
    return NextResponse.json(
      { invoice, reused: result.reused, payUrl: result.payUrl },
      { status: result.reused ? 200 : 201 }
    );
  } catch (err) {
    console.error("[invoices pay-link POST]", err);
    const message = err instanceof Error ? err.message : "Failed to create Razorpay pay link.";
    const status = message.includes("already paid") || message.includes("Closed") || message.includes("at least")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
