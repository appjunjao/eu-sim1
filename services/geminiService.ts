import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (currentPrice: number, trend: 'UP' | 'DOWN' | 'FLAT'): Promise<MarketAnalysis> => {
  try {
    const prompt = `
      You are a Forex Market Analyst for a trading game.
      Current EUR/USD Price: ${currentPrice.toFixed(4)}.
      Recent Trend: ${trend}.
      
      Generate a realistic, short financial news headline and a brief analysis explaining the move. 
      Determine if the sentiment is BULLISH, BEARISH, or NEUTRAL.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            analysis: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] }
          },
          required: ["headline", "analysis", "sentiment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MarketAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      headline: "Market waiting for news...",
      analysis: "Technical indicators are mixed. Tread carefully.",
      sentiment: "NEUTRAL"
    };
  }
};
