import { NextRequest, NextResponse } from "next/server";
import { getOpenRouterClient } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "文本不能为空" }, { status: 400 });
    }

    const client = getOpenRouterClient();

    const response = await client.audio.speech.create({
      model: process.env.OPENROUTER_TTS_MODEL || "openai/gpt-4o-mini-tts",
      voice: process.env.OPENROUTER_TTS_VOICE || "alloy",
      input: text,
      response_format: "mp3",
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const audioUri = `data:audio/mpeg;base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      audioUri,
      audioSize: buffer.byteLength,
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json({ error: "语音合成失败" }, { status: 500 });
  }
}
