"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { hasPermission } from "@/lib/permissions";

const ROLE_HOME: { permission: Parameters<typeof hasPermission>[1]; path: string }[] = [
  { permission: "view_dashboard", path: "/dashboard" },
  { permission: "view_projects",  path: "/projects" },
  { permission: "view_clients",   path: "/clients" },
  { permission: "view_invoices",  path: "/invoices" },
  { permission: "view_members",   path: "/members" },
  { permission: "view_po",        path: "/po" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const role = data.user?.role;
      const home = ROLE_HOME.find((r) => hasPermission(role, r.permission))?.path ?? "/projects";
      router.push(home);
      router.refresh();
    } else {
      const text = await res.text();
      let msg = "Invalid credentials.";
      try { msg = JSON.parse(text).error ?? msg; } catch { /* empty body */ }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://commencesolutions.com/wp-content/uploads/2025/08/commence-logo.svg"
            alt="Commence Solutions"
            className="h-10 w-auto mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p className="text-sm text-gray-500 mt-1">Project Management Portal</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription>Use your email or username to sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0F6E56] hover:bg-[#0d5e49]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Commence Solutions © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
