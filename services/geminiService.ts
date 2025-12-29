
import { GoogleGenAI, Type } from "@google/genai";
import { Character, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function evaluateInteraction(
  character: Character,
  userInput: string
): Promise<AIResponse> {
  const prompt = `
    你现在是一位精通社会心理学和人际关系分析的专家。
    用户正在记录他与现实生活中某个人的互动情况，你需要根据用户提供的“互动描述”，客观评估该行为对目标人物好感度的影响。

    【目标人物画像】
    - 姓名：${character.name}
    - 性格特征：${character.personality}
    - 背景/关系说明：${character.description}
    - 当前好感度分值：${character.favorability} (范围 -100 到 100)
    - 之前的心理状态：${character.status}

    【本次互动记录内容】
    "${userInput}"

    【分析任务】
    1. **好感度变动 (favorabilityChange)**：
       - 基于目标人物的性格，判断该行为会让他/她产生多少正向或负向的情绪价值。
       - 变动范围：-20 到 +20。
       - 逻辑：例如，如果对方性格“极度注重隐私”，用户打听其私生活应扣分；如果对方“看重行动”，用户提供实际帮助应大幅加分。
    2. **心理状态模拟 (newStatus)**：
       - 生成一个简短的短语，描述经历此互动后，对方在心理上如何定义用户。
       - 示例：“感到被冒犯”、“产生了一丝信任”、“觉得你很可靠”、“开始想要保持距离”。
    3. **专家解析 (characterResponse)**：
       - 以第三人称分析师的口吻，解读对方可能的心理活动和反应。
       - 示例：“基于其清冷的性格，你过于热情的行为可能让他感到了压力，虽然表面不言，但内心已产生防御机制。”
    4. **后台推理 (reasoning)**：
       - 简述你给出该分值的学术或逻辑依据。

    请严格按以下 JSON 格式输出：
    {
      "favorabilityChange": 数字,
      "newStatus": "新的心理状态短语",
      "characterResponse": "专家心理分析报告",
      "reasoning": "分析依据"
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
