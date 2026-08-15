"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import QuotationEditor from "@/components/QuotationEditor";

export default function NewQuotationPage() {
  const { can, loading, user } = useAuth();
  const router = useRouter();
  const allowed = !!user && hasPermission(user.role, "add_quotation", user.designation);

  useEffect(() => {
    if (loading) return;
    if (!allowed) router.replace("/quotations");
  }, [loading, allowed, router]);

  if (loading || !can("add_quotation")) return null;
  return <QuotationEditor mode="create" />;
}
