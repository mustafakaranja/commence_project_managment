import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";

export async function GET() {
  await connectDB();
  const clients = await Client.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  const client = await Client.create({
    name: body.name,
    onboardDate: new Date(body.onboardDate),
    endDate: body.endDate ? new Date(body.endDate) : undefined,
  });

  return NextResponse.json(client, { status: 201 });
}
