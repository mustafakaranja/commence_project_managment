import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();
  const project = await Project.findByIdAndUpdate(
    id,
    {
      title: body.title,
      type: body.type,
      clientId: body.clientId,
      members: body.members ?? [],
      estimationDeadline: new Date(body.estimationDeadline),
      tasks: body.tasks ?? [],
    },
    { new: true }
  ).populate("clientId", "name");
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
