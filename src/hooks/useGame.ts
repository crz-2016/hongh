"use client";

import { useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface GameState {
  phase: "name" | "intro" | "playing" | "review" | "result";
  playerName: string;
  background: string;
  angerValue: number;
  round: number;
  messages: Message[];
  result: "win" | "lose" | null;
  isTyping: boolean;
  sensitivity: number; // 动态难度：敏感度
}

const INITIAL_STATE: GameState = {
  phase: "name",
  playerName: "",
  background: "",
  angerValue: 60,
  round: 0,
  messages: [],
  result: null,
  isTyping: false,
  sensitivity: 1,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 开始游戏
  const startGame = useCallback(async (playerName: string) => {
    setState((prev) => ({
      ...prev,
      phase: "intro",
      playerName,
    }));

    // 生成生气场景
    try {
      const bgResponse = await fetch("/api/game/background", { method: "POST" });
      const bgData = await bgResponse.json();

      setState((prev) => ({
        ...prev,
        background: bgData.background,
      }));

      // 延迟进入游戏阶段，让玩家看到场景
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setState((prev) => ({
        ...prev,
        phase: "playing",
        angerValue: 60,
        round: 1,
        messages: [],
        sensitivity: 1,
      }));
    } catch (error) {
      console.error("Failed to start game:", error);
      setState((prev) => ({
        ...prev,
        background: "你居然把我的生日忘了，你知道我等这一天等了多久吗！",
        phase: "playing",
        angerValue: 60,
        round: 1,
        messages: [],
        sensitivity: 1,
      }));
    }
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (state.isTyping || state.angerValue <= 0 || state.angerValue >= 100) return;

      // 添加用户消息
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isTyping: true,
      }));

      try {
        // 判断效果
        const judgeResponse = await fetch("/api/game/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerInput: content,
            angerValue: state.angerValue,
            history: state.messages,
          }),
        });

        const judgeResult = await judgeResponse.json();

        // 计算愤怒值变化（考虑敏感度）
        let angerChange = judgeResult.angerChange || 0;
        angerChange = Math.round(angerChange * state.sensitivity);
        angerChange = Math.max(-10, Math.min(10, angerChange)); // 限制范围

        // 更新敏感度（动态难度）
        const newSensitivity =
          angerChange < 0
            ? Math.min(1.5, state.sensitivity + 0.1) // 说得好，后续更难哄
            : angerChange > 0
              ? Math.min(1.5, state.sensitivity + 0.05) // 说不好，更敏感
              : state.sensitivity;

        const newAngerValue = Math.max(
          0,
          Math.min(100, state.angerValue + angerChange)
        );

        // 获取 AI 回复（流式）
        abortControllerRef.current = new AbortController();
        const chatResponse = await fetch("/api/game/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName: state.playerName,
            angerValue: newAngerValue,
            history: [...state.messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        });

        const reader = chatResponse.body?.getReader();
        const decoder = new TextDecoder();
        let aiContent = "";

        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
        }));

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            aiContent += chunk;

            // 更新 AI 消息内容
            setState((prev) => {
              const messages = [...prev.messages];
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content: aiContent,
              };
              return { ...prev, messages };
            });
          }
        }

        // 更新游戏状态
        setState((prev) => {
          const isWin = newAngerValue <= 0;
          const isLose = newAngerValue >= 100;
          const isMaxRound = prev.round >= 20;

          return {
            ...prev,
            angerValue: newAngerValue,
            sensitivity: newSensitivity,
            round: isWin || isLose ? prev.round : prev.round + 1,
            isTyping: false,
            phase: isWin || isLose || isMaxRound ? "review" : "playing",
            result: isWin ? "win" : isLose || isMaxRound ? "lose" : null,
          };
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("Request was aborted");
        } else {
          console.error("Failed to send message:", error);
        }
        setState((prev) => ({ ...prev, isTyping: false }));
      }
    },
    [state]
  );

  // 进入结果页面
  const showResult = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "result" }));
  }, []);

  // 重新开始
  const restart = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    startGame,
    sendMessage,
    showResult,
    restart,
  };
}
