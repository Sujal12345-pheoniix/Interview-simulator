import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IQuestion extends Document {
  interviewId: mongoose.Types.ObjectId;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer?: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
  codeSubmission?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    expectedAnswer: {
      type: String,
    },
    userAnswer: {
      type: String,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
    },
    codeSubmission: {
      type: String,
    },
  },
  { timestamps: true }
);

const Question: Model<IQuestion> =
  models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
