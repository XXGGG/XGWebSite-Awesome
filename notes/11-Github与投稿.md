# GitHub 与 投稿

1.  **GitHub 图标**：让开发者或感兴趣的用户能直接跳转到你的开源项目代码库。
2.  **提交网站按钮**：让用户可以通过飞书表单向你推荐优质网站。


## 1. 准备工作

1.  **GitHub 项目地址**：例如 `https://github.com/yourname/your-repo`
2.  **飞书提交表单链接**：需要去飞书创建一个表单，收集用户提交的网站信息（标题、链接、描述等），然后获取分享链接。

---

## 2. 修改 Header 组件

我们要修改的文件是 `components/site-header.tsx`。

### 2.1 引入必要的组件

首先，我们需要从 `lucide-react` 图标库中引入 `Github` 图标，并确保引入了 Shadcn UI 的 `Button` 组件。

打开 `components/site-header.tsx`，在文件顶部添加或确认以下导入：

```tsx
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { SquircleDashed, Github } from 'lucide-react'; // 👈 新增 Github
import { Button } from "@/components/ui/button"; // 👈 新增 Button 组件
```

### 2.2 添加按钮代码

找到 `<nav className="flex items-center">` 这一行。这块区域目前只有 `ModeToggle`（深色模式切换），我们将把新的按钮加在它前面。

修改后的 `nav` 区域代码如下：

```tsx
                {/* 右侧 */}
                <nav className="flex items-center gap-2"> {/* 👈 增加 gap-2 让按钮之间有间距 */}
                    
                    {/* 1. 提交网站按钮 (只在电脑端显示文字，移动端可能需要隐藏或简化，这里先做简单版) */}
                    <Button variant="ghost" asChild className="text-sm font-medium">
                        <Link 
                            href="https://your-feishu-form-url" // 👈 替换成你的飞书表单链接
                            target="_blank" 
                            rel="noreferrer"
                        >
                            提交网站
                        </Link>
                    </Button>

                    {/* 2. GitHub 图标按钮 */}
                    <Button variant="ghost" size="icon" asChild>
                        <Link 
                            href="https://github.com/yourname/repo" // 👈 替换成你的 GitHub 地址
                            target="_blank" 
                            rel="noreferrer"
                            aria-label="GitHub"
                        >
                            <Github className="w-5 h-5" />
                        </Link>
                    </Button>

                    {/* 3. 深色模式切换 (保持不变) */}
                    <ModeToggle />
                </nav>
```

---


### 3.1 `asChild` 属性是什么？
```tsx
<Button asChild>
    <Link ...>...</Link>
</Button>
```
这是 **Radix UI** (Shadcn UI 的底层库) 的一个高级特性。
*   **如果不加 `asChild`**：`Button` 会渲染成一个 `<button>` 标签。如果你在里面又包了一个 `<Link>` (它是 `<a>` 标签)，就会出现 `button` 套 `a` 的情况，这是不合法的 HTML 结构。
*   **加上 `asChild`**：`Button` 组件**不会**渲染自己的 `<button>` 标签，而是把它的样式（比如 `hover` 效果、内边距等）**传递**给它的子元素（这里是 `<Link>`）。这样最终渲染出来的 HTML 就是一个带漂亮样式的 `<a>` 标签，既合法又美观。

### 3.2 `target="_blank"` 与安全
*   `target="_blank"`：告诉浏览器在**新标签页**打开链接，防止用户离开你的网站。
*   `rel="noreferrer"`：这是一个安全属性。当使用 `target="_blank"` 时，新打开的页面可以通过 `window.opener` 对象控制你的原页面（有安全风险）。加上 `noreferrer` 可以切断这种联系，保护你的网站安全。

### 3.3 图标与布局
*   我们使用了 `variant="ghost"`，这是 Vercel 风格常用的“幽灵按钮”，平时没有背景色，鼠标悬停时才会有浅灰色背景，非常清爽。
*   `size="icon"`：这是 Shadcn Button 的一个预设尺寸，专门用于正方形的图标按钮，确保长宽相等。
