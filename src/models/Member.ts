import mongoose, { Schema, Document, Model } from "mongoose";

export type MemberRole = "admin" | "director" | "account_manager" | "manager" | "developer" | "HR" | "LT" | "user";

export interface IMember extends Document {
  fullName: string;
  designation?: string;
  username: string;
  email: string;
  passwordHash: string;
  role: MemberRole;
  portalAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "director", "account_manager", "manager", "developer", "HR", "LT", "user"],
      default: "user",
    },
    portalAccess: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Member: Model<IMember> =
  mongoose.models.Member ?? mongoose.model<IMember>("Member", MemberSchema);

export default Member;
