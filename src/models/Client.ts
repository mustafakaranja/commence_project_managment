import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  name: string;
  onboardDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    onboardDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

const Client: Model<IClient> =
  mongoose.models.Client ?? mongoose.model<IClient>("Client", ClientSchema);

export default Client;
