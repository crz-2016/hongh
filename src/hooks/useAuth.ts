"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: number;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取当前用户
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("获取用户失败:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "登录失败");
    }

    setUser(data.user);
    return data.user;
  }, []);

  // 注册
  const register = useCallback(async (email: string, password: string, username: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "注册失败");
    }

    setUser(data.user);
    return data.user;
  }, []);

  // 发送验证码
  const sendCode = useCallback(async (email: string) => {
    const response = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "发送验证码失败");
    }

    return data;
  }, []);

  // 登出
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    login,
    register,
    sendCode,
    logout,
    fetchUser,
  };
}
