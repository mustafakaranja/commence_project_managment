import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import PurchaseOrder from "@/models/PurchaseOrder";
import { toPOFields, validatePOBody } from "@/lib/po-payload";

export async function GET() {
  await connectDB();
  const orders = await PurchaseOrder.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  const invalid = validatePOBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const order = new PurchaseOrder(toPOFields(body));
  await order.save();
  return NextResponse.json(order, { status: 201 });
}
