"use client";

import { useState, useEffect, useRef } from "react";
import { useGame, Message } from "@/hooks/useGame";
import { useSound } from "@/hooks/useSound";
import { useVoice } from "@/hooks/useVoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GamePage() {
  const { state, startGame, sendMessage, showResult, restart } = useGame();
  const { playSuccess, playError, playWin, playLose } = useSound();
  const { speak, recognizeSpeech, isSpeaking, isListening } = useVoice();
  const [inputValue, setInputValue] = useState("");
  const [playerMessages, setPlayerMessages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Array<{ message: string; comment: string; score: string }>>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSpokenMessageRef = useRef<string>("");

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // 监听愤怒值变化播放音效
  const prevAngerRef = useRef(state.angerValue);
  useEffect(() => {
    if (state.phase === "playing" && !state.isTyping) {
      if (state.angerValue < prevAngerRef.current) {
        playSuccess();
      } else if (state.angerValue > prevAngerRef.current) {
        playError();
      }
    }
    prevAngerRef.current = state.angerValue;
  }, [state.angerValue, state.phase, state.isTyping, playSuccess, playError]);

  // 监听游戏结果播放音效
  useEffect(() => {
    if (state.phase === "review" || state.phase === "result") {
      if (state.result === "win") {
        playWin();
      } else if (state.result === "lose") {
        playLose();
      }
    }
  }, [state.result, state.phase, playWin, playLose]);

  // 提交名称
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      startGame(inputValue.trim());
    }
  };

  // 提交消息
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !state.isTyping) {
      const content = inputValue.trim();
      setPlayerMessages((prev) => [...prev, content]);
      sendMessage(content);
      setInputValue("");
    }
  };

  // 加载点评
  const handleShowReview = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch("/api/game/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: state.playerName,
          playerMessages,
          background: state.background,
          result: state.result,
        }),
      });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
    setIsLoadingReviews(false);
    showResult();
  };

  // 获取愤怒值对应的文字样式
  const getAngerStyle = (anger: number) => {
    if (anger < 30) {
      return { color: "#22c55e", fontSize: "1rem" };
    } else if (anger < 60) {
      return { color: "#eab308", fontSize: "1.1rem" };
    } else if (anger < 80) {
      return { color: "#f97316", fontSize: "1.2rem" };
    } else {
      return { color: "#ef4444", fontSize: "1.3rem" };
    }
  };

  // 获取回合提示
  const getRoundText = (round: number) => {
    if (round <= 5) return "还有机会";
    if (round <= 10) return "加油啊";
    if (round <= 15) return "快想想办法";
    return "最后关头！";
  };

  // 切换语音模式
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  // 语音输入
  const handleVoiceInput = async () => {
    try {
      const transcript = await recognizeSpeech();
      if (transcript) {
        setInputValue(transcript);
      }
    } catch (error) {
      console.error("语音识别失败:", error);
    }
  };

  // 播放女友消息的语音
  const playVoiceMessage = (content: string) => {
    if (voiceEnabled && content && content !== lastSpokenMessageRef.current) {
      lastSpokenMessageRef.current = content;
      speak(content);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-200 to-indigo-200 flex flex-col">
      {/* 标题栏 */}
      <header className="glass sticky top-0 z-10 border-b border-white/30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-pink-600 drop-shadow-sm">哄哄模拟器</h1>
          {state.phase !== "name" && (
            <Button variant="ghost" size="sm" onClick={restart} className="glass">
              重新开始
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {/* 名称输入阶段 */}
        {state.phase === "name" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-md p-8 text-center glass-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                欢迎来到哄哄模拟器
              </h2>
              <p className="text-gray-600 mb-6">
                测试你的求生欲！学会哄女朋友开心吧~
              </p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="请输入你的昵称"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="text-center glass"
                  maxLength={20}
                  autoFocus
                />
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 shadow-lg">
                  开始游戏
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* 场景介绍阶段 */}
        {state.phase === "intro" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <Card className="w-full p-8 text-center glass-card">
              <div className="mb-6">
                <span className="text-6xl">😤</span>
              </div>
              <p className="text-lg text-gray-800 mb-2">
                {state.playerName}，你女朋友生气了！
              </p>
              <p className="text-gray-600 italic">
                &ldquo;{state.background}&rdquo;
              </p>
            </Card>
          </div>
        )}

        {/* 游戏进行阶段 */}
        {state.phase === "playing" && (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* 生气原因 */}
            <div className="glass text-white rounded-xl p-3 mb-4 shadow-lg">
              <p className="text-sm font-medium">
                <span className="opacity-90">生气原因：</span>
                <span className="font-normal">&ldquo;{state.background}&rdquo;</span>
              </p>
            </div>

            {/* 状态栏 */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  第 {state.round}/20 轮 · {getRoundText(state.round)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoice}
                  className={`p-1 h-7 ${voiceEnabled ? "text-pink-500" : "text-gray-400"}`}
                >
                  {voiceEnabled ? "🔊" : "🔇"}
                </Button>
              </div>
              <span
                className="font-bold transition-all duration-300"
                style={getAngerStyle(state.angerValue)}
              >
                愤怒值: {state.angerValue}
              </span>
            </div>
            <Progress
              value={state.angerValue}
              className="h-2 mb-4"
              indicatorClassName={
                state.angerValue < 30
                  ? "bg-green-500"
                  : state.angerValue < 60
                    ? "bg-yellow-500"
                    : state.angerValue < 80
                      ? "bg-orange-500"
                      : "bg-red-500"
              }
            />

            {/* 微信风格聊天区域 */}
            <div className="flex-1 flex flex-col bg-[#e5e5e5] rounded-xl overflow-hidden">
              {/* 聊天消息区 */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {state.messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {!msg.role || msg.role === "assistant" ? (
                        <div className="flex items-end gap-2 max-w-[75%]">
                          <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            女友
                          </div>
                          <div className="flex flex-col gap-1">
                            <div
                              className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm"
                              style={getAngerStyle(state.angerValue)}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {voiceEnabled && msg.content && (
                              <button
                                onClick={() => playVoiceMessage(msg.content)}
                                className="text-xs text-pink-400 hover:text-pink-500 flex items-center gap-1 ml-2"
                              >
                                {isSpeaking ? "🔊 播放中..." : "▶ 播放语音"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {msg.role === "user" ? (
                        <div className="flex items-end gap-2 max-w-[75%]">
                          <div className="flex flex-col gap-1 items-end">
                            <div className="bg-[#95ec69] rounded-2xl rounded-br-md px-4 py-2 shadow-sm">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            我
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {state.isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          女友
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 微信风格输入框 */}
              <div className="bg-[#f7f7f7] border-t border-gray-200 p-3">
                <form onSubmit={handleMessageSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="输入哄她的话..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={state.isTyping || state.angerValue <= 0 || state.angerValue >= 100}
                    maxLength={200}
                    className="flex-1 bg-white"
                  />
                  <Button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={state.isTyping || isListening}
                    className={`px-3 ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
                  >
                    {isListening ? "🔴" : "🎤"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={state.isTyping || !inputValue.trim() || state.angerValue <= 0 || state.angerValue >= 100}
                    className="bg-[#07c160] hover:bg-[#06ad56] text-white"
                  >
                    发送
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 回顾阶段 */}
        {state.phase === "review" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <Card className="w-full p-8 text-center glass-card">
              <div className="mb-6">
                <span className="text-6xl">{state.result === "win" ? "😊" : "😢"}</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {state.result === "win" ? "恭喜！你成功哄好了她！" : "失败了...她已经不想理你了"}
              </h2>
              <p className="text-gray-600 mb-6">
                共对话 {state.round} 轮，愤怒值最终为 {state.angerValue}
              </p>
              <Button
                onClick={handleShowReview}
                disabled={isLoadingReviews}
                className="bg-pink-500 hover:bg-pink-600 shadow-lg"
              >
                {isLoadingReviews ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    加载点评中...
                  </>
                ) : (
                  "查看点评"
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* 结果阶段 */}
        {state.phase === "result" && (
          <div className="flex flex-col">
            <Card className="w-full p-6 mb-4 glass-card">
              <h2 className="text-xl font-bold text-center mb-4">
                {state.result === "win" ? "🎉 成功原谅" : "💔 分手收场"}
              </h2>
              <p className="text-gray-600 text-center mb-4">
                &ldquo;{state.background}&rdquo;
              </p>
            </Card>

            <h3 className="text-lg font-bold mb-3">逐句点评：</h3>
            <div className="space-y-3">
              {reviews.map((review, index) => (
                <Card key={index} className="p-4 glass-card">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        review.score === "good"
                          ? "bg-green-500"
                          : review.score === "bad"
                            ? "bg-red-500"
                            : "bg-gray-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-1">
                        <span className="text-blue-500">你说：</span>
                        &ldquo;{review.message}&rdquo;
                      </p>
                      <p className="text-gray-600 text-sm italic">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={restart}
              className="mt-6 w-full bg-pink-500 hover:bg-pink-600 shadow-lg"
            >
              再来一局
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
