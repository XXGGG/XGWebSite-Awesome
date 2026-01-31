"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Globe } from "lucide-react"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export interface Site {
    id: string
    title: string
    description: string
    url: string
    image: string
    tags: string[]
    isFavorite: boolean
}

interface SiteCardProps {
    site: Site
}

export function SiteCard({ site }: SiteCardProps) {
    const [imageError, setImageError] = useState(false)

    // 提取域名用于获取 favicon
    const getFaviconUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname
            // 使用 Google Favicon 服务 (稳定且支持 fallback)
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        } catch {
            return ""
        }
    }

    // 1. 读取本地存储中的 'favorite-sites'，默认值是个空数组 []
    const [favorites, setFavorites] = useLocalStorage<string[]>("favorite-sites", [])

    // 2. 判断当前网站 ID 是否在列表里
    // 注意：这里我们用 site.id 来作为唯一标识
    const isFavorite = favorites.includes(site.id)

    // 3. 处理点击事件
    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault() // 阻止跳转（因为卡片本身是个 Link）
        e.stopPropagation() // 阻止冒泡

        if (isFavorite) {
            // 如果已收藏，就移除
            setFavorites(favorites.filter(id => id !== site.id))
        } else {
            // 如果没收藏，就添加
            setFavorites([...favorites, site.id])
        }
    }

    return (
        <Link href={site.url} target="_blank" rel="noreferrer">
            <Card className="flex flex-col overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm transition-all hover:shadow-2xl dark:hover:shadow-amber-50/5 dark:border-border/50 dark:shadow-border/50">
                <CardHeader className="p-5 pb-0 min-h-32">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative shrink-0">
                            {/* 逻辑：有图且没报错 -> 显示图；否则 -> 显示 Favicon；Favicon 也裂了 -> onError 显示默认图标 */}
                            {!imageError ? (
                                <>
                                    {site.image ? (
                                        <Image
                                            src={site.image}
                                            alt={site.title}
                                            width={32}
                                            height={32}
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        /* 如果没有 site.image，直接尝试显示 Favicon */
                                        <img
                                            src={getFaviconUrl(site.url)}
                                            alt={site.title}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                setImageError(true);
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                /* 兜底：显示默认图标 */
                                <Globe className="w-6 h-6 text-muted-foreground/50" />
                            )}
                        </div>
                        
                        <CardTitle className="flex-1 min-w-0 line-clamp-1 text-base font-semibold tracking-tight text-foreground">
                            {site.title}
                        </CardTitle>

                        {/* 收藏按钮 */}
                        <button
                            onClick={toggleFavorite}
                            className="p-1 hover:bg-accent rounded-full transition-colors"
                        >
                            <Star
                                className={`w-6 h-6 transition-all ${isFavorite
                                        ? "fill-yellow-400 stroke-yellow-400"
                                        : "stroke-muted-foreground/50 hover:stroke-yellow-400"
                                    }`}
                            />
                        </button>
                    </div>

                    <CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/80" title={site.description}>
                        {site.description}
                    </CardDescription>
                </CardHeader>

                <CardFooter className="p-4 pt-0 ">
                    <div className="flex flex-wrap gap-2 h-6 overflow-hidden">
                        {site.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardFooter>
            </Card>
        </Link >
    )
}