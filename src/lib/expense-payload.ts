import type { ExpenseFor, ExpenseType } from "@/models/Expense";

type ExpenseBody = {
  name?: string;
  description?: string;
  amount?: number | string;
  taxAmount?: number | string;
  type?: string;
  expenseFor?: string;
  clientId?: string;
  reimbursed?: boolean;
  expenseDate?: string;
};

export function validateExpenseBody(body: ExpenseBody): string | null {
  if (!body.name || body.amount === undefined || body.amount === "" || !body.type || !body.expenseFor || !body.expenseDate) {
    return "Name, amount, type, expenses for, and date are required.";
  }
  if (body.type !== "Recurring" && body.type !== "Fixed") {
    return "Type must be Recurring or Fixed.";
  }
  if (body.expenseFor !== "Organization" && body.expenseFor !== "Client") {
    return "Expenses for must be Organization or Client.";
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return "Amount must be a valid number.";
  }
  const tax = Number(body.taxAmount ?? 0);
  if (!Number.isFinite(tax) || tax < 0) {
    return "Tax amount must be a valid number.";
  }
  if (body.expenseFor === "Client" && !body.clientId) {
    return "Select a client for this expense.";
  }
  return null;
}

export function toExpenseFields(body: ExpenseBody) {
  const type: ExpenseType = body.type === "Recurring" ? "Recurring" : "Fixed";
  const expenseFor: ExpenseFor = body.expenseFor === "Client" ? "Client" : "Organization";
  return {
    name: String(body.name),
    description: body.description ?? "",
    amount: Number(body.amount),
    taxAmount: Number(body.taxAmount ?? 0),
    type,
    expenseFor,
    clientId: expenseFor === "Client" ? body.clientId : null,
    reimbursed: Boolean(body.reimbursed),
    expenseDate: new Date(String(body.expenseDate)),
  };
}
