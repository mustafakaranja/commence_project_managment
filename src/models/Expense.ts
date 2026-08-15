import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ExpenseType = "Recurring" | "Fixed";
export type ExpenseFor = "Organization" | "Client";

export interface IExpense extends Document {
  name: string;
  description?: string;
  amount: number;
  taxAmount: number;
  type: ExpenseType;
  expenseFor: ExpenseFor;
  clientId?: Types.ObjectId | null;
  reimbursed: boolean;
  expenseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    type: { type: String, enum: ["Recurring", "Fixed"], required: true },
    expenseFor: { type: String, enum: ["Organization", "Client"], required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", default: null },
    reimbursed: { type: Boolean, default: false },
    expenseDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense ?? mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
