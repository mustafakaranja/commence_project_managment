import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";

export async function GET() {
  await connectDB();
  const invoices = await Invoice.find()
    .populate("clientId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  const invoice = new Invoice({
    clientId: body.clientId,
    invoiceDate: new Date(body.invoiceDate),
    address: body.address,
    amount: Number(body.amount),
    taxAmount: body.taxAmount ? Number(body.taxAmount) : 0,
    invoiceFor: body.invoiceFor,
  });

  await invoice.save(); // triggers pre-save hook for invoiceNumber

  return NextResponse.json(invoice, { status: 201 });
}
