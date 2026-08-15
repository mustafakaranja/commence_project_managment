"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Building2,
  Users,
  FolderKanban,
  Receipt,
  UserCheck,
  AlertTriangle,
  Landmark,
  RefreshCw,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/lib/auth-context";

interface DashboardData {
  year: number | "all";
  availableYears: number[];
  financials: {
    totalRevenue: number;
    orgExpenses: number;
    clientExpenses: number;
    totalExpenses: number;
    reimbursedExpenses: number;
    unreimbursedExpenses: number;
    recurringExpenses: number;
    fixedExpenses: number;
    netProfit: number;
    operatingProfit: number;
    profitMargin: number;
    expenseRatio: number;
    invoiceCount: number;
    avgInvoiceValue: number;
    revenuePerClient: number;
    revenuePerMember: number;
  };
  operations: {
    activeClients: number;
    newClients: number;
    endedClients: number;
    billedClients: number;
    teamSize: number;
    benchCount: number;
    activeProjects: number;
    overdueProjects: number;
    recurringProjects: number;
    renewalsDue: number;
    newProjects: number;
    taskCompletion: number;
    projectTypes: Record<string, number>;
  };
  chartData: { month: string; revenue: number; expenses: number }[];
  topClients: { name: string; revenue: number; share: number }[];
  insights: { tone: "success" | "warning" | "info"; text: string }[];
}

function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function MetricCard({
  label,
  value,
  desc,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  desc: string;
  icon: React.ElementType;
  tone?: "good" | "bad" | "warn";
}) {
  const valueClass =
    tone === "good"
      ? "text-[#0F6E56]"
      : tone === "bad"
      ? "text-red-600"
      : tone === "warn"
      ? "text-amber-700"
      : "text-gray-900";
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#0F6E56]" />
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = ["#0F6E56", "#94C7B6", "#F59E0B", "#E5E7EB"];

export default function DashboardPage() {
  const router = useRouter();
  const { can, loading: authLoading } = useAuth();
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !can("view_dashboard")) {
      router.replace("/projects");
    }
  }, [authLoading, can, router]);

  useEffect(() => {
    if (authLoading || !can("view_dashboard")) return;
    let ignore = false;
    setLoading(true);
    fetch(`/api/dashboard?year=${year}`)
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) {
          setData(d);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [authLoading, can, year]);

  const f = data?.financials;
  const op = data?.operations;
  const period = year === "all" ? "all time" : year;

  const expensePie = f
    ? [
        { name: "Organization", value: f.orgExpenses },
        { name: "Client", value: f.clientExpenses },
      ].filter((s) => s.value > 0)
    : [];

  const costPie = f
    ? [
        { name: "Unreimbursed", value: f.unreimbursedExpenses },
        { name: "Reimbursed", value: f.reimbursedExpenses },
      ].filter((s) => s.value > 0)
    : [];

  const insightClass: Record<DashboardData["insights"][number]["tone"], string> = {
    success: "border-[#0F6E56]/20 bg-[#E1F5EE] text-[#0F6E56]",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    info: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Company earnings, organisation spend, and delivery health for {period}.
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500">Year</p>
          <Select value={year} onValueChange={(v) => setYear(v ?? currentYear)}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {(data?.availableYears?.length ? data.availableYears : [Number(currentYear)]).map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-2 mb-8">
          {data.insights.map((insight) => (
            <div
              key={insight.text}
              className={`rounded-lg border px-4 py-2.5 text-sm ${insightClass[insight.tone]}`}
            >
              {insight.text}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Earnings & spend</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {loading || !f
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-32" /></CardContent></Card>
            ))
          : (
            <>
              <MetricCard
                label="Total revenue"
                value={rupees(f.totalRevenue)}
                desc={`${f.invoiceCount} invoice${f.invoiceCount === 1 ? "" : "s"} billed · incl. tax`}
                icon={DollarSign}
              />
              <MetricCard
                label="Organisation expenses"
                value={rupees(f.orgExpenses)}
                desc="Internal / company spend"
                icon={Building2}
              />
              <MetricCard
                label="Total expenses"
                value={rupees(f.totalExpenses)}
                desc={`Org ${rupees(f.orgExpenses)} · Client ${rupees(f.clientExpenses)}`}
                icon={Wallet}
              />
              <MetricCard
                label="Net profit"
                value={rupees(f.netProfit)}
                desc={`${f.profitMargin}% margin · revenue minus all expenses`}
                icon={TrendingUp}
                tone={f.netProfit > 0 ? "good" : f.netProfit < 0 ? "bad" : undefined}
              />
            </>
          )}
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profitability</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {loading || !f
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={`p${i}`}><CardContent className="pt-6"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-32" /></CardContent></Card>
            ))
          : (
            <>
              <MetricCard
                label="Operating profit"
                value={rupees(f.operatingProfit)}
                desc="Revenue minus unreimbursed cost"
                icon={Landmark}
                tone={f.operatingProfit >= 0 ? "good" : "bad"}
              />
              <MetricCard
                label="Unreimbursed cost"
                value={rupees(f.unreimbursedExpenses)}
                desc={`${rupees(f.reimbursedExpenses)} already reimbursed`}
                icon={Receipt}
                tone={f.unreimbursedExpenses > f.totalRevenue * 0.4 && f.totalRevenue > 0 ? "warn" : undefined}
              />
              <MetricCard
                label="Avg invoice"
                value={rupees(f.avgInvoiceValue)}
                desc={`₹ per billed client ${rupees(f.revenuePerClient)}`}
                icon={Percent}
              />
              <MetricCard
                label="Revenue / member"
                value={rupees(f.revenuePerMember)}
                desc={`Expense ratio ${f.expenseRatio}% of revenue`}
                icon={UserCheck}
              />
            </>
          )}
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Delivery snapshot</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {loading || !op
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={`o${i}`}><CardContent className="pt-6"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-32" /></CardContent></Card>
            ))
          : (
            <>
              <MetricCard
                label="Active clients"
                value={op.activeClients}
                desc={`${op.newClients} onboarded · ${op.endedClients} ended · ${op.billedClients} billed`}
                icon={Users}
              />
              <MetricCard
                label="Team"
                value={op.teamSize}
                desc={`${op.benchCount} on bench · not assigned to a project`}
                icon={UserCheck}
              />
              <MetricCard
                label="Active projects"
                value={op.activeProjects}
                desc={`${op.newProjects} started in period · ${op.taskCompletion}% tasks done`}
                icon={FolderKanban}
              />
              <MetricCard
                label="Renewals due"
                value={op.renewalsDue}
                desc={`${op.recurringProjects} recurring · ${op.overdueProjects} past deadline`}
                icon={RefreshCw}
                tone={op.renewalsDue > 0 ? "warn" : undefined}
              />
            </>
          )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        <Card className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue vs expenses ({period})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.chartData ?? []} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => rupees(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0F6E56" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#94C7B6" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Expense mix</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : expensePie.length === 0 && costPie.length === 0 ? (
              <p className="text-sm text-gray-400 py-16 text-center">No expenses in this period.</p>
            ) : (
              <div className="space-y-4">
                {expensePie.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={expensePie} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={2}>
                        {expensePie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => rupees(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {f && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Recurring spend {rupees(f.recurringExpenses)} · Fixed {rupees(f.fixedExpenses)}</p>
                    <p>Unreimbursed {rupees(f.unreimbursedExpenses)} · Reimbursed {rupees(f.reimbursedExpenses)}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top clients by revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : !data?.topClients.length ? (
              <p className="text-sm text-gray-400 py-8 text-center">No invoices in this period.</p>
            ) : (
              <div className="space-y-3">
                {data.topClients.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate pr-2">{c.name}</span>
                      <span className="text-gray-600 shrink-0">{rupees(c.revenue)} · {c.share}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-[#0F6E56] rounded-full" style={{ width: `${Math.min(c.share, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Project mix & delivery</CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !op ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(op.projectTypes).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type} · {count}
                    </Badge>
                  ))}
                  {Object.keys(op.projectTypes).length === 0 && (
                    <p className="text-sm text-gray-400">No projects yet.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Task completion</p>
                    <p className="text-lg font-semibold text-gray-900">{op.taskCompletion}%</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Past deadline</p>
                    <p className={`text-lg font-semibold ${op.overdueProjects > 0 ? "text-amber-700" : "text-gray-900"}`}>
                      {op.overdueProjects}
                    </p>
                  </div>
                </div>
                {op.renewalsDue > 0 && (
                  <p className="text-xs text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Create invoices for {op.renewalsDue} upcoming renewal{op.renewalsDue === 1 ? "" : "s"}.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
