import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Quotation from "@/models/Quotation";
import { requireQuotationAccess } from "@/lib/require-director";
import { toQuotationFields, validateQuotationBody } from "@/lib/quotation-payload";

export async function GET() {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  await connectDB();
  const quotes = await Quotation.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(quotes);
}

export async function POST(request: Request) {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  try {
    await connectDB();
    const body = await request.json();
    const invalid = validateQuotationBody(body);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const quote = new Quotation(toQuotationFields(body));
    await quote.save();
    return NextResponse.json(quote.toObject(), { status: 201 });
  } catch (err) {
    console.error("[quotations POST]", err);
    const message = err instanceof Error ? err.message : "Failed to save quotation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
