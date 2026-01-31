import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { SquircleDashed, Github, ArrowUpFromLine } from 'lucide-react'; // 👈 新增 Github
import { Button } from "@/components/ui/button"; // 👈 新增 Button 组件

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4">
                {/* 左侧 Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2 ">
                    <SquircleDashed className="mr-4" />
                    <span className="hidden sm:inline-block font-bold">
                        XGWebSite-Awesome
                    </span>
                </Link>


                {/* 右侧 */}
                <nav className="flex items-center gap-2">
                    {/* 1. 提交网站按钮 (只在电脑端显示文字，移动端可能需要隐藏或简化，这里先做简单版) */}
                    {/* <Button variant="ghost" asChild className="text-sm font-medium" title="提交网站" >
                        <Link
                            href="https://your-feishu-form-url" // 👈 替换成你的飞书表单链接
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ArrowUpFromLine className="w-5 h-5" />
                        </Link>
                    </Button> */}

                    {/* 2. GitHub 图标按钮 */}
                    <Button variant="ghost" size="icon" asChild>
                        <Link
                            href="https://github.com/XXGGG/XGWebSite-Awesome" // 👈 替换成你的 GitHub 地址
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                        >
                            <Github className="w-5 h-5" />
                        </Link>
                    </Button>

                    <ModeToggle />
                </nav>
            </div>
        </header>
    )
}