"use client" // 必须加上这行

import { useState, useMemo } from "react"
import { SiteCard, type Site } from "@/components/site-card"; // 引入组件
import { CategoryTabs } from "@/components/category-tabs"

// 临时假数据
const MOCK_SITES: Site[] = [
  {
    id: "1",
    title: "Vercel",
    description: "Develop. Preview.",
    url: "https://vercel.com",
    image: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png", 
    tags: ["Deployment", "Next.js", "Serverless"],
    isFavorite: true,
  },
  {
    id: "2",
    title: "Shadcn UI",
    description: "Beautifully designed components that you can copy and paste into your apps.Beautifully designed components that you can copy and paste into your apps.Beautifully designed components that you can copy and paste into your apps.",
    url: "https://ui.shadcn.com",
    image: "",
    tags: ["UI Library", "Tailwind", "React", "React1", "React2", "React3", "React4", "React6"],
    isFavorite: false,
  },
  {
    id: "3",
    title: "Supabase",
    description: "Supabase is an open source Firebase alternative.",
    url: "https://supabase.com",
    image: "",
    tags: ["Database", "Backend", "Postgres"],
    isFavorite: false,
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All")

  // 1. 自动提取所有唯一的 Tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    MOCK_SITES.forEach(site => {
      site.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, []) // 依赖数组为空，只计算一次 (在真实数据中可能需要依赖 data)

  // 2. 根据当前选中的 Category 过滤网站
  const filteredSites = useMemo(() => {
    if (activeCategory === "All") {
      return MOCK_SITES
    }
    return MOCK_SITES.filter(site => site.tags.includes(activeCategory))
  }, [activeCategory])


  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-neutral-950">

      <section className="container mx-auto px-4 py-8">
        {/* 顶部标题区 */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Discover</h2>
            <p className="text-muted-foreground mt-1">
              Found {filteredSites.length} sites in {activeCategory}
            </p>
          </div>
        </div>

        {/* 分类导航栏 */}
        <div className="sticky top-14 z-30 -mx-4 bg-background/80 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0">
          <CategoryTabs
            categories={allTags}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* 网站列表 */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}

          {/* 空状态处理 */}
          {filteredSites.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              没有找到相关网站...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}