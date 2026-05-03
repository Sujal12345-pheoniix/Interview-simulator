import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API || process.env.GEMINI_API_KEY || "dummy" 
});

// We create a mocked OpenAI interface that maps calls to Gemini
const openai = {
  chat: {
    completions: {
      create: async (options: any) => {
        const prompt = options.messages[0].content;
        
        try {
          const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              temperature: options.temperature,
              responseMimeType: options.response_format?.type === "json_object" ? "application/json" : "text/plain",
            }
          });

          return {
            choices: [
              {
                message: {
                  content: res.text
                }
              }
            ]
          };
        } catch (error) {
          console.error("Gemini API Error:", error);
          throw error;
        }
      }
    }
  }
};

export default openai as any;
