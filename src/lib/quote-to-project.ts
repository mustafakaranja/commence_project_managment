import { addDays, addMonths, addWeeks, format } from "date-fns";
import { isSubscriptionQuote } from "@/lib/quotation-catalog";

export type QuoteForProject = {
  _id?: string;
  quoteNumber?: string;
  name?: string;
  type?: string;
  clientName?: string;
  overview?: string;
  timelineValue?: number;
  timelineUnit?: string;
  quoteDate?: string | Date;
  services?: { title?: string; description?: string }[];
  specGroups?: { title?: string; items?: string[] }[];
  packageName?: string;
  durationMonths?: number;
  subscriptionYears?: number;
};

type ProjectTask = {
  title: string;
  description: string;
  status: "Todo";
  assignedTo: string;
};

function asDate(value?: string | Date) {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function dateOnly(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export function quoteDeadline(quote: QuoteForProject): Date {
  const start = asDate(quote.quoteDate);
  if (isSubscriptionQuote(quote.type)) {
    const months =
      Number(quote.durationMonths) || (Number(quote.subscriptionYears) || 1) * 12;
    return addMonths(start, months);
  }
  const n = Number(quote.timelineValue) || 1;
  const unit = quote.timelineUnit || "Days";
  if (unit === "Weeks") return addWeeks(start, n);
  if (unit === "Months") return addMonths(start, n);
  return addDays(start, n);
}

function tasksFromQuote(quote: QuoteForProject): ProjectTask[] {
  if (isSubscriptionQuote(quote.type)) {
    const tasks: ProjectTask[] = [];
    for (const group of quote.specGroups ?? []) {
      for (const item of group.items ?? []) {
        const title = String(item).trim();
        if (!title) continue;
        tasks.push({
          title,
          description: group.title ?? "",
          status: "Todo",
          assignedTo: "",
        });
      }
    }
    return tasks;
  }

  return (quote.services ?? [])
    .map((row) => ({
      title: String(row.title ?? "").trim(),
      description: String(row.description ?? "").trim(),
      status: "Todo" as const,
      assignedTo: "",
    }))
    .filter((row) => row.title);
}

export function quoteToProjectPayload(quote: QuoteForProject) {
  const subscription = isSubscriptionQuote(quote.type);
  const deadline = quoteDeadline(quote);
  const years = Number(quote.subscriptionYears) || 1;
  const months = Number(quote.durationMonths) || years * 12;
  const yearly = subscription && months % 12 === 0;
  let tasks = tasksFromQuote(quote);
  const title = String(quote.name || quote.packageName || "Project").trim();
  if (tasks.length === 0) {
    tasks = [{
      title,
      description: String(quote.overview ?? "").trim(),
      status: "Todo",
      assignedTo: "",
    }];
  }

  return {
    title,
    type: subscription ? "Recurring" : "Fixed",
    estimationDeadline: dateOnly(deadline),
    recurringBy: subscription ? (yearly ? "Yearly" : "Monthly") : undefined,
    recurringDuration: subscription ? (yearly ? months / 12 : months) : undefined,
    renewalDate: subscription ? dateOnly(deadline) : undefined,
    tasks,
    quoteId: quote._id ?? null,
    quoteNumber: quote.quoteNumber ?? "",
  };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
