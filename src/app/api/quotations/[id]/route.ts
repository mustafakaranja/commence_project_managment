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

  try {
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
      { returnDocument: "after" }
    );
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(quote.toObject());
  } catch (err) {
    console.error("[quotations PUT]", err);
    const message = err instanceof Error ? err.message : "Failed to save quotation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
