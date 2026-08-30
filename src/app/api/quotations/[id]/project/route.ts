import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Quotation from "@/models/Quotation";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { requireQuotationAccess } from "@/lib/require-director";
import { toProjectFields } from "@/lib/project-payload";
import { escapeRegex, quoteToProjectPayload } from "@/lib/quote-to-project";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireQuotationAccess();
  if (denied) return denied;

  try {
    await connectDB();
    const { id } = await params;
    const quote = await Quotation.findById(id);
    if (!quote) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    const existing = await Project.findOne({ quoteId: id }).populate("clientId", "name");
    if (existing) {
      return NextResponse.json({ project: existing, existing: true });
    }

    const clientName = String(quote.clientName ?? "").trim();
    if (!clientName) {
      return NextResponse.json({ error: "Quotation is missing a client name." }, { status: 400 });
    }

    const mapped = quoteToProjectPayload({
      _id: String(quote._id),
      quoteNumber: quote.quoteNumber,
      name: quote.name,
      type: quote.type,
      clientName: quote.clientName,
      overview: quote.overview,
      timelineValue: quote.timelineValue,
      timelineUnit: quote.timelineUnit,
      quoteDate: quote.quoteDate,
      services: quote.services,
      specGroups: quote.specGroups,
      packageName: quote.packageName,
      durationMonths: quote.durationMonths,
      subscriptionYears: quote.subscriptionYears,
    });

    let client = await Client.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(clientName)}$`, "i") },
    });
    let clientCreated = false;
    if (!client) {
      client = await Client.create({
        name: clientName,
        onboardDate: quote.quoteDate || new Date(),
        endDate: mapped.estimationDeadline ? new Date(mapped.estimationDeadline) : undefined,
      });
      clientCreated = true;
    }

    const project = await Project.create(
      toProjectFields({
        ...mapped,
        clientId: String(client._id),
      })
    );
    const populated = await Project.findById(project._id).populate("clientId", "name");
    return NextResponse.json(
      { project: populated, existing: false, clientCreated },
      { status: 201 }
    );
  } catch (err) {
    console.error("[quotations project POST]", err);
    const message = err instanceof Error ? err.message : "Failed to create project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
