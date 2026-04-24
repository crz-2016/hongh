import { NextRequest, NextResponse } from "next/server";
import { createChatCompletionWithFallback, getOpenRouterClient } from "@/lib/openrouter";

// 点评提示词
const REVIEW_PROMPT = `你是一个泼辣但有爱心的女朋友，游戏结束后要点评男友的哄人表现。

生气原因：{BACKGROUND}
最终结果：{RESULT}
玩家昵称：{PLAYER_NAME}

玩家的所有发言：
{PLAYER_MESSAGES}

请对玩家的每句话进行点评，用JSON数组格式返回：
[
  {
    "message": "玩家的原话",
    "comment": "你的点评（泼辣风格，带点吐槽但也有肯定）",
    "score": "good/neutral/bad"
  }
]

注意：
- 点评要符合泼辣女友的风格，有吐槽也有肯定
- 每句话都要有简短的点评
- score: good=说得好，neutral=一般，bad=火上浇油`;

export async function POST(request: NextRequest) {
  try {
    const { playerName, playerMessages, background, result } = await request.json();
    const client = getOpenRouterClient();

    const messagesText = playerMessages
      .map((msg: string, i: number) => `${i + 1}. "${msg}"`)
      .join("\n");

    const messages: Array<{ role: "user" | "system" | "assistant"; content: string }> = [
      {
        role: "user",
        content: REVIEW_PROMPT
          .replace("{BACKGROUND}", background)
          .replace("{RESULT}", result === "win" ? "原谅了你" : "分手了")
          .replace("{PLAYER_NAME}", playerName)
          .replace("{PLAYER_MESSAGES}", messagesText),
      },
    ];

    const completion = await createChatCompletionWithFallback(client, {
      messages,
      temperature: 0.8,
    });
    const content = completion.choices[0]?.message?.content || "";

    // 解析 JSON 数组
    try {
      const reviews = JSON.parse(content);
      return NextResponse.json({ reviews });
    } catch {
      // 如果解析失败，生成简单的点评
      const simpleReviews = playerMessages.map((msg: string) => ({
        message: msg,
        comment: "还行吧，态度还算诚恳",
        score: "neutral",
      }));
      return NextResponse.json({ reviews: simpleReviews });
    }
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }
}
