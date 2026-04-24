"use client";

import { useState, useCallback, useRef } from "react";

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 播放 TTS 音频
  const speak = useCallback(async (text: string, speaker?: string) => {
    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      setIsSpeaking(true);

      // 调用 TTS API
      const response = await fetch("/api/game/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speaker }),
      });

      if (!response.ok) {
        throw new Error("TTS 请求失败");
      }

      const data = await response.json();

      // 播放音频
      const audio = new Audio(data.audioUri);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
      };

      await audio.play();
    } catch (error) {
      console.error("语音播放失败:", error);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // 停止播放
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // 开始录音
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("开始录音失败:", error);
      throw error;
    }
  }, []);

  // 停止录音并返回音频 Blob
  const stopListening = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // 停止所有轨道
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsListening(false);

        resolve(blob);
      };

      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  // 使用浏览器原生语音识别（Web Speech API）
  const recognizeSpeech = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 检查浏览器支持
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionClass) {
        reject(new Error("浏览器不支持语音识别"));
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new SpeechRecognitionClass() as any;
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        reject(new Error("语音识别错误"));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setIsListening(true);
      recognition.start();
    });
  }, []);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    recognizeSpeech,
    isSpeaking,
    isListening,
  };
}
