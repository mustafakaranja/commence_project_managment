import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  if (role !== "admin" && role !== "account_manager" && role !== "HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {
    fullName: body.fullName,
    designation: body.designation,
    username: body.username,
    email: body.email,
    role: body.role,
    portalAccess: body.portalAccess,
  };

  if (body.password) {
    update.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const member = await Member.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash");
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden — only admin can delete members" }, { status: 403 });
  }

  const { id } = await params;
  await Member.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
