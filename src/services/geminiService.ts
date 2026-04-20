import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in the settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getMarketAnalysis(query: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following market query and provide insights: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error instanceof Error ? error.message : String(error));
    return "Unable to fetch live market analysis at this time.";
  }
}

export async function getTechnicalAnalysis(asset: string, currentPrice: number) {
  const prompt = `Provide a detailed technical analysis for ${asset} currently trading at ${currentPrice}. 
  Include:
  1. Current Trend (Bullish/Bearish/Neutral)
  2. Key Support and Resistance levels
  3. Technical Indicators (RSI, MACD, Moving Averages)
  4. A clear "Buy", "Sell", or "Hold" recommendation with a confidence score (0-100%).
  5. Short-term price target.
  Keep the tone professional and concise. Use Markdown for formatting. Respond in Arabic as the primary language, but keep technical terms in English if appropriate.`;
  
  return getMarketAnalysis(prompt);
}

export async function getTradeSignals() {
  try {
    const ai = getAI();
    const response = await (ai as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 3 high-probability trading signals for Crypto, Forex, and Stocks. Include entry price, stop-loss, and take-profit.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Signals Error:", error instanceof Error ? error.message : String(error));
    return "Unable to generate trade signals at this time.";
  }
}

export async function textToSpeech(text: string) {
  try {
    const ai = getAI();
    const response = await (ai as any).models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/pcm;rate=24000' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      await audio.play();
    }
  } catch (error) {
    console.error("TTS Error:", error instanceof Error ? error.message : String(error));
  }
}
