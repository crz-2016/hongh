"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";

export default function HomePage() {
  const { user, loading, logout, login, fetchUser } = useAuth();
  const router = useRouter();

  // 登录表单状态
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/game");
      } else {
        setLoginError("邮箱或密码错误");
      }
    } catch {
      setLoginError("登录失败，请重试");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // 未登录：显示登录页面
  if (!loading && !user) {
    return (
      <div className="min-h-screen flex">
        {/* 左侧装饰区域 */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
          </div>

          {/* 内容 */}
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white/30">
                <Image
                  src="/logo.svg"
                  alt="哄哄模拟器 Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">哄哄模拟器</h1>
            <p className="text-2xl mb-6 text-white/90">你的求生欲够用吗？</p>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              一款考验求生欲的网页小游戏，AI 扮演泼辣女友，
              用你的智慧和真诚，把她的愤怒值降到 0！
            </p>

            {/* 特性标签 */}
            <div className="mt-8 flex flex-wrap gap-3">
              {["AI智能场景", "语音对话", "流式输出", "逐句点评"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="space-y-4 text-center pb-2">
              {/* 手机端 Logo */}
              <div className="lg:hidden flex justify-center mb-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-pink-200">
                  <Image
                    src="/logo.svg"
                    alt="哄哄模拟器 Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                欢迎回来
              </CardTitle>
              <p className="text-gray-500 text-sm">
                登录后开始你的求生欲挑战
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {loginError && (
                  <p className="text-red-500 text-sm text-center">{loginError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <Spinner className="h-5 w-5" />
                  ) : (
                    "登录"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  还没有账号？{" "}
                  <Link
                    href="/register"
                    className="text-pink-500 hover:text-pink-600 font-medium"
                  >
                    立即注册
                  </Link>
                </p>
              </div>

              {/* 游客入口 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/game">
                  <Button
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-pink-500"
                  >
                    游客试玩（不保存记录）
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // 已登录：显示产品首页
  const features = [
    {
      icon: "🎯",
      title: "AI 智能场景",
      description: "每次游戏都是独特的生气场景，AI 动态生成让你无法预料",
    },
    {
      icon: "🎤",
      title: "语音对话",
      description: "支持语音输入和语音播报，说出你的甜言蜜语",
    },
    {
      icon: "💬",
      title: "流式对话",
      description: "真实模拟聊天体验，AI 女友的回复生动有趣",
    },
    {
      icon: "📊",
      title: "动态难度",
      description: "说好话越来越难哄，考验你的求生欲极限",
    },
    {
      icon: "🔊",
      title: "语音播报",
      description: "开启语音模式，AI 女友会朗读她的回复",
    },
    {
      icon: "🎓",
      title: "逐句点评",
      description: "游戏结束后 AI 女友会认真点评你的每句话",
    },
  ];

  const tips = [
    "真诚道歉永远是第一选择",
    "不要讲道理，她要的是态度",
    "适当撒娇可能有意想不到的效果",
    "避免火上浇油的敷衍回应",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.svg"
            alt="背景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-pink-100" />
        </div>

        {/* 内容 */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
              <Image
                src="/logo.svg"
                alt="哄哄模拟器 Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            哄哄模拟器
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 drop-shadow">
            你的求生欲够用吗？
          </p>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            一款考验求生欲的网页小游戏，AI 扮演泼辣女友，<br className="hidden md:block" />
            用你的智慧和真诚，把她的愤怒值降到 0！
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/game">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-lg px-8 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all"
              >
                开始游戏 🎮
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-white/50 text-lg px-6 py-6 rounded-full shadow-lg"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>

          {/* 欢迎信息 */}
          <div className="mt-6 text-white/80">
            欢迎回来，<span className="font-semibold">{user?.username}</span>
          </div>

          {/* 统计数据 */}
          <div className="mt-12 flex justify-center gap-8 text-white">
            <div className="text-center">
              <p className="text-3xl font-bold">10W+</p>
              <p className="text-sm opacity-70">玩家体验</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm opacity-70">趣味场景</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">60%</p>
              <p className="text-sm opacity-70">首轮通过率</p>
            </div>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-pink-100 to-transparent" />
      </section>

      {/* 功能特点 Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-pink-100 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              游戏特色
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              不同于普通的选择题游戏，这里需要你用自己的话来哄人
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 游戏截图 Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              真实体验
            </h2>
            <p className="text-gray-600">
              微信聊天风格，沉浸式游戏体验
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 生气场景 */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-[#FFE4E1]">
                <Image
                  src="/angry-girl.svg"
                  alt="生气场景"
                  fill
                  className="object-contain"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">😤 生气场景</h3>
                <p className="text-gray-600 text-sm">
                  AI 女友会随机生成一个让你头疼的生气原因
                </p>
              </CardContent>
            </Card>

            {/* 努力哄她 */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-[#e5e5e5] flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg max-w-[80%]">
                  <p className="text-sm text-gray-800">宝贝对不起嘛...</p>
                </div>
                <div className="absolute right-4 bottom-4 bg-[#95ec69] rounded-lg p-4 shadow-lg max-w-[80%]">
                  <p className="text-sm text-gray-800">我下次再也不敢了</p>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">💬 努力哄她</h3>
                <p className="text-gray-600 text-sm">
                  输入你想说的话，用真诚打动她
                </p>
              </CardContent>
            </Card>

            {/* 和好如初 */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-[#FFF0F5]">
                <Image
                  src="/happy-couple.svg"
                  alt="和好如初"
                  fill
                  className="object-contain"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">😊 和好如初</h3>
                <p className="text-gray-600 text-sm">
                  把愤怒值降到 0，抱得美人归
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 生存指南 Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              求生欲小技巧
            </h2>
            <p className="text-gray-600">
              来自过来人的经验分享
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-2">{tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              常见问题
            </h2>
          </div>

          <div className="space-y-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-800 mb-2">Q: 这个游戏怎么玩？</h3>
                <p className="text-gray-600">
                  A: 输入你的名字开始游戏，AI 女友会告诉你她为什么生气。你需要在 20 轮对话内，用真诚的话语把她的愤怒值从 60 降到 0。
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-800 mb-2">Q: 失败会怎样？</h3>
                <p className="text-gray-600">
                  A: 如果愤怒值升到 100 或者 20 轮用完还没哄好，游戏就结束了。放心，不会有任何惩罚，只是一次学习机会！
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-800 mb-2">Q: 为什么说好话反而更难哄了？</h3>
                <p className="text-gray-600">
                  A: 这是游戏的动态难度机制！当你表现好时，AI 女友的标准会提高，更加敏感。这是为了让游戏更有挑战性~
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好测试你的求生欲了吗？
          </h2>
          <p className="text-white/80 text-lg mb-8">
            立即开始游戏，看看你的甜言蜜语能否打动她！
          </p>
          <Link href="/game">
            <Button
              size="lg"
              className="bg-white text-pink-600 hover:bg-gray-100 text-lg px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all"
            >
              立即挑战 🚀
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/logo.svg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <p className="mb-2">哄哄模拟器 - 你的求生欲测试专家</p>
          <p className="text-sm mb-4">Made with ❤️ for couples everywhere</p>
          <button
            onClick={handleLogout}
            className="text-pink-400 hover:text-pink-300 text-sm"
          >
            退出登录
          </button>
        </div>
      </footer>
    </div>
  );
}
