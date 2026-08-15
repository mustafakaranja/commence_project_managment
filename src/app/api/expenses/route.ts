import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Expense from "@/models/Expense";
import Client from "@/models/Client";
import { requireExpenseAccess } from "@/lib/require-director";
import { toExpenseFields, validateExpenseBody } from "@/lib/expense-payload";

export async function GET() {
  const denied = await requireExpenseAccess();
  if (denied) return denied;

  await connectDB();
  const expenses = await Expense.find()
    .populate("clientId", "name")
    .sort({ expenseDate: -1 })
    .lean();
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const denied = await requireExpenseAccess();
  if (denied) return denied;

  await connectDB();
  const body = await request.json();
  const invalid = validateExpenseBody(body);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  if (body.expenseFor === "Client") {
    const client = await Client.findById(body.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
  }

  const expense = await Expense.create(toExpenseFields(body));
  const populated = await expense.populate("clientId", "name");
  return NextResponse.json(populated, { status: 201 });
}
