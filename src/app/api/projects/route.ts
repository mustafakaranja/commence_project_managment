import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";
import Client from "@/models/Client";

export async function GET() {
  await connectDB();
  const projects = await Project.find()
    .populate("clientId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  // Validate client exists
  const client = await Client.findById(body.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const project = await Project.create({
    title: body.title,
    type: body.type,
    clientId: body.clientId,
    members: body.members ?? [],
    estimationDeadline: new Date(body.estimationDeadline),
    tasks: body.tasks ?? [],
  });

  return NextResponse.json(project, { status: 201 });
}
