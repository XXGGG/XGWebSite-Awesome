"use client"

import { useState, useMemo } from "react"
import { SiteCard, type Site } from "@/components/site-card"
import { CategoryTabs } from "@/components/category-tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface SiteGridProps {
    initialSites: Site[]
}

export function SiteGrid({ initialSites }: SiteGridProps) {
    const [activeCategory, setActiveCategory] = useState("All")
    const [favorites] = useLocalStorage<string[]>("favorite-sites", [])

    // 1. 自动提取所有唯一的 Tags
    const allTags = useMemo(() => {
        const tags = new Set<string>()
        initialSites.forEach(site => {
            site.tags.forEach(tag => tags.add(tag))
        })
        return Array.from(tags).sort()
    }, [initialSites])

    // 2. 根据当前选中的 Category 过滤网站
    const filteredSites = useMemo(() => {
        if (activeCategory === "All") return initialSites
        if (activeCategory === "Favorites") { // 👈 新增逻辑
            return initialSites.filter(site => favorites.includes(site.id))
        }
        return initialSites.filter(site => site.tags.includes(activeCategory))
    }, [activeCategory, initialSites, favorites])

    return (
        <section className="container mx-auto px-4 py-8">

            {/* 顶部标题区 */}
            {/* <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Discover</h2>
                    <p className="text-muted-foreground mt-1">
                        Found {filteredSites.length} sites in {activeCategory}
                    </p>
                </div>
            </div> */}

            {/* ... 之前的 JSX 代码 (CategoryTabs, List) ... */}
            {/* 修复：将 sticky 的 top 值从 top-14 改为 top-[3.5rem] 或更大一点的值，比如 top-16 (4rem) */}
            {/* 这里的 top-14 (3.5rem) 正好是 header 的高度 (h-14)。为了让它在 header 下面一点，我们可以加一点偏移量 */}
            {/* 例如：top-[3.5rem] 是紧贴 header，top-[4rem] 就会有一点空隙 */}
            {/* 同时，为了保证在桌面端也能 sticky，我们需要移除 md:static */}
            <div className="sticky top-14 z-40 -mx-4 bg-background/80 px-4 py-4 backdrop-blur-md md:mx-0 md:bg-background/80 md:p-4">
                <CategoryTabs
                    categories={allTags}
                    activeCategory={activeCategory}
                    // 新增：添加 Favorites 选项
                    onSelect={setActiveCategory}
                />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSites.map((site) => (
                    <SiteCard key={site.id} site={site} />
                ))}
            </div>
        </section>
    )
}