import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { SquircleDashed } from 'lucide-react';

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
                <nav className="flex items-center">
                    <ModeToggle />
                </nav>
            </div>
        </header>
    )
}