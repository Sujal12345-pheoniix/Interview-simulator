import openai from "../openai";

export interface EvaluationResult {
  score: number; // 0-10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  expectedAnswer: string
): Promise<EvaluationResult> {
  const prompt = `
    You are an expert technical interviewer evaluating a candidate's answer.
    
    Question: ${question}
    Ideal Answer context: ${expectedAnswer}
    Candidate's Answer: ${userAnswer}
    
    Evaluate the candidate's answer against the ideal context.
    Return ONLY a JSON object exactly matching this schema:
    {
      "score": 8, // Integer from 0 to 10
      "feedback": "Constructive feedback on the answer...",
      "strengths": ["Clear communication", "Identified the core issue"],
      "weaknesses": ["Missed edge cases", "Lack of depth in optimization"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No evaluation generated");

    return JSON.parse(content) as EvaluationResult;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
}
