import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 创建 Supabase 客户端
// 如果环境变量未配置，返回一个 mock 客户端用于开发
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase 环境变量未配置，部分功能可能不可用");
  
  // 创建一个支持链式调用的 mock 客户端
  const createQueryBuilder = () => ({
    select: () => createQueryBuilder(),
    eq: () => Promise.resolve({ data: null, error: null }) as any,
    single: () => Promise.resolve({ data: null, error: null }) as any,
    then: (resolve: any, reject: any) => Promise.resolve({ data: null, error: null }).then(resolve, reject),
  });

  supabase = {
    from: () => createQueryBuilder(),
    insert: () => Promise.resolve({ data: null, error: null }) as any,
    update: () => Promise.resolve({ data: null, error: null }) as any,
    delete: () => Promise.resolve({ data: null, error: null }) as any,
  } as unknown as SupabaseClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
