import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchaseOrder extends Document {
  poNumber: string;
  name: string;
  type: string;
  clientName: string;
  clientAttention?: string;
  clientAddress?: string;
  packageName: string;
  tagline?: string;
  serviceType: string;
  listPrice: number;
  salePrice: number;
  durationMonths: number;
  renewalPrice: number;
  gstPercent: number;
  poDate: Date;
  validUntil: Date;
  topFeatures: string[];
  managedFeatures: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientAttention: { type: String, trim: true, default: "" },
    clientAddress: { type: String, trim: true, default: "" },
    packageName: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: "" },
    serviceType: { type: String, default: "Annual Subscription" },
    listPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    durationMonths: { type: Number, required: true, min: 1 },
    renewalPrice: { type: Number, required: true },
    gstPercent: { type: Number, default: 18 },
    poDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    topFeatures: [{ type: String }],
    managedFeatures: [{ type: String }],
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

PurchaseOrderSchema.pre("save", async function () {
  if (!this.poNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.models.PurchaseOrder.countDocuments();
    this.poNumber = `PO-${year}-${String(count + 1).padStart(3, "0")}`;
  }
});

const PurchaseOrder: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder ??
  mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);

export default PurchaseOrder;
