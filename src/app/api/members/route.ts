import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";

export async function GET() {
  await connectDB();
  const members = await Member.find().sort({ name: 1 }).lean();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const member = await Member.create({
    name: body.name,
    email: body.email,
    role: body.role,
  });
  return NextResponse.json(member, { status: 201 });
}
