
export interface Anime {
  id: string;
  mal_id?: number;
  title: string;
  rating: number | string; // Score
  genres: string[];
  description: string;
  imageUrl: string;
  year?: number;
  episodes?: number;
  rank?: number;
  status?: string;
  matchScore?: number; // For AI recommendations
  reason?: string; // AI reasoning
  isTarget?: boolean; // If this is the specific anime user searched for
  members?: number; // For popularity sorting
  broadcastTime?: string; // e.g. "23:00 (JST)"
  airedString?: string; // e.g. "Spring 2025" or "Oct 4, 2024"
  airedFrom?: string; // ISO Date string for start date
}

export enum RecommendationMode {
  GENERAL = 'GENERAL',
  MOOD = 'MOOD',
  SIMILAR = 'SIMILAR'
}

export interface AIResponseSchema {
  targetAnime?: string | null; // The specific anime identified from prompt
  recommendations: Array<{
    title: string;
    description: string;
    genres: string[];
    rating: number;
    reason: string;
  }>;
}
