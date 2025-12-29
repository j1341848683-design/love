
export type AIProvider = 'gemini' | 'siliconflow';

export interface Character {
  id: string;
  name: string;
  relationshipType: string;
  personality: string;
  description: string;
  avatarUrl: string;
  favorability: number;
  status: string;
  history: Interaction[];
}

export interface Interaction {
  id: string;
  userInput: string;
  characterResponse: string;
  favorabilityChange: number;
  timestamp: number;
  reasoning?: string;
}

export interface AIResponse {
  favorabilityChange: number;
  newStatus: string;
  characterResponse: string;
  reasoning: string;
}
