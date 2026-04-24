"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-purple-200 to-indigo-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#FFB6C1" }} />
                    <stop offset="100%" style={{ stopColor: "#FF69B4" }} />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="95" fill="url(#bgGrad)" stroke="#fff" strokeWidth="4" />
                <ellipse cx="100" cy="75" rx="55" ry="50" fill="#4A3728" />
                <ellipse cx="100" cy="100" rx="45" ry="42" fill="#FFE4C4" />
                <path d="M65 85 L80 92" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
                <path d="M135 85 L120 92" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" />
                <text x="150" y="60" fontSize="20" fill="#FF4444">💢</text>
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">登录账号</h1>
          <p className="text-gray-600 mt-2">继续你的求生欲测试之旅</p>
        </div>

        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <Input
                type="email"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              登录
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link href="/register" className="text-pink-500 hover:underline">
                还没有账号？立即注册
              </Link>
              <Link href="/" className="text-gray-500 hover:underline">
                游客模式体验
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
