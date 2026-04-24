import { NextResponse } from "next/server";

// 登出
export async function POST() {
  const response = NextResponse.json({ success: true });

  // 清除 cookie
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
