import openai from "../openai";

export interface EvaluationResult {
  score: number; // 0–10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  confidence: number; // 0–10
  communication: number; // 0–10
  technical_accuracy: number; // 0–10
  improvements: string[];
}

/**
 * Evaluates a candidate's answer using Gemini 2.5 Flash.
 * Returns a structured JSON with score, feedback, strengths, weaknesses,
 * and additional sub-scores for communication, confidence, and technical accuracy.
 */
export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  expectedAnswer: string
): Promise<EvaluationResult> {
  const prompt = `You are a Senior Lead Engineer at a FAANG company conducting a real technical interview.
Evaluate the candidate's response rigorously and fairly.

Question: ${question}
Expected Key Points: ${expectedAnswer}
Candidate's Answer: ${userAnswer || "(no answer provided)"}

SCORING CRITERIA:
- Accuracy: Does it correctly address the core question?
- Depth: Does it show deep conceptual understanding?
- Communication: Is it clear, structured, and professional?
- Critical Thinking: Does it mention trade-offs or edge cases?

Return ONLY a JSON object exactly matching this schema:
{
  "score": 7,
  "feedback": "A detailed, professional breakdown (2-3 sentences). Highlight missing elements explicitly.",
  "strengths": ["Strength 1 (specific)", "Strength 2 (specific)"],
  "weaknesses": ["Missed trade-off between X and Y", "Did not address edge case Z"],
  "improvements": ["Concrete improvement 1", "Concrete improvement 2"],
  "confidence": 8,
  "communication": 7,
  "technical_accuracy": 6
}

Rules:
- score is 0–10 integer. 10 only for a perfect, nuanced, complete answer.
- Be strict but fair. An average answer scores 5–6.
- strengths and weaknesses must each have 2–3 items maximum.
- improvements must be specific and actionable (2–3 items).
- confidence, communication, technical_accuracy are 0–10 integers.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No evaluation content");

    const parsed = JSON.parse(content);

    // Validate and normalize
    return {
      score: Math.min(10, Math.max(0, parseInt(parsed.score) || 0)),
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "No feedback generated.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 4) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 4) : [],
      confidence: Math.min(10, Math.max(0, parseInt(parsed.confidence) || 0)),
      communication: Math.min(10, Math.max(0, parseInt(parsed.communication) || 0)),
      technical_accuracy: Math.min(10, Math.max(0, parseInt(parsed.technical_accuracy) || 0)),
    };
  } catch (error) {
    console.error("evaluateAnswer error:", error);
    throw error;
  }
}
