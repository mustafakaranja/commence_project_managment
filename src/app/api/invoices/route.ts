import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { toInvoiceFields, validateInvoiceBody } from "@/lib/invoice-payload";

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
  const invalid = validateInvoiceBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const invoice = new Invoice(toInvoiceFields(body));
  await invoice.save();
  const populated = await invoice.populate("clientId", "name");
  return NextResponse.json(populated, { status: 201 });
}
