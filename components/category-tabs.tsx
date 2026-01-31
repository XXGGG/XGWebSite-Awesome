"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface CategoryTabsProps {
    categories: string[]
    activeCategory: string
    onSelect: (category: string) => void
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    const [favorites] = useLocalStorage<string[]>("favorite-sites", [])
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex w-max space-x-2">

                {/* 新增：Favorites 按钮 */}
                {favorites.length > 0 ?
                    <Button
                        variant={activeCategory === "Favorites" ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelect("Favorites")}
                    >
                        <Star className="w-4 h-4 text-yellow-400 fill-current"></Star>
                    </Button>
                    : null
                }

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