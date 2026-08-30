import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { toInvoiceFields, validateInvoiceBody } from "@/lib/invoice-payload";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const invalid = validateInvoiceBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { $set: toInvoiceFields(body) },
    { new: true }
  ).populate("clientId", "name");
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
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
