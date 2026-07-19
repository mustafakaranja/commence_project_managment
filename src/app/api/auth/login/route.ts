import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Member from "@/models/Member";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const member = await Member.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }],
      portalAccess: true,
    });

    if (!member) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, member.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      userId: String(member._id),
      email: member.email,
      role: member.role,
      fullName: member.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: member._id,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
        designation: member.designation,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
