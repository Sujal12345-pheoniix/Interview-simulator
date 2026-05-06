import openai from "../openai";

export interface GeneratedQuestion {
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer: string;
}

export async function generateQuestions(
  role: string,
  level: string,
  type: string,
  resumeText?: string
): Promise<GeneratedQuestion[]> {
  const prompt = `
    You are an elite recruiter from a top-tier tech company (like Google, Meta, or Netflix).
    Generate 5 high-quality ${type} interview questions for a ${level} ${role} position.
    
    ${resumeText ? `CRITICAL: Carefully analyze this resume extract and tailor 2-3 questions specifically to the candidate's projects, stack, and experience level: ${resumeText}` : "Since no resume was provided, generate standard but challenging questions for this role."}
    
    GUIDELINES:
    1. Technical: Focus on real-world problem solving, scalability, and deep understanding.
    2. Behavioral: Use the STAR method format and focus on leadership, conflict resolution, and growth.
    3. Coding: Focus on efficient algorithms, edge cases, and clean code principles.
    
    Return ONLY a JSON object exactly matching this schema:
    {
      "questions": [
        {
          "text": "The question text (detailed and professional)",
          "category": "Broad category (e.g., 'System Design', 'Behavioral', 'Algorithms', 'Concurrency')",
          "difficulty": "easy", // must be "easy", "medium", or "hard"
          "expectedAnswer": "Comprehensive list of key points, edge cases, and trade-offs the candidate should mention."
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);
    return parsed.questions;
  } catch (error: any) {
    console.error("Error generating questions:", error);
    throw error;
  }
}
