
import { GoogleGenAI, Type } from "@google/genai";
import { Character, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function evaluateInteraction(
  character: Character,
  userInput: string
): Promise<AIResponse> {
  const prompt = `
    你现在是一个专业的“社交行为分析助手”。
    用户正在记录他与现实生活中某个人的互动情况。你需要基于对方的性格特点和互动内容，分析这次行为对双方“好感度/关系亲密度”的影响。

    【记录对象资料】
    - 姓名：${character.name}
    - 现实关系：${character.relationshipType}
    - 性格特征：${character.personality}
    - 备注背景：${character.description}
    - 当前好感度：${character.favorability}%
    - 当前关系状态：${character.status}

    【互动描述记录】
    "${userInput}"

    【分析任务】
    1. 以专业、客观但带有治愈感的语气，给用户一段“行为影响分析报告” (characterResponse)。不要模仿对方说话，而是以第三人称分析。
    2. 判断好感度的变动 (favorabilityChange)，范围在 -15 到 +20 之间。
    3. 根据此次记录更新一个关系现状描述 (newStatus)。
    4. 给出详细的判定理由 (reasoning)。

    请严格以 JSON 格式输出：
    {
      "favorabilityChange": 数字,
      "newStatus": "现状文字",
      "characterResponse": "AI 分析报告内容",
      "reasoning": "系统判定的逻辑依据"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          favorabilityChange: { type: Type.NUMBER },
          newStatus: { type: Type.STRING },
          characterResponse: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: ["favorabilityChange", "newStatus", "characterResponse", "reasoning"],
      },
    },
  });

  return JSON.parse(response.text.trim()) as AIResponse;
}
