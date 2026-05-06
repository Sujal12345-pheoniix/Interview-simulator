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
    You are a Senior Lead Engineer at a FAANG company.
    Evaluate the candidate's response to the following question.
    
    Question: ${question}
    Expected Key Points: ${expectedAnswer}
    Candidate's Answer: ${userAnswer}
    
    CRITERIA:
    - Accuracy: Does it answer the core question correctly?
    - Depth: Does it show a deep understanding of the underlying concepts?
    - Communication: Is the answer clear, structured, and professional?
    - Critical Thinking: Does it mention trade-offs or edge cases?
    
    Return ONLY a JSON object exactly matching this schema:
    {
      "score": 8, // Integer from 0 to 10. Be rigorous. 10 is only for perfect, nuanced answers.
      "feedback": "A detailed, professional breakdown of the answer. Highlight what was missing.",
      "strengths": ["Clear technical articulation", "Deep understanding of X"],
      "weaknesses": ["Missed the trade-off between A and B", "Didn't mention edge case Y"]
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
