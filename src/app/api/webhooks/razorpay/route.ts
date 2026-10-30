import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { verifyRazorpayWebhook } from "@/lib/razorpay";

type PaymentLinkEntity = {
  id?: string;
  status?: string;
  reference_id?: string;
  short_url?: string;
  notes?: { invoiceId?: string; invoiceNumber?: string };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyRazorpayWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment_link?: { entity?: PaymentLinkEntity };
      payment?: { entity?: { id?: string } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const link = event.payload?.payment_link?.entity;
  if (!link?.id) return NextResponse.json({ ok: true, ignored: true });

  await connectDB();
  const query: Array<Record<string, string>> = [{ razorpayPaymentLinkId: link.id }];
  if (link.notes?.invoiceId && mongoose.Types.ObjectId.isValid(link.notes.invoiceId)) {
    query.push({ _id: link.notes.invoiceId });
  }
  if (link.reference_id) query.push({ invoiceNumber: link.reference_id });

  const invoice = await Invoice.findOne({ $or: query });
  if (!invoice) return NextResponse.json({ ok: true, unmatched: true });

  invoice.razorpayPaymentLinkId = link.id;
  if (link.short_url) invoice.razorpayShortUrl = link.short_url;
  invoice.razorpayPaymentStatus = link.status || invoice.razorpayPaymentStatus;

  if (event.event === "payment_link.paid") {
    invoice.status = "Paid";
    invoice.razorpayPaymentStatus = "paid";
    const paymentId = event.payload?.payment?.entity?.id;
    if (paymentId) invoice.razorpayPaymentId = paymentId;
  } else if (event.event === "payment_link.cancelled" || event.event === "payment_link.expired") {
    if (invoice.status !== "Paid") {
      invoice.razorpayPaymentStatus = link.status || event.event.replace("payment_link.", "");
    }
  }

  await invoice.save();
  return NextResponse.json({ ok: true });
}
