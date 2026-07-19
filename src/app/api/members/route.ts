import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

export async function GET() {
  await connectDB();
  const members = await Member.find().select("-passwordHash").sort({ fullName: 1 }).lean();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  await connectDB();

  // Only admin and account_manager can add members
  const headersList = await headers();
  const role = headersList.get("x-user-role");
  if (role !== "admin" && role !== "account_manager" && role !== "HR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (!body.fullName || !body.username || !body.email || !body.password) {
    return NextResponse.json({ error: "fullName, username, email and password are required" }, { status: 400 });
  }

  const exists = await Member.findOne({ $or: [{ email: body.email }, { username: body.username }] });
  if (exists) {
    return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const member = await Member.create({
    fullName: body.fullName,
    designation: body.designation,
    username: body.username,
    email: body.email,
    passwordHash,
    role: body.role ?? "user",
    portalAccess: body.portalAccess ?? true,
  });

  const { passwordHash: _, ...safe } = member.toObject();
  return NextResponse.json(safe, { status: 201 });
}
