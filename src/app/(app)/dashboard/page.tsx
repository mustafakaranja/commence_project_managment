"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FolderKanban, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  totalRevenue: number;
  activeProjects: number;
  activeClients: number;
  chartData: { month: string; revenue: number; expenses: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const metrics = data
    ? [
        {
          label: "Total Revenue",
          value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
          icon: DollarSign,
          desc: "All invoices combined",
        },
        {
          label: "Active Projects",
          value: data.activeProjects,
          icon: FolderKanban,
          desc: "Projects in progress",
        },
        {
          label: "Active Clients",
          value: data.activeClients,
          icon: Users,
          desc: "Without end date",
        },
      ]
    : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, here&apos;s your business overview.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))
          : metrics.map(({ label, value, icon: Icon, desc }) => (
              <Card key={label} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {label}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#0F6E56]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{desc}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses (Last 6 months)</CardTitle>
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
                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0F6E56" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#E1F5EE" radius={[4, 4, 0, 0]} name="Expenses" stroke="#0F6E56" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
