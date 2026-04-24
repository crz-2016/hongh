# 哄哄模拟器 - 项目文档

## 产品介绍

**哄哄模拟器** 是一款"求生欲测试"网页小游戏。玩家需要面对 AI 扮演的泼辣女友，通过打字输入各种哄人的话，试图将她的愤怒值从 100 降到 0。

### 产品定位
- **目标用户**：情侣、单身人士练习求生欲
- **核心价值**：寓教于乐，提升情商和沟通能力
- **情感共鸣**：真实模拟恋爱中的"哄人"场景

---

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **LLM**: coze-coding-dev-sdk
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: 邮箱验证码注册 + 密码登录

---

## 核心功能

### 游戏机制
- 愤怒值 0-100，初始值 60
- 胜利条件：愤怒值降至 0
- 失败条件：愤怒值升至 100 或 20 轮对话结束
- 动态难度：说好话后续更难哄，说差话更敏感
- AI 动态生成生气场景

### AI 能力
- 动态生成独特的生气场景
- 流式对话输出（打字机效果）
- 智能判断玩家话语效果
- 游戏结束后逐句点评

### 语音功能
- 语音输入（Web Speech API）
- 语音播报（TTS）
- 音效反馈

### 用户系统
- 邮箱验证码注册
- 密码登录
- 会话管理（Cookie）

---

## 页面结构

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 产品介绍、功能展示、游戏入口、用户菜单 |
| 游戏页 | `/game` | 实际游戏界面 |
| 登录页 | `/login` | 用户登录 |
| 注册页 | `/register` | 用户注册（邮箱验证码） |

---

## API 路由

### 认证 API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/auth/send-code` | POST | 发送邮箱验证码 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 游戏 API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/game/background` | POST | 生成随机生气场景 |
| `/api/game/judge` | POST | 判断玩家话语效果 |
| `/api/game/chat` | POST | 流式生成 AI 回复 |
| `/api/game/review` | POST | 游戏结束后逐句点评 |
| `/api/game/tts` | POST | 文字转语音 (TTS) |

---

## 数据库表结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键，自增 |
| email | varchar(255) | 邮箱，唯一 |
| password | varchar(255) | 密码（bcrypt 加密） |
| username | varchar(50) | 用户名 |
| created_at | timestamp | 创建时间 |

### verification_codes 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键，自增 |
| email | varchar(255) | 邮箱 |
| code | varchar(6) | 6位验证码 |
| expires_at | timestamp | 过期时间 |
| created_at | timestamp | 创建时间 |

---

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-code/route.ts  # 发送验证码
│   │   │   ├── register/route.ts    # 注册
│   │   │   ├── login/route.ts       # 登录
│   │   │   ├── logout/route.ts      # 登出
│   │   │   └── me/route.ts          # 当前用户
│   │   └── game/
│   │       ├── background/route.ts
│   │       ├── chat/route.ts
│   │       ├── judge/route.ts
│   │       ├── review/route.ts
│   │       └── tts/route.ts
│   ├── game/
│   │   └── page.tsx                # 游戏页面
│   ├── login/
│   │   └── page.tsx                # 登录页面
│   ├── register/
│   │   └── page.tsx                # 注册页面
│   ├── page.tsx                    # 首页
│   └── layout.tsx
├── hooks/
│   ├── useAuth.ts                  # 认证状态管理
│   ├── useGame.ts                  # 游戏状态管理
│   ├── useSound.ts                 # 音效系统
│   └── useVoice.ts                 # 语音功能
└── storage/
    └── database/
        ├── client.ts               # Supabase 客户端
        └── shared/
            └── schema.ts            # 数据库 Schema
```

---

## 静态资源

| 文件 | 路径 | 说明 |
|------|------|------|
| Logo | `/public/logo.svg` | 产品 Logo（可爱生气女友头像） |
| Hero 背景 | `/public/hero-bg.svg` | 首页大图背景（渐变云朵爱心） |
| 生气女友 | `/public/angry-girl.svg` | 功能展示图（叉腰生气女友） |
| 和好情侣 | `/public/happy-couple.svg` | 功能展示图（甜蜜拥抱情侣） |

---

## 开发命令

```bash
pnpm dev     # 启动开发服务器
pnpm build   # 构建生产版本
pnpm lint    # 代码检查
pnpm ts-check # TypeScript 类型检查
```

---

## 访问地址

- 首页：http://localhost:5000
- 游戏页：http://localhost:5000/game
- 登录页：http://localhost:5000/login
- 注册页：http://localhost:5000/register
