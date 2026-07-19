import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMember extends Document {
  name: string;
  email?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { timestamps: true }
);

const Member: Model<IMember> =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

export default Member;
