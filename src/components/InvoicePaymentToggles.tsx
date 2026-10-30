"use client";

import { Label } from "@/components/ui/label";

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Label className="text-sm text-gray-800">{label}</Label>
        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#0F6E56]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function InvoicePaymentToggles({
  showBankDetails,
  includeRazorpayLink,
  onChange,
}: {
  showBankDetails: boolean;
  includeRazorpayLink: boolean;
  onChange: (next: { showBankDetails: boolean; includeRazorpayLink: boolean }) => void;
}) {
  return (
    <div className="rounded-lg border border-[#0F6E56]/20 bg-[#E1F5EE] px-3 py-3 space-y-3">
      <p className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wide">Payment options</p>
      <ToggleRow
        label="Show bank details"
        hint="Print Kotak account details on this invoice"
        checked={showBankDetails}
        onCheckedChange={(showBankDetails) => onChange({ showBankDetails, includeRazorpayLink })}
      />
      <ToggleRow
        label="Razorpay pay link"
        hint="Generate a Razorpay link and show Pay Now"
        checked={includeRazorpayLink}
        onCheckedChange={(includeRazorpayLink) => onChange({ showBankDetails, includeRazorpayLink })}
      />
    </div>
  );
}
