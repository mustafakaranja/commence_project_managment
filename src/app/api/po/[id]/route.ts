import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import PurchaseOrder from "@/models/PurchaseOrder";
import { toPOFields, validatePOBody } from "@/lib/po-payload";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const order = await PurchaseOrder.findById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const invalid = validatePOBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const order = await PurchaseOrder.findByIdAndUpdate(id, { $set: toPOFields(body) }, { new: true });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await PurchaseOrder.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
