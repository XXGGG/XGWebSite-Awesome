"use client"

import { Button } from "@/components/ui/button"

interface CategoryTabsProps {
    categories: string[]
    activeCategory: string
    onSelect: (category: string) => void
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex w-max space-x-2">
                {/* "全部" 按钮 */}
                <Button
                    variant={activeCategory === "All" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelect("All")}
                >
                    All
                </Button>

                {/* 其他标签按钮 */}
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelect(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
    )
}