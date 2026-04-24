import { NextResponse } from "next/server";
import { createChatCompletionWithFallback, getOpenRouterClient } from "@/lib/openrouter";

// 生成生气场景的提示词
const BACKGROUND_PROMPT = `请生成一个"女朋友生气"的具体场景。要求：
1. 场景要具体、有代入感（比如"你忘记了你们在一起的100天纪念日"）
2. 不要太长，一句话即可
3. 语气要像女朋友在抱怨
4. 要有生活气息，让人觉得真实

直接输出一句话的场景描述，不要加引号或其他符号。比如：
"你居然把我的微信消息设为免打扰，我看到的时候整个人都傻了"
"说好周末陪我逛街，结果你跑去打球了，你知道我等了多久吗"
"你看看你今天几点才回家，我一个人在家等到凌晨你知道吗"`;

export async function POST() {
  try {
    const client = getOpenRouterClient();
    const completion = await createChatCompletionWithFallback(client, {
      messages: [{ role: "user", content: BACKGROUND_PROMPT }],
      temperature: 1.0,
    });
    const content = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      background: content || "你居然把我的生日忘了，你知道我等这一天等了多久吗！",
    });
  } catch (error) {
    console.error("Background API error:", error);
    // 返回默认场景
    return NextResponse.json({
      background: "你居然把我的生日忘了，你知道我等这一天等了多久吗！",
    });
  }
}
