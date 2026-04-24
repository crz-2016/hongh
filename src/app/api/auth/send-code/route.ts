import { NextRequest, NextResponse } from "next/server";
import { getDbSchema, getSupabaseClient } from "@/storage/database/supabase-client";

// 发送验证码
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
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

    // 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟后过期

    // 删除该邮箱之前的验证码
    const { error: deleteError } = await query
      .from("verification_codes")
      .delete()
      .eq("email", email);

    if (deleteError) {
      throw new Error(`删除旧验证码失败: ${deleteError.message}`);
    }

    // 保存新验证码
    const { error: insertError } = await query
      .from("verification_codes")
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      throw new Error(`保存验证码失败: ${insertError.message}`);
    }

    // 实际项目中这里应该调用邮件服务发送验证码
    // 现在我们把验证码返回给前端（仅用于测试）
    console.log(`验证码 ${code} 已发送到 ${email}`);

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("发送验证码失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
