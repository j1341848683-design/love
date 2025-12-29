
import { GoogleGenAI, Type } from "@google/genai";
import { Character, AIResponse } from "../types";

const getSystemPrompt = (character: Character, userInput: string) => `
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
1. 以客观但带有温情的语气，给用户一段“行为影响分析报告” (characterResponse)。
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

/**
 * 核心：获取最新的 AI 实例
 * 每次调用都重新创建以确保 API_KEY 的即时性 (遵循 SDK 关于 API Key Selection 的指南)
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("未检测到有效的 API Key");
  return new GoogleGenAI({ apiKey });
};

/**
 * 连通性测试：验证 API 是否可用
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const ai = getAIClient();
    // 遵循 SDK 指南：设置 maxOutputTokens 时必须同时设置 thinkingBudget 以预留输出空间
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
      config: { 
        maxOutputTokens: 5,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return true;
  } catch (e) {
    console.error("AI Connection Test Failed:", e);
    return false;
  }
}

/**
 * 核心互动评估逻辑
 */
export async function evaluateInteraction(
  character: Character,
  userInput: string
): Promise<AIResponse> {
  const ai = getAIClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: getSystemPrompt(character, userInput),
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

  // 遵循 SDK 指南：直接访问 .text 属性 (Property, not a method)
  const text = response.text;
  if (!text) throw new Error("AI 返回了空数据");
  
  return JSON.parse(text.trim());
}
