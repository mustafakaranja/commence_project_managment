import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const client = await Client.findByIdAndUpdate(
    id,
    {
      name: body.name,
      onboardDate: new Date(body.onboardDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
    { new: true }
  );
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Client.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
