import openai from "../openai";

export interface ReportContent {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiSummary: string;
}

export async function generateInterviewReport(
  questions: Array<{ text: string; category: string }>,
  answers: Array<{ score: number; feedback: string; strengths: string[]; weaknesses: string[] }>
): Promise<ReportContent> {
  // Compute basic scores locally
  let totalScore = 0;
  const categoryCount: Record<string, { total: number; count: number }> = {};
  
  const formattedData = questions.map((q, i) => {
    const ans = answers[i] || { score: 0, feedback: "No answer provided", strengths: [], weaknesses: [] };
    
    totalScore += ans.score;
    
    if (!categoryCount[q.category]) {
      categoryCount[q.category] = { total: 0, count: 0 };
    }
    categoryCount[q.category].total += ans.score;
    categoryCount[q.category].count += 1;
    
    return [
      `Q: ${q.text}`,
      `Score: ${ans.score}/10`,
      `Feedback: ${ans.feedback || "No feedback"}`,
      `Strengths: ${ans.strengths.join(", ") || "N/A"}`,
      `Weaknesses: ${ans.weaknesses.join(", ") || "N/A"}`,
    ].join("\n");
  });

  const overallScore = Math.round((totalScore / Math.max(questions.length, 1)) * 10) / 10;
  const categoryScores: Record<string, number> = {};
  
  Object.keys(categoryCount).forEach(cat => {
    categoryScores[cat] = Math.round((categoryCount[cat].total / categoryCount[cat].count) * 10) / 10;
  });

  // Let AI generate summary, overarching strengths/weaknesses and recommendations
  const prompt = `
    Based on the following performance data from a technical interview, generate a holistic evaluation report.
    
    Overall Score: ${overallScore}/10
    Category Breakdowns: ${JSON.stringify(categoryScores)}
    
    Detailed Performance:
    ${formattedData.join("\n\n")}
    
    Return ONLY a JSON object matching this schema:
    {
      "aiSummary": "A concise paragraph summarizing the candidate's overall performance and trajectory.",
      "strengths": ["Top overall strength 1", "Top overall strength 2", "Top overall strength 3"],
      "weaknesses": ["Concrete recurring mistake 1", "Concrete recurring mistake 2", "Concrete recurring mistake 3"],
      "recommendations": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3", "Actionable advice 4"]
    }

    Rules:
    - Weaknesses must explicitly mention a mistake pattern, not generic phrasing.
    - Recommendations must be specific, measurable, and tied to weaknesses.
    - Keep each bullet under 120 characters.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for the final aggregation step to save costs/time, or stick to 4o
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No report generated");

    const parsed = JSON.parse(content);

    const normalizeList = (value: unknown, fallback: string[]) => {
      if (!Array.isArray(value)) return fallback;
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 6);
    };

    const aiSummary =
      typeof parsed.aiSummary === "string" && parsed.aiSummary.trim()
        ? parsed.aiSummary.trim()
        : "You showed promise, with clear strengths and specific areas to improve next.";
    
    return {
      overallScore,
      categoryScores,
      aiSummary,
      strengths: normalizeList(parsed.strengths, ["Communicates ideas with reasonable clarity."]),
      weaknesses: normalizeList(parsed.weaknesses, ["Needs deeper and more structured answer depth."]),
      recommendations: normalizeList(parsed.recommendations, ["Practice two timed mock questions daily and review gaps immediately."]),
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
