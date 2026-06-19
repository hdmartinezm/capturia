// This file is overwritten at build time by amplify.yml with the actual API key
// For local development, set GOOGLE_GENERATIVE_AI_API_KEY in your .env.local
export const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
