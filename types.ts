
export interface Character {
  id: string;
  name: string;
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
}

export interface AIResponse {
  favorabilityChange: number;
  newStatus: string;
  characterResponse: string;
  reasoning: string;
}
