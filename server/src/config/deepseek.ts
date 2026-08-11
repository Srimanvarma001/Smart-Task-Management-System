import { AppError } from "../utils/AppError";
import { config } from "./env";

export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export const DEEPSEEK_MODEL = "deepseek-v4-flash";

export const DEEPSEEK_MAX_TOKENS = 500;

export const DEEPSEEK_TIMEOUT_MS = 15_000;

export interface DeepSeekMessage {
  role: "system" | "user";
  content: string;
}

export interface DeepSeekOptions {
  maxTokens?: number;
  json?: boolean;
}

export async function callDeepSeek(messages: DeepSeekMessage[], options: DeepSeekOptions = {}): Promise<string> {
  if (!config.deepseekApiKey) {
    throw new AppError(502, "AI service is not configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.deepseekApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        max_tokens: options.maxTokens ?? DEEPSEEK_MAX_TOKENS,
        thinking: { type: "disabled" },
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      throw new AppError(502, `AI service returned status ${response.status}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.length === 0) {
      throw new AppError(502, "AI service returned an empty response");
    }

    return content;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(502, err instanceof Error ? `AI service unavailable: ${err.message}` : "AI service unavailable");
  } finally {
    clearTimeout(timer);
  }
}