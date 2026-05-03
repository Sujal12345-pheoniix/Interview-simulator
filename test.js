require('dotenv').config({path: '.env.local'});
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

async function main() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hi in json",
    });
    console.log("GEMINI SUCCESS", res.text);
  } catch (err) {
    console.error("GEMINI ERROR", err.message);
  }
}

main();
