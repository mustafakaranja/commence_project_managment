import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Project from "@/models/Project";
import Client from "@/models/Client";

export async function GET() {
  await connectDB();

  const [invoices, projects, clients] = await Promise.all([
    Invoice.find().lean(),
    Project.find().lean(),
    Client.find().lean(),
  ]);

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + inv.amount + (inv.taxAmount ?? 0),
    0
  );
  const activeProjects = projects.length;
  const activeClients = clients.filter((c) => !c.endDate).length;

  // Monthly revenue for chart (last 6 months)
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyData[key] = 0;
  }
  invoices.forEach((inv) => {
    const d = new Date(inv.invoiceDate);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in monthlyData) {
      monthlyData[key] += inv.amount + (inv.taxAmount ?? 0);
    }
  });

  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({
    month,
    revenue,
    expenses: Math.round(revenue * 0.3), // placeholder 30% expense ratio
  }));

  return NextResponse.json({
    totalRevenue,
    activeProjects,
    activeClients,
    chartData,
  });
}
