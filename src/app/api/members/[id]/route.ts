import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const member = await Member.findByIdAndUpdate(id, body, { new: true });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Member.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
