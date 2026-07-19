import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });

  await connectDB();
  const member = await Member.findById(payload.userId).select("-passwordHash").lean();
  if (!member) return NextResponse.json({ user: null });

  return NextResponse.json({ user: member });
}
