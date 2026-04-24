import { NextRequest, NextResponse } from "next/server";
import { getDbSchema, getSupabaseClient } from "@/storage/database/supabase-client";
import bcrypt from "bcrypt";

// 注册
export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // 参数验证
    if (!email || !password || !username) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json({ error: "用户名 2-20 个字符" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const db = getDbSchema();
    const query = db === "public" ? supabase : supabase.schema(db);

    // 检查邮箱是否已注册
    const { data: existingUser, error: checkError } = await query
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      throw new Error(`检查用户失败: ${checkError.message}`);
    }

    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error: insertError } = await query
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        username,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`创建用户失败: ${insertError.message}`);
    }

    // 创建 session token
    const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
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
    console.error("注册失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
