"use client"

import { useState, useMemo } from "react"
import { SiteCard, type Site } from "@/components/site-card"
import { CategoryTabs } from "@/components/category-tabs"

interface SiteGridProps {
    initialSites: Site[]
}

export function SiteGrid({ initialSites }: SiteGridProps) {
    const [activeCategory, setActiveCategory] = useState("All")

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
        if (activeCategory === "All") {
            return initialSites
        }
        return initialSites.filter(site => site.tags.includes(activeCategory))
    }, [activeCategory, initialSites])

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
            <div className="sticky top-14 z-30 -mx-4 bg-background/80 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0">
                <CategoryTabs
                    categories={allTags}
                    activeCategory={activeCategory}
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