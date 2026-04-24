import { NextRequest, NextResponse } from "next/server";
import { createChatStreamWithFallback, getOpenRouterClient } from "@/lib/openrouter";

// 游戏角色设定
const SYSTEM_PROMPT = `你扮演一个泼辣型的女朋友，正在生气。你说话风格：
1. 火力全开，骂骂咧咧，带点幽默感
2. 嘴硬但其实在等对方哄，偶尔流露一丝软化迹象
3. 会直接叫对方的名字（用{NAME}占位）
4. 语气随愤怒值变化：愤怒值越高越激动、越大声

当前对话背景（生气原因）：
{BACKGROUND}

当前愤怒值：{ANGER}/100（100=暴怒，0=原谅）

请根据：
1. 当前愤怒值
2. 对方说的话
3. 对话历史

生成一段符合角色的回复。回复要简短有力，1-3句话。`;

export async function POST(request: NextRequest) {
  try {
    const { playerName, angerValue, history } = await request.json();
    const client = getOpenRouterClient();

    // 构建对话历史
    const messages: Array<{ role: "user" | "system" | "assistant"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT.replace("{NAME}", playerName).replace("{BACKGROUND}", "【由系统提供】").replace("{ANGER}", String(angerValue)) },
    ];

    // 添加对话历史
    for (const msg of history) {
      messages.push({ role: msg.role as "user" | "system" | "assistant", content: msg.content });
    }

    // 使用流式输出
    const stream = await createChatStreamWithFallback(client, {
      messages,
      temperature: 0.9,
    });

    const encoder = new TextEncoder();
    const streamResp = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(streamResp, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "对话生成失败" }, { status: 500 });
  }
}
