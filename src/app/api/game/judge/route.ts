import { NextRequest, NextResponse } from "next/server";
import { createChatCompletionWithFallback, getOpenRouterClient } from "@/lib/openrouter";

// 判断玩家话语效果的提示词
const JUDGE_PROMPT = `你是一个"求生欲测试"的裁判。根据以下信息判断玩家说的话是好是坏：

当前愤怒值：{ANGER}/100
玩家说的话："{PLAYER_INPUT}"
对话历史：{HISTORY}

请判断这句话的效果，并给出一个JSON格式的回答：
{
  "effect": "good" | "neutral" | "bad",
  "angerChange": -10到10之间的整数（负数=愤怒值下降，正数=愤怒值上升）,
  "reason": "简短的判断理由"
}

注意：
- 好话（道歉、真诚、哄人）：angerChange 为负数
- 坏话（火上浇油、敷衍、不真诚）：angerChange 为正数
- 增减幅度在5-10之间
- 如果玩家表现好，后续AI应该更难哄（敏感度增加）
- 如果玩家表现差，AI会更敏感（更容易被激怒）`;

export async function POST(request: NextRequest) {
  try {
    const { playerInput, angerValue, history } = await request.json();
    const client = getOpenRouterClient();

    // 构建对话历史摘要（只取最近3轮）
    const recentHistory = history.slice(-6).map((msg: { role: string; content: string }) => 
      `${msg.role === "user" ? "玩家" : "女友"}：${msg.content}`
    ).join("\n");

    const messages: Array<{ role: "user" | "system" | "assistant"; content: string }> = [
      {
        role: "user",
        content: JUDGE_PROMPT
          .replace("{ANGER}", String(angerValue))
          .replace("{PLAYER_INPUT}", playerInput)
          .replace("{HISTORY}", recentHistory || "（刚开始对话）"),
      },
    ];

    const completion = await createChatCompletionWithFallback(client, {
      messages,
      temperature: 0.3,
    });
    const content = completion.choices[0]?.message?.content || "";

    // 解析 JSON 响应
    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch {
      // 如果解析失败，返回默认值
      return NextResponse.json({
        effect: "neutral",
        angerChange: 0,
        reason: "无法判断",
      });
    }
  } catch (error) {
    console.error("Judge API error:", error);
    return NextResponse.json({ error: "判断失败" }, { status: 500 });
  }
}
