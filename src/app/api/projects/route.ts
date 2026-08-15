import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { toProjectFields, validateProjectBody } from "@/lib/project-payload";

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

  const invalid = validateProjectBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const client = await Client.findById(body.clientId);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const project = await Project.create(toProjectFields(body));
  return NextResponse.json(project, { status: 201 });
}
