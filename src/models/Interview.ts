import mongoose, { Schema, Document, models, Model } from "mongoose";

export type InterviewType = "behavioral" | "technical" | "coding";
export type InterviewStatus = "pending" | "in_progress" | "completed";

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  type: InterviewType;
  role: string;
  level: string;
  questions: mongoose.Types.ObjectId[];
  status: InterviewStatus;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["behavioral", "technical", "coding"],
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Interview: Model<IInterview> =
  models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;
