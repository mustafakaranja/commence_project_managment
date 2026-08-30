import type { ITask, RecurringBy } from "@/models/Project";

type ProjectBody = {
  title?: string;
  type?: string;
  clientId?: string;
  members?: string[];
  estimationDeadline?: string;
  tasks?: ITask[];
  recurringBy?: string;
  recurringDuration?: number | string;
  renewalDate?: string;
  quoteId?: string | null;
  quoteNumber?: string;
};

export function validateProjectBody(body: ProjectBody): string | null {
  if (!body.title || !body.clientId || !body.estimationDeadline) {
    return "Title, client, and deadline are required.";
  }
  if (body.type !== "Recurring") return null;

  if (body.recurringBy !== "Monthly" && body.recurringBy !== "Yearly") {
    return "Recurring by (Monthly or Yearly) is required.";
  }
  const duration = Number(body.recurringDuration);
  if (!Number.isInteger(duration) || duration < 1) {
    return body.recurringBy === "Monthly"
      ? "Enter how many months."
      : "Enter how many years.";
  }
  if (!body.renewalDate) {
    return "Renewal date is required for recurring projects.";
  }
  return null;
}

export function toProjectFields(body: ProjectBody) {
  const type = body.type || "Fixed";
  const isRecurring = type === "Recurring";
  const base = {
    title: String(body.title),
    type,
    clientId: body.clientId,
    members: body.members ?? [],
    estimationDeadline: new Date(String(body.estimationDeadline)),
    tasks: (body.tasks ?? []).filter((t) => String(t.title ?? "").trim()),
  };
  const withQuote =
    body.quoteId !== undefined || body.quoteNumber !== undefined
      ? { ...base, quoteId: body.quoteId || null, quoteNumber: body.quoteNumber ?? "" }
      : base;
  if (!isRecurring) return withQuote;
  return {
    ...withQuote,
    recurringBy: body.recurringBy as RecurringBy,
    recurringDuration: Number(body.recurringDuration),
    renewalDate: new Date(String(body.renewalDate)),
  };
}

export function toProjectUpdate(body: ProjectBody) {
  const fields = toProjectFields(body);
  if (body.type === "Recurring") {
    return { $set: fields };
  }
  return {
    $set: fields,
    $unset: { recurringBy: "", recurringDuration: "", renewalDate: "" },
  };
}
