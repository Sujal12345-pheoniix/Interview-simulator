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
    You are an expert technical interviewer.
    Generate 5 ${type} interview questions for a ${level} ${role} position.
    ${resumeText ? `Tailor some questions based on this resume extract: ${resumeText}` : ""}
    
    Ensure questions test different aspects appropriately.
    Return ONLY a JSON object exactly matching this schema:
    {
      "questions": [
        {
          "text": "The question text",
          "category": "Broad category (e.g., 'System Design', 'Behavioral', 'Algorithms')",
          "difficulty": "easy", // must be "easy", "medium", or "hard"
          "expectedAnswer": "Key points expected in a good answer"
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
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}
