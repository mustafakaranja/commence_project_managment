import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Quotation from "@/models/Quotation";
import { requireQuotationAccess } from "@/lib/require-director";
import { toQuotationFields, validateQuotationBody } from "@/lib/quotation-payload";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
  const quote = await Quotation.findById(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const invalid = validateQuotationBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const quote = await Quotation.findByIdAndUpdate(
    id,
    { $set: toQuotationFields(body) },
    { new: true }
  );
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
  await Quotation.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
