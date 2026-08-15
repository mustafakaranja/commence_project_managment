import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Project from "@/models/Project";
import { daysUntil, RENEWAL_WARNING_DAYS } from "@/lib/renewal";

export async function GET() {
  await connectDB();

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() + RENEWAL_WARNING_DAYS);

  const projects = await Project.find({
    type: "Recurring",
    renewalDate: { $ne: null, $lte: cutoff },
  })
    .populate("clientId", "name")
    .sort({ renewalDate: 1 })
    .lean();

  return NextResponse.json(
    projects.map((p) => ({
      ...p,
      daysUntilRenewal: p.renewalDate ? daysUntil(p.renewalDate) : null,
    }))
  );
}
