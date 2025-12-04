import { AIResponseSchema } from '../types';

// TEMPLATE: MOCK AI SERVICE
// =========================
// This service simulates an AI response so the UI can be tested without an API key.
// To use real AI:
// 1. Uncomment the GoogleGenAI imports
// 2. Restore the original generateRecommendations logic
// 3. Add your API_KEY to .env

// Mock Data for specific keyword triggers in the template
const MOCK_DB: Record<string, AIResponseSchema> = {
    "default": {
        targetAnime: null,
        recommendations: [
            {
                title: "Cowboy Bebop",
                description: "A jazz-inspired space western following a ragtag crew of bounty hunters.",
                genres: ["Action", "Sci-Fi", "Space"],
                rating: 9.5,
                reason: "A classic that defines the medium with style and substance."
            },
            {
                title: "Steins;Gate",
                description: "A self-proclaimed mad scientist discovers a way to send messages to the past.",
                genres: ["Sci-Fi", "Thriller"],
                rating: 9.1,
                reason: "Perfect for fans of complex narratives and time travel."
            },
            {
                title: "Cyberpunk: Edgerunners",
                description: "A street kid tries to survive in a technology and body modification-obsessed city of the future.",
                genres: ["Action", "Sci-Fi"],
                rating: 8.9,
                reason: "Visually stunning and matches the high-energy vibe."
            },
            {
                title: "Neon Genesis Evangelion",
                description: "Teenagers pilot giant mechs to protect humanity from mysterious beings known as Angels.",
                genres: ["Mecha", "Psychological"],
                rating: 8.5,
                reason: "A psychological deconstruction of the genre."
            }
        ]
    }
};

export const generateRecommendations = async (
  prompt: string,
  mode: string
): Promise<AIResponseSchema> => {
  console.log(`[MOCK AI] Generating recommendations for: "${prompt}"`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock data
  return MOCK_DB["default"];
};