import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  clientId: Types.ObjectId;
  invoiceDate: Date;
  address: string;
  amount: number;
  taxAmount?: number;
  invoiceFor: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceDate: { type: Date, required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    invoiceFor: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-generate invoice number before saving
InvoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.Invoice.countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
