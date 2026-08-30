import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuotationService {
  title: string;
  description: string;
  amount: number;
}

export interface IQuotation extends Document {
  quoteNumber: string;
  name: string;
  type: string;
  clientName: string;
  clientAttention?: string;
  clientAddress?: string;
  overview?: string;
  techStack: string[];
  timelineValue: number;
  timelineUnit: string;
  estimateLabel: string;
  services: IQuotationService[];
  features: string[];
  gstPercent: number;
  quoteDate: Date;
  validUntil: Date;
  notes?: string;
  commitment?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationServiceSchema = new Schema<IQuotationService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const QuotationSchema = new Schema<IQuotation>(
  {
    quoteNumber: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientAttention: { type: String, trim: true, default: "" },
    clientAddress: { type: String, trim: true, default: "" },
    overview: { type: String, default: "" },
    techStack: [{ type: String }],
    timelineValue: { type: Number, required: true, min: 1 },
    timelineUnit: { type: String, default: "Days" },
    estimateLabel: { type: String, default: "One-time cost estimation" },
    services: { type: [QuotationServiceSchema], default: [] },
    features: [{ type: String }],
    gstPercent: { type: Number, default: 18 },
    quoteDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    notes: { type: String, default: "" },
    commitment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Draft", "Open", "Pending", "Approved", "Close"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

QuotationSchema.pre("save", async function () {
  if (!this.quoteNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.Quotation.countDocuments();
    this.quoteNumber = `QT-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

const Quotation: Model<IQuotation> =
  mongoose.models.Quotation ?? mongoose.model<IQuotation>("Quotation", QuotationSchema);

export default Quotation;
