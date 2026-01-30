import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

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
    return (
        <Link href={site.url} target="_blank" rel="noreferrer">
            <Card  className="flex flex-col overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm transition-all hover:shadow-2xl dark:hover:shadow-amber-50/5 dark:border-border/50 dark:shadow-border/50">
                <CardHeader className="p-5 pb-0 min-h-32"> 
                    <div className="flex items-center gap-3 mb-2"> 
                        <div className="relative shrink-0">
                            {site.image ? (
                                <Image
                                    src={site.image}
                                    alt={site.title}
                                    width={40} 
                                    height={40}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-10 h-10 text-muted-foreground/50">
                                </div>
                            )}
                        </div>

                        <CardTitle className="flex-1 min-w-0 line-clamp-1 text-base font-semibold tracking-tight text-foreground">
                            {site.title}
                        </CardTitle>

                        {/* 收藏按钮 */}
                        <Star className={site.isFavorite ? "fill-yellow-400 stroke-yellow-400" : "stroke-muted-foreground/50"} />
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