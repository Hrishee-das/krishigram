import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const extractKeywordsFromAudio = async (audioBuffer, mimeType) => {
  try {
    // Some basic mapping if mimeType is occasionally null/undefined
    const finalMimeType = mimeType || "audio/mp4";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: audioBuffer.toString("base64"),
            mimeType: finalMimeType,
          }
        },
        "Listen to this audio snippet. Provide a list of 3 to 5 core keywords or short phrases that summarize the main agricultural problem, crop, or topic discussed in the audio. Return ONLY the keywords separated by spaces. Do not use quotes or commas."
      ]
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to process audio with AI.");
  }
};