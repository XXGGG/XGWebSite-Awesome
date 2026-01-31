# 云端连接 (Supabase Integration)

## Supabase 后台操作 (手动步骤)

先去 [Supabase 官网](https://supabase.com/) 注册并创建一个新项目。

### 创建表 (Table)
进入 `Table Editor`，创建一个名为 `sites` 的表，结构如下：

| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | 主键，默认选 `gen_random_uuid()` |
| `created_at` | `timestamptz` | 默认 `now()` |
| `title` | `text` | 网站标题 |
| `description` | `text` | 网站描述 |
| `url` | `text` | 网站链接 |
| `image_url` | `text` | 图片链接 (存 URL 字符串) |
| `tags` | `text[]` | 标签数组 (注意选 Array of Text) |
| `is_favorite` | `boolean` | 是否推荐 (默认 false) |

**关掉 RLS (Row Level Security)**: 为了方便（毕竟只是个展示站），先暂时 `Disable RLS`，允许任何人读取数据。

或者添加一条 Policy: `Enable read access for all users`。（这样更加好，因为以后要直接部署到 Vercel, 浏览器需要用 Publishable key 来访问）。
需要开启 Row Level Security (RLS) 才能生效。

开启RLS后要添加一条 Policy（策略）: `Enable read access for all users`。 
在 Authentication -> Policies 中添加。


### 创建存储桶 (Storage)
1.  点击左侧 `Storage` 图标。
2.  点击 `New Bucket`，起名 `site-images`。
3.  **重要**: 把 `Public Bucket` 开关打开！(这样图片才能被公开访问)。
4.  随便上传一张图片试一下，点击 `Get URL`，得到类似 `https://xxx.supabase.co/storage/v1/object/public/site-images/demo.png` 的链接。

---


## Next.js 项目配置

### 3.1 安装依赖
```bash
pnpm add @supabase/supabase-js
```

### 3.2 环境变量
在项目根目录新建 `.env.local` 文件，填入 Supabase 后台提供的 Key (在 Project Settings -> API 中找)：

```env
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的AnonKey
```
- 你的项目URL 在 【Project Settings -> Data API -> Project URL -> URL】
- 你的AnonKey 在 【Project Settings -> API Keys -> Publicanon key -> default 】

> Publishable key 可以给浏览器，前提是开启了 RLS 且配置了策略。
This key is safe to use in a browser if you have enabled Row Level Security (RLS) for your tables and configured policies.

> Secret keys 不能暴露给浏览器！



### 3.3 创建 Supabase 客户端
新建 `lib/supabase.ts`：

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 4. 读取真实数据

修改 `app/page.tsx`。

**Server Component 获取数据 -> 传给 Client Component** (推荐，SEO 更好)。


**第一步：改造 `app/page.tsx` (变成 Server Component)**

**拆分 Client 组件**: 新建 `components/site-grid.tsx`
把之前 `page.tsx` 里那些 `useState`, `useMemo` 的逻辑全搬到这里。

```tsx
"use client"

import { useState, useMemo } from "react"
import { SiteCard, type Site } from "@/components/site-card"
import { CategoryTabs } from "@/components/category-tabs"

interface SiteGridProps {
  initialSites: Site[]
}

export function SiteGrid({ initialSites }: SiteGridProps) {
  const [activeCategory, setActiveCategory] = useState("All")

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    initialSites.forEach(site => {
      site.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [initialSites])

  const filteredSites = useMemo(() => {
    if (activeCategory === "All") {
      return initialSites
    }
    return initialSites.filter(site => site.tags.includes(activeCategory))
  }, [activeCategory, initialSites])

  return (
    <section className="container mx-auto px-4 py-8">
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
```

**第二步：重写 `app/page.tsx` (Server Component)**

```tsx
import { supabase } from "@/lib/supabase"
import { SiteGrid } from "@/components/site-grid"
import type { Site } from "@/components/site-card"

// 强制动态渲染 (如果需要实时性)
export const revalidate = 0; 

export default async function Home() {
  // 1. 从 Supabase 获取数据
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching sites:", error)
  }

  const sites = (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    url: item.url,
    image: item.image_url, // 注意字段对应
    tags: item.tags || [],
    isFavorite: item.is_favorite // 注意字段对应
  })) as Site[]

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-neutral-950">
       {/* Hero 区域 (保持不变) */}
       
       {/* 2. 把数据传给客户端组件 */}
       <SiteGrid initialSites={sites} />
    </div>
  );
}
```