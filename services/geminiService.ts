import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, LyricWord } from "../types";

const API_KEY = process.env.API_KEY || '';

const getAiClient = () => {
  if (!API_KEY) {
    console.error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const analyzeAudioTrack = async (audioBase64: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a professional radio content moderator. 
    1. Listen to the audio track provided.
    2. Transcribe the lyrics word for word.
    3. Analyze each word or phrase for obscenity, profanity, hate speech, or sexually explicit content suitable for radio broadcast regulations (FCC-style rules).
    4. Return a JSON object. 
    
    The output must be strictly JSON matching this schema:
    {
      "rating": "Clean" | "Explicit" | "Risky",
      "summary": "A brief summary of why this rating was given.",
      "lyrics": [
        { "text": "word", "isExplicit": boolean, "reason": "optional reason if explicit" }
      ],
      "confidence": number (0-100)
    }
    
    Split the lyrics into natural small chunks or individual words to allow for precise highlighting. 
    If it's instrumental, indicate that in the summary and return empty lyrics or description of sound.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rating: { type: Type.STRING, enum: ["Clean", "Explicit", "Risky"] },
          summary: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          lyrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                isExplicit: { type: Type.BOOLEAN },
                reason: { type: Type.STRING, nullable: true }
              },
              required: ["text", "isExplicit"]
            }
          }
        },
        required: ["rating", "summary", "lyrics", "confidence"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AnalysisResult;
};

export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are a helpful assistant for a Radio DJ software. You answer questions about music theory, artist history, or broadcasting regulations."
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' }, // Friendly, energetic voice suitable for radio tool
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
