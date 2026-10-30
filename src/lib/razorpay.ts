import { createHmac, timingSafeEqual } from "crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

export type RazorpayPaymentLink = {
  id: string;
  short_url: string;
  status: string;
  amount: number;
  currency: string;
  reference_id?: string;
};

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return { keyId, keySecret };
}

function authHeader() {
  const { keyId, keySecret } = credentials();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpay<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${RAZORPAY_API}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.error?.description || data?.error?.code || `Razorpay ${res.status} ${path}`;
    throw new Error(message);
  }
  return data as T;
}

export function createRazorpayPaymentLink(input: {
  amountPaise: number;
  invoiceNumber: string;
  referenceId: string;
  description: string;
  invoiceId: string;
  customerName?: string;
}) {
  return razorpay<RazorpayPaymentLink>("/payment_links", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      accept_partial: false,
      description: input.description,
      reference_id: input.referenceId.slice(0, 40),
      reminder_enable: false,
      notify: { sms: false, email: false },
      notes: {
        invoiceId: input.invoiceId,
        invoiceNumber: input.invoiceNumber,
      },
      ...(input.customerName
        ? { customer: { name: input.customerName.slice(0, 50) } }
        : {}),
    }),
  });
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
