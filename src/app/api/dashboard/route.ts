import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import Expense from "@/models/Expense";
import Project from "@/models/Project";
import Client from "@/models/Client";
import Member from "@/models/Member";
import { isRenewalDue } from "@/lib/renewal";

type LeanInvoice = {
  amount: number;
  taxAmount?: number;
  invoiceDate: Date;
  clientId?: { _id: unknown; name?: string } | unknown;
};

function invoiceTotal(inv: { amount: number; taxAmount?: number }) {
  return inv.amount + (inv.taxAmount ?? 0);
}

function expenseTotal(ex: { amount: number; taxAmount?: number }) {
  return ex.amount + (ex.taxAmount ?? 0);
}

function inRange(date: Date | string | undefined, start: Date | null, end: Date | null) {
  if (!date) return false;
  if (!start || !end) return true;
  const t = new Date(date).getTime();
  return t >= start.getTime() && t < end.getTime();
}

function monthKey(date: Date) {
  return date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
}

function yearBounds(year: number | "all"): { start: Date | null; end: Date | null } {
  if (year === "all") return { start: null, end: null };
  return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
}

function buildMonthKeys(year: number | "all") {
  const keys: string[] = [];
  if (year === "all") {
    const cursor = new Date();
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() - 11);
    for (let i = 0; i < 12; i++) {
      keys.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys;
  }
  for (let m = 0; m < 12; m++) {
    keys.push(monthKey(new Date(year, m, 1)));
  }
  return keys;
}

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const currentYear = new Date().getFullYear();
  const year: number | "all" =
    yearParam === "all" ? "all" : Number.parseInt(yearParam ?? String(currentYear), 10);
  const selectedYear = year === "all" || Number.isFinite(year) ? year : currentYear;
  const { start, end } = yearBounds(selectedYear);

  const [invoices, expenses, projects, clients, members] = await Promise.all([
    Invoice.find().populate("clientId", "name").lean(),
    Expense.find().lean(),
    Project.find().lean(),
    Client.find().lean(),
    Member.find().select("fullName role portalAccess createdAt").lean(),
  ]);

  const availableYears = new Set<number>([currentYear]);
  invoices.forEach((inv) => availableYears.add(new Date(inv.invoiceDate).getFullYear()));
  expenses.forEach((ex) => availableYears.add(new Date(ex.expenseDate).getFullYear()));
  clients.forEach((c) => availableYears.add(new Date(c.onboardDate).getFullYear()));

  const periodInvoices = invoices.filter((inv) => inRange(inv.invoiceDate, start, end));
  const periodExpenses = expenses.filter((ex) => inRange(ex.expenseDate, start, end));

  const totalRevenue = periodInvoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0);
  const orgExpenses = periodExpenses
    .filter((ex) => ex.expenseFor === "Organization")
    .reduce((sum, ex) => sum + expenseTotal(ex), 0);
  const clientExpenses = periodExpenses
    .filter((ex) => ex.expenseFor === "Client")
    .reduce((sum, ex) => sum + expenseTotal(ex), 0);
  const totalExpenses = orgExpenses + clientExpenses;
  const reimbursedExpenses = periodExpenses
    .filter((ex) => ex.reimbursed)
    .reduce((sum, ex) => sum + expenseTotal(ex), 0);
  const unreimbursedExpenses = totalExpenses - reimbursedExpenses;
  const recurringExpenses = periodExpenses
    .filter((ex) => ex.type === "Recurring")
    .reduce((sum, ex) => sum + expenseTotal(ex), 0);
  const fixedExpenses = totalExpenses - recurringExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const operatingProfit = totalRevenue - unreimbursedExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  const invoiceCount = periodInvoices.length;
  const avgInvoiceValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

  const activeClients = clients.filter((c) => !c.endDate).length;
  const newClients = clients.filter((c) => inRange(c.onboardDate, start, end)).length;
  const endedClients = clients.filter((c) => c.endDate && inRange(c.endDate, start, end)).length;
  const billedClientIds = new Set(
    periodInvoices
      .map((inv) => {
        const cid = inv.clientId as LeanInvoice["clientId"];
        if (cid && typeof cid === "object" && "_id" in cid) return String(cid._id);
        return cid ? String(cid) : "";
      })
      .filter(Boolean)
  );
  const revenuePerClient = billedClientIds.size > 0 ? totalRevenue / billedClientIds.size : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeProjects = projects.filter((p) => new Date(p.estimationDeadline) >= today || p.type === "Recurring").length;
  const overdueProjects = projects.filter((p) => p.type !== "Recurring" && new Date(p.estimationDeadline) < today).length;
  const recurringProjects = projects.filter((p) => p.type === "Recurring").length;
  const renewalsDue = projects.filter((p) => p.type === "Recurring" && isRenewalDue(p.renewalDate)).length;
  const newProjects = projects.filter((p) => inRange(p.createdAt, start, end)).length;

  const allTasks = projects.flatMap((p) => p.tasks ?? []);
  const doneTasks = allTasks.filter((t) => t.status === "Done").length;
  const taskCompletion = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  const projectTypeCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const key = p.type || "Fixed";
    projectTypeCounts[key] = (projectTypeCounts[key] ?? 0) + 1;
  });

  const assignedNames = new Set(projects.flatMap((p) => p.members ?? []));
  const activeMembers = members.filter((m) => m.portalAccess !== false);
  const benchCount = activeMembers.filter((m) => !assignedNames.has(m.fullName)).length;
  const teamSize = activeMembers.length;
  const revenuePerMember = teamSize > 0 ? totalRevenue / teamSize : 0;

  const monthKeys = buildMonthKeys(selectedYear);
  const monthly: Record<string, { revenue: number; expenses: number }> = {};
  monthKeys.forEach((key) => {
    monthly[key] = { revenue: 0, expenses: 0 };
  });
  periodInvoices.forEach((inv) => {
    const key = monthKey(new Date(inv.invoiceDate));
    if (monthly[key]) monthly[key].revenue += invoiceTotal(inv);
  });
  periodExpenses.forEach((ex) => {
    const key = monthKey(new Date(ex.expenseDate));
    if (monthly[key]) monthly[key].expenses += expenseTotal(ex);
  });
  const chartData = monthKeys.map((month) => ({
    month,
    revenue: Math.round(monthly[month].revenue),
    expenses: Math.round(monthly[month].expenses),
  }));

  const revenueByClient = new Map<string, { name: string; revenue: number }>();
  periodInvoices.forEach((inv) => {
    const client = inv.clientId as { _id?: unknown; name?: string } | null;
    const id = client && typeof client === "object" && client._id ? String(client._id) : "unknown";
    const name = client && typeof client === "object" && client.name ? client.name : "Unknown client";
    const current = revenueByClient.get(id) ?? { name, revenue: 0 };
    current.revenue += invoiceTotal(inv);
    revenueByClient.set(id, current);
  });
  const topClients = [...revenueByClient.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      revenue: Math.round(c.revenue),
      share: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0,
    }));

  const periodLabel = selectedYear === "all" ? "all time" : String(selectedYear);
  const insights: { tone: "success" | "warning" | "info"; text: string }[] = [];

  if (totalRevenue === 0 && totalExpenses === 0) {
    insights.push({ tone: "info", text: `No invoices or expenses recorded for ${periodLabel} yet.` });
  } else if (netProfit < 0) {
    insights.push({
      tone: "warning",
      text: `Expenses exceed billed revenue by ₹${Math.abs(netProfit).toLocaleString("en-IN")} in ${periodLabel}.`,
    });
  } else if (profitMargin >= 30) {
    insights.push({
      tone: "success",
      text: `Healthy net margin of ${profitMargin.toFixed(1)}% after expenses in ${periodLabel}.`,
    });
  } else if (totalRevenue > 0) {
    insights.push({
      tone: "info",
      text: `Net margin is ${profitMargin.toFixed(1)}% in ${periodLabel}. Target 30%+ by trimming unreimbursed cost or raising billings.`,
    });
  }

  const unreimbursedClient = periodExpenses
    .filter((ex) => ex.expenseFor === "Client" && !ex.reimbursed)
    .reduce((sum, ex) => sum + expenseTotal(ex), 0);
  if (unreimbursedClient > 0) {
    insights.push({
      tone: "warning",
      text: `₹${unreimbursedClient.toLocaleString("en-IN")} of client-tagged expenses are not reimbursed — consider invoicing.`,
    });
  }
  if (renewalsDue > 0) {
    insights.push({
      tone: "warning",
      text: `${renewalsDue} recurring project${renewalsDue === 1 ? "" : "s"} due for renewal in the next 15 days.`,
    });
  }
  if (overdueProjects > 0) {
    insights.push({
      tone: "warning",
      text: `${overdueProjects} fixed-scope project${overdueProjects === 1 ? " is" : "s are"} past the estimation deadline.`,
    });
  }
  if (benchCount > 0 && teamSize > 0) {
    insights.push({
      tone: "info",
      text: `${benchCount} of ${teamSize} members are not assigned to a project (bench).`,
    });
  }
  if (teamSize > 0 && totalRevenue > 0) {
    insights.push({
      tone: "info",
      text: `Revenue per team member is ₹${Math.round(revenuePerMember).toLocaleString("en-IN")} in ${periodLabel}.`,
    });
  }

  return NextResponse.json({
    year: selectedYear,
    availableYears: [...availableYears].sort((a, b) => b - a),
    financials: {
      totalRevenue: Math.round(totalRevenue),
      orgExpenses: Math.round(orgExpenses),
      clientExpenses: Math.round(clientExpenses),
      totalExpenses: Math.round(totalExpenses),
      reimbursedExpenses: Math.round(reimbursedExpenses),
      unreimbursedExpenses: Math.round(unreimbursedExpenses),
      recurringExpenses: Math.round(recurringExpenses),
      fixedExpenses: Math.round(fixedExpenses),
      netProfit: Math.round(netProfit),
      operatingProfit: Math.round(operatingProfit),
      profitMargin: Math.round(profitMargin * 10) / 10,
      expenseRatio: Math.round(expenseRatio * 10) / 10,
      invoiceCount,
      avgInvoiceValue: Math.round(avgInvoiceValue),
      revenuePerClient: Math.round(revenuePerClient),
      revenuePerMember: Math.round(revenuePerMember),
    },
    operations: {
      activeClients,
      newClients,
      endedClients,
      billedClients: billedClientIds.size,
      teamSize,
      benchCount,
      activeProjects,
      overdueProjects,
      recurringProjects,
      renewalsDue,
      newProjects,
      taskCompletion,
      projectTypes: projectTypeCounts,
    },
    chartData,
    topClients,
    insights,
  });
}
