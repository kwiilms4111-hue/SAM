export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: string;
}

export interface MindPrescription {
  title: string;
  comfortLetter: string;
  prescriptions: {
    step: number;
    title: string;
    description: string;
  }[];
  affirmation: string;
  date: string;
}

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';

export interface MoodLog {
  id: string;
  date: string;
  weather: WeatherType;
  stressScore: number; // 0 - 100
  note: string;
}

export interface CommunityNote {
  id: string;
  author: string; // e.g., "초등 3년차 김샘", "중등 10년차 박샘"
  grade: string; // "초등", "중등", "고등", "유치원/특수"
  content: string;
  likes: number;
  createdAt: string;
  tags: string[];
}

export interface SavedComfort {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'counseling' | 'prescription' | 'quote';
}

export interface StressCategoryScore {
  category: string;
  score: number; // percentage 0 - 100
  count: number;
  description: string;
}

export interface StressAnalysisData {
  primaryCategory: string;
  categoryScores: StressCategoryScore[];
  keyInsights: string[];
  counselingStrategy: string;
  totalAnalyzedMessages: number;
  lastAnalyzedAt: string;
}
