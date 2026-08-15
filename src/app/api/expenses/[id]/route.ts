import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Expense from "@/models/Expense";
import Client from "@/models/Client";
import { requireExpenseAccess } from "@/lib/require-director";
import { toExpenseFields, validateExpenseBody } from "@/lib/expense-payload";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireExpenseAccess();
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
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

  const fields = toExpenseFields(body);
  const { clientId, ...rest } = fields;
  const update =
    fields.expenseFor === "Organization"
      ? { $set: rest, $unset: { clientId: "" } }
      : { $set: fields };

  const expense = await Expense.findByIdAndUpdate(id, update, { new: true }).populate(
    "clientId",
    "name"
  );

  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(expense);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireExpenseAccess();
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
  await Expense.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
