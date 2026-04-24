import { NextRequest, NextResponse } from "next/server";
import { getDbSchema, getSupabaseClient } from "@/storage/database/supabase-client";

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token");

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // 解析 token 获取用户 ID
    const decoded = Buffer.from(token.value, "base64").toString("utf-8");
    const userId = parseInt(decoded.split(":")[0], 10);

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const supabase = getSupabaseClient();
    const db = getDbSchema();
    const query = db === "public" ? supabase : supabase.schema(db);

    // 获取用户信息
    const { data: user, error } = await query
      .from("users")
      .select("id, email, username, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`查询用户失败: ${error.message}`);
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json({ user: null });
  }
}
