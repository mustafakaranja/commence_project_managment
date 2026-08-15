import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";

export async function requireExpenseAccess(): Promise<NextResponse | null> {
  const h = await headers();
  const role = h.get("x-user-role");
  if (role === "admin" || role === "director") return null;

  const userId = h.get("x-user-id");
  if (userId) {
    await connectDB();
    const member = await Member.findById(userId).select("designation").lean();
    if (member?.designation?.trim().toLowerCase() === "director") return null;
  }

  return NextResponse.json({ error: "Forbidden — Director only" }, { status: 403 });
}
