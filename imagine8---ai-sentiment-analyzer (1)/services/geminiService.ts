import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SentimentType, BatchAnalysisResponse } from "../types";

// Initialize Gemini Client
// Note: API Key is injected via process.env.API_KEY automatically in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash"; // Fast and cost-effective for NLP tasks

// Define the response schema for structured output
const sentimentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER, description: "The index of the text in the input array" },
          sentiment: { 
            type: Type.STRING, 
            enum: [SentimentType.POSITIVE, SentimentType.NEGATIVE, SentimentType.NEUTRAL],
            description: "The classified sentiment of the text"
          },
          confidence: { 
            type: Type.NUMBER, 
            description: "A score between 0.0 and 1.0 indicating confidence in the prediction" 
          },
          keywords: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "List of 1-3 specific words or short phrases from the text that drove the sentiment decision" 
          }
        },
        required: ["index", "sentiment", "confidence", "keywords"]
      }
    }
  }
};

export const analyzeTexts = async (texts: string[]): Promise<AnalysisResult[]> => {
  if (texts.length === 0) return [];

  // Prepare input for the model
  const prompt = `
    Analyze the sentiment of the following texts. 
    For each text, determine if it is Positive, Negative, or Neutral.
    Provide a confidence score (0.0 to 1.0).
    Extract key words or phrases that strongly influence the sentiment.
    
    Input Texts:
    ${JSON.stringify(texts.map((t, i) => ({ index: i, text: t.substring(0, 500) })))} 
  `;
  // Truncating text to 500 chars to avoid huge token usage in batch demos, 
  // but in prod this would be higher.

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sentimentSchema,
        systemInstruction: "You are an expert NLP Sentiment Analysis engine. Be precise and objective.",
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText);
    const items = parsed.items || [];

    // Map back to AnalysisResult
    return items.map((item: any) => ({
      id: crypto.randomUUID(),
      originalText: texts[item.index] || "",
      sentiment: item.sentiment as SentimentType,
      confidence: item.confidence,
      keywords: item.keywords,
      timestamp: Date.now(),
    }));

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
