// PostgreSQL schema definitions using raw SQL
// Tables: users, interviews, questions, results

export const ALTER_TABLES_SQL = `
  ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
  ALTER TABLE users ALTER COLUMN clerk_id DROP NOT NULL;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'clerk';
  ALTER TABLE interviews ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
`;

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'clerk',
    name TEXT NOT NULL,
    avatar TEXT,
    resume TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('behavioral', 'technical', 'coding')),
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    expected_answer TEXT,
    user_answer TEXT,
    code_submission TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score NUMERIC(4,1) NOT NULL,
    category_scores JSONB NOT NULL DEFAULT '{}',
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    ai_summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
  CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);
  CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
`;
