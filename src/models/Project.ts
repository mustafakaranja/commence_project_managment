import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskStatus = "Todo" | "In Progress" | "Done";

export interface ITask {
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string;
}

export interface IProject extends Document {
  title: string;
  type: string;
  clientId: Types.ObjectId;
  members: string[];
  estimationDeadline: Date;
  tasks: ITask[];
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
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
