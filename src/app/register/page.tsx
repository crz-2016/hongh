"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 表单验证
  const validateForm = () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return false;
    }
    if (formData.username.length < 2) {
      setError("用户名至少 2 个字符");
      return false;
    }
    if (formData.password.length < 6) {
      setError("密码至少 6 位");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("两次密码不一致");
      return false;
    }
    return true;
  };

  // 提交注册
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.username);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
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
          <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
          <p className="text-gray-600 mt-2">加入哄哄模拟器，测试你的求生欲</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <Input
                type="text"
                placeholder="请输入用户名（2-20个字符）"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                maxLength={20}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <Input
                type="password"
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <Input
                type="password"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              注册
            </Button>

            <p className="text-center text-gray-600 text-sm">
              已有账号？{" "}
              <Link href="/" className="text-pink-500 hover:underline">
                立即登录
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
