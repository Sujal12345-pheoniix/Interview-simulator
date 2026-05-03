// PostgreSQL types replacing Mongoose models

export type InterviewType = "behavioral" | "technical" | "coding";
export type InterviewStatus = "pending" | "in_progress" | "completed";
export type Difficulty = "easy" | "medium" | "hard";

export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  avatar?: string;
  resume?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DbInterview {
  id: string;
  user_id: string;
  type: InterviewType;
  role: string;
  level: string;
  status: InterviewStatus;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
  questions?: DbQuestion[];
}

export interface DbQuestion {
  id: string;
  interview_id: string;
  text: string;
  category: string;
  difficulty: Difficulty;
  expected_answer?: string;
  user_answer?: string;
  code_submission?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface DbResult {
  id: string;
  interview_id: string;
  user_id: string;
  overall_score: number;
  category_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  ai_summary: string;
  created_at: Date;
  updated_at: Date;
}
