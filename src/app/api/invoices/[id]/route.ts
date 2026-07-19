import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    {
      clientId: body.clientId,
      invoiceDate: new Date(body.invoiceDate),
      address: body.address,
      amount: Number(body.amount),
      taxAmount: body.taxAmount ? Number(body.taxAmount) : 0,
      invoiceFor: body.invoiceFor,
    },
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
