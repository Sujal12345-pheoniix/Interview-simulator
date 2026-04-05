import openai from "../openai";

export async function parseResume(resumeText: string): Promise<string> {
  const prompt = `
    Extract the key skills, professional experience, and notable projects from the following resume text.
    Return a concise summary combining these points, which will be used to generate personalized interview questions.
    
    Resume Text:
    ${resumeText}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error parsing resume:", error);
    return ""; // Soft fail: we can continue without resume context
  }
}
