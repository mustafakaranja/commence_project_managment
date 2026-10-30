import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvoiceItem {
  description: string;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientId: Types.ObjectId;
  invoiceDate: Date;
  address: string;
  amount: number;
  taxAmount?: number;
  invoiceFor: string;
  items: IInvoiceItem[];
  quoteId?: Types.ObjectId | null;
  quoteNumber?: string;
  status: string;
  showBankDetails?: boolean;
  includeRazorpayLink?: boolean;
  razorpayPaymentLinkId?: string;
  razorpayShortUrl?: string;
  razorpayPaymentStatus?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceDate: { type: Date, required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    invoiceFor: { type: String, required: true },
    items: { type: [InvoiceItemSchema], default: [] },
    quoteId: { type: Schema.Types.ObjectId, ref: "Quotation", default: null },
    quoteNumber: { type: String, default: "" },
    status: { type: String, enum: ["Draft", "Unpaid", "Paid", "Close"], default: "Draft" },
    showBankDetails: { type: Boolean, default: true },
    includeRazorpayLink: { type: Boolean, default: false },
    razorpayPaymentLinkId: { type: String, default: "" },
    razorpayShortUrl: { type: String, default: "" },
    razorpayPaymentStatus: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

InvoiceSchema.pre("save", async function () {
  if (this.invoiceNumber) return;
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const existing = await mongoose.models.Invoice.find(
    { invoiceNumber: new RegExp(`^${prefix}\\d+$`) },
    { invoiceNumber: 1 }
  ).lean();
  const max = existing.reduce((highest, row) => {
    const n = parseInt(String(row.invoiceNumber ?? "").slice(prefix.length), 10);
    return Number.isFinite(n) && n > highest ? n : highest;
  }, 0);
  this.invoiceNumber = `${prefix}${String(max + 1).padStart(3, "0")}`;
});

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
