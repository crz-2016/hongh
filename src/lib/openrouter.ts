import OpenAI from "openai";
import { existsSync } from "fs";
import { join } from "path";
import { config as loadDotenv } from "dotenv";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

let client: OpenAI | null = null;
let envLoaded = false;

function loadEnv(): void {
  if (envLoaded) return;

  const candidates = [
    join(process.cwd(), "src/.env.local"),
    join(process.cwd(), ".env.local"),
    join(process.cwd(), "src/.env"),
    join(process.cwd(), ".env"),
  ];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath, override: false });
    }
  }

  envLoaded = true;
}

export function getOpenRouterClient(): OpenAI {
  if (client) return client;
  loadEnv();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  client = new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
  });

  return client;
}

export function getOpenRouterModel(): string {
  loadEnv();
  return process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

function getOpenRouterFallbackModels(): string[] {
  loadEnv();
  const raw = process.env.OPENROUTER_FALLBACK_MODELS || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getOpenRouterModels(): string[] {
  const primary = getOpenRouterModel();
  const fallbacks = getOpenRouterFallbackModels();
  return Array.from(new Set([primary, ...fallbacks]));
}

function isRetriableProviderError(error: unknown): boolean {
  if (typeof error !== "object" || !error) return false;
  const status = (error as { status?: number }).status;
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export async function createChatCompletionWithFallback(
  client: OpenAI,
  request: {
    messages: Array<{ role: "user" | "system" | "assistant"; content: string }>;
    temperature?: number;
  },
) {
  let lastError: unknown;
  const models = getOpenRouterModels();

  for (const model of models) {
    try {
      return await client.chat.completions.create({
        model,
        messages: request.messages,
        temperature: request.temperature,
      });
    } catch (error) {
      lastError = error;
      if (!isRetriableProviderError(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("OpenRouter request failed");
}

export async function createChatStreamWithFallback(
  client: OpenAI,
  request: {
    messages: Array<{ role: "user" | "system" | "assistant"; content: string }>;
    temperature?: number;
  },
) {
  let lastError: unknown;
  const models = getOpenRouterModels();

  for (const model of models) {
    try {
      return await client.chat.completions.create({
        model,
        messages: request.messages,
        temperature: request.temperature,
        stream: true,
      });
    } catch (error) {
      lastError = error;
      if (!isRetriableProviderError(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("OpenRouter stream request failed");
}
