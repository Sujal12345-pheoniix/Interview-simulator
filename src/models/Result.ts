import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IResult extends Document {
  interviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  overallScore: number;
  categoryScores: Map<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiSummary: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    categoryScores: {
      type: Map,
      of: Number,
      required: true,
    },
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    aiSummary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Result: Model<IResult> = models.Result || mongoose.model<IResult>("Result", ResultSchema);

export default Result;
