import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskStatus = "Todo" | "In Progress" | "Done";

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string;
}

export type RecurringBy = "Monthly" | "Yearly";

export interface IProject extends Document {
  title: string;
  type: string;
  clientId: Types.ObjectId;
  members: string[];
  estimationDeadline: Date;
  tasks: ITask[];
  recurringBy?: RecurringBy | null;
  recurringDuration?: number | null;
  renewalDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Done"],
    default: "Todo",
  },
  assignedTo: { type: String },
});

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, default: "Fixed" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    members: [{ type: String }],
    estimationDeadline: { type: Date, required: true },
    tasks: [TaskSchema],
    recurringBy: { type: String, enum: ["Monthly", "Yearly"] },
    recurringDuration: { type: Number, min: 1 },
    renewalDate: { type: Date },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
