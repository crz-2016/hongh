import { NextRequest, NextResponse } from "next/server";
import { getDbSchema, getSupabaseClient } from "@/storage/database/supabase-client";
import bcrypt from "bcrypt";

// 登录
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const db = getDbSchema();
    const query = db === "public" ? supabase : supabase.schema(db);

    // 查找用户
    const { data: user, error } = await query
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`查询用户失败: ${error.message}`);
    }

    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    // 创建 session token
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // 设置 cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
