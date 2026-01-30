import { supabase } from "@/lib/supabase"
import { SiteGrid } from "@/components/site-grid"
import type { Site } from "@/components/site-card"

// 强制动态渲染 (如果需要实时性)
export const revalidate = 0;

export default async function Home() {
  // 1. 从 Supabase 获取数据
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching sites:", error)
  }

  // 转换数据格式 (把数据库的下划线字段转成我们前端用的驼峰，如果需要的话)
  // 这里假设数据库字段名和 Site 接口一致，或者你自己做个 map
  const sites = (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    url: item.url,
    image: item.image_url, // 注意字段对应
    tags: item.tags || [],
    isFavorite: item.is_favorite // 注意字段对应
  })) as Site[]

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-neutral-950">
      {/* Hero 区域 (保持不变) */}

      {/* 2. 把数据传给客户端组件 */}
      <SiteGrid initialSites={sites} />
    </div>
  );
}