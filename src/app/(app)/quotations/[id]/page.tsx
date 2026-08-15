"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import QuotationEditor, { quotationToForm } from "@/components/QuotationEditor";

type LoadedQuote = Parameters<typeof quotationToForm>[0] & { quoteNumber: string };

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<LoadedQuote | null>(null);
  const allowed = !!user && hasPermission(user.role, "edit_quotation", user.designation);

  useEffect(() => {
    if (authLoading) return;
    if (!allowed) {
      router.replace("/quotations");
      return;
    }
    let ignore = false;
    fetch(`/api/quotations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (ignore) return;
        if (data?.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setQuote(data);
        setLoading(false);
      });
    return () => { ignore = true; };
  }, [id, authLoading, allowed, router]);

  if (authLoading || !can("edit_quotation")) return null;

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !quote) {
    return <p className="p-8 text-sm text-red-500">{error || "Quotation not found."}</p>;
  }

  return (
    <QuotationEditor
      mode="edit"
      quoteId={id}
      initialNumber={quote.quoteNumber}
      initial={quotationToForm(quote)}
    />
  );
}
