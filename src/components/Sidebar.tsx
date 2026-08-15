"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, Users, FileText, FileCheck, UserCheck, Wallet, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { type Permission } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/permissions";

const navItems: { label: string; href: string; icon: React.ElementType; permission: Permission }[] = [
  { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  { label: "Projects",   href: "/projects",  icon: FolderKanban,    permission: "view_projects" },
  { label: "Clients",    href: "/clients",   icon: Users,           permission: "view_clients" },
  { label: "Members",    href: "/members",   icon: UserCheck,       permission: "view_members" },
  { label: "Invoices",   href: "/invoices",  icon: FileText,        permission: "view_invoices" },
  { label: "Expenses",   href: "/expenses",  icon: Wallet,          permission: "view_expenses" },
  { label: "PO",         href: "/po",        icon: FileCheck,       permission: "view_po" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, can } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="w-60 h-screen shrink-0 bg-[#0F6E56] text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://commencesolutions.com/wp-content/uploads/2025/08/commence-logo.svg"
          alt="Commence Solutions"
          style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <p className="text-xs text-white/60 mt-2">Project Management</p>
      </div>

      {/* Nav — filtered by role */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.filter((item) => can(item.permission)).map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-white truncate">
            {user?.fullName ?? "Loading..."}
          </p>
          <p className="text-xs text-white/50 truncate">{user?.email}</p>
          {user?.role && (
            <span className="inline-block mt-1 text-[10px] bg-white/20 text-white/80 px-2 py-0.5 rounded-full">
              {ROLE_LABELS[user.role]}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
