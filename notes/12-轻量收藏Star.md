# 本地收藏功能 (LocalStorage)

我们将实现一个轻量级的“收藏”功能。
不同于传统的需要登录账号的收藏，我们将利用浏览器的 **LocalStorage** 技术，将用户的喜好保存在他自己的电脑上。

**这种做法的特点：**
*   🟢 **极速**：不需要等待服务器响应，点一下立马变色。
*   🟢 **隐私**：数据只存在用户本地，不上传服务器。
*   🔴 **局限**：换个浏览器或清空缓存，收藏就会消失。

---

## 1. 原理讲解：LocalStorage 是什么？

想象一下，你的浏览器里有一个自带的“小笔记本”，名字叫 `localStorage`。
*   你可以往里面写字：`localStorage.setItem('key', 'value')`
*   你可以读取内容：`localStorage.getItem('key')`
*   **最重要的是**：即使你关闭网页、关闭浏览器、甚至重启电脑，这个笔记本里的字**依然存在**（除非你主动擦掉它）。

我们的策略是：
当用户点击星星时，把这个网站的 `id` 记在这个本子上。
下次刷新页面时，先看看本子上有没有这个 `id`，如果有，就把星星涂成黄色。

---

## 2. 编写 Hook (自定义钩子)

为了方便复用，我们不把逻辑直接写在组件里，而是封装一个 React Hook。

这个 Hook 看起来简单，但实际上有很多**深坑**（比如服务端渲染报错、多组件不同步等）。
下面的代码是经过多次迭代、**完全修复版**的代码，请直接使用。

### 第一步：创建文件
在 `hooks` 文件夹下新建一个文件 `use-local-storage.ts`。
(如果没有 `hooks` 文件夹，请先在根目录创建它)

### 第二步：复制以下代码 (终极版)

```tsx
import { useState, useEffect } from "react"

// T 是一个泛型，代表我们要存的数据类型
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. 初始化 State
  // 解决 Hydration Mismatch：初始值使用 initialValue，确保服务端和客户端一致
  // 我们不在这里直接读取 localStorage，而是给一个安全的默认值
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 2. 监听 localStorage 的变化 (实现多组件同步)
  useEffect(() => {
    // 定义读取函数
    const readValue = () => {
      try {
        const item = window.localStorage.getItem(key)
        return item ? (JSON.parse(item) as T) : initialValue
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
        return initialValue
      }
    }

    // 定义事件处理函数
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }

    // 组件挂载后，立即读取一次最新值
    // 💡 技巧：使用 setTimeout 将读取操作推迟到下一个事件循环
    // 这样可以避免 React 报错 "Calling setState synchronously within an effect"
    const timeoutId = setTimeout(() => {
      setStoredValue(readValue())
    }, 0)

    // 监听跨标签页的变化 (storage 事件)
    window.addEventListener("storage", handleStorageChange)
    
    // 监听同页面的变化 (自定义 local-storage 事件)
    // 这是解决 BUG 的关键：让不同组件之间能“打电话”通知对方
    window.addEventListener("local-storage", handleStorageChange)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("local-storage", handleStorageChange)
    }
  }, [key, initialValue])

  // 3. 封装一个设置函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 为了防止竞态条件，我们再次读取最新的值来计算
      // 但由于 setValue 的参数可能是函数 (prev => next)，我们需要处理两种情况
      
      let valueToStore: T

      if (value instanceof Function) {
        // 如果是函数更新，我们尽量用当前的 storedValue
        valueToStore = value(storedValue)
      } else {
        // 如果是直接赋值，直接用新值
        valueToStore = value
      }
      
      // 1. 更新 React 状态
      setStoredValue(valueToStore)
      
      // 2. 更新本地存储 & 发送通知
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        // 🔥 关键一步：派发自定义事件，通知其他使用了这个 hook 的组件
        // 这样当你点击一个卡片的星星时，顶部的分类栏和其他卡片也会立马更新！
        window.dispatchEvent(new Event("local-storage"))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
```

### 💡 代码解析 (遇到的坑与填坑)

1.  **Hydration Mismatch (水合不匹配)**
    *   **问题**：服务器不知道你的 LocalStorage，渲染出空心星；浏览器知道，渲染出实心星。React 看到两者不一样会报错。
    *   **解决**：`useState(initialValue)`。先假装大家都是空心星，等页面加载完 (`useEffect`) 再偷偷换成实心星。

2.  **React 红色波浪线 (Synchronous setState)**
    *   **问题**：React 严格模式不喜欢我们在 `useEffect` 里立刻修改状态。
    *   **解决**：`setTimeout(..., 0)`。告诉浏览器：“等一下（下一个事件循环）再更新”，React 就开心了。

3.  **多组件不同步**
    *   **问题**：点了一个卡片的收藏，另一个组件（比如筛选栏）不知道，数据没更新。
    *   **解决**：`window.dispatchEvent(new Event("local-storage"))`。利用浏览器原生事件，像广播一样通知所有组件：“数据变啦，快重新读一遍！”


---

## 3. 修改 SiteCard 组件

现在我们要去 `components/site-card.tsx` 里使用这个功能。

### 第一步：引入 Hook
在文件顶部引入我们刚才写的 hook。

```tsx
import { useLocalStorage } from "@/hooks/use-local-storage"
```

### 第二步：修改组件逻辑
找到 `SiteCard` 函数内部，我们需要做几件事：
1.  读取本地收藏列表。
2.  判断当前网站是否被收藏。
3.  点击星星时切换状态。

```tsx
export function SiteCard({ site }: SiteCardProps) {
    // ... 原有的 imageError 逻辑保持不变 ...

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

    // ...
```

### 第三步：修改星星图标的渲染
找到渲染 `<Star />` 的地方，修改它的 `className` 和 `onClick` 事件。

```tsx
                        {/* 收藏按钮 */}
                        <button 
                            onClick={toggleFavorite}
                            className="p-1 hover:bg-accent rounded-full transition-colors"
                        >
                            <Star 
                                className={`w-5 h-5 transition-all ${
                                    isFavorite 
                                    ? "fill-yellow-400 stroke-yellow-400 scale-110" 
                                    : "stroke-muted-foreground/50 hover:stroke-yellow-400"
                                }`} 
                            />
                        </button>
```

---

## 4. 进阶：只看收藏 (Filter)

既然有了收藏功能，用户肯定想“只看我收藏的网站”。
我们需要去 `components/site-grid.tsx` 里加个过滤器。

1.  在 `SiteGrid` 里也使用 `useLocalStorage` 读取那份 `favorite-sites` 列表。
2.  在分类导航栏 (`CategoryTabs`) 里加一个特殊的分类叫 `"Favorites"`。
3.  当用户点击 `"Favorites"` 时，过滤出 `id` 在列表里的网站。

```tsx
import { useLocalStorage } from "@/hooks/use-local-storage"

    const [favorites] = useLocalStorage<string[]>("favorite-sites", [])

    const filteredSites = useMemo(() => {
        if (activeCategory === "All") return initialSites
        if (activeCategory === "Favorites") { // 👈 新增逻辑
            return initialSites.filter(site => favorites.includes(site.id))
        }
        return initialSites.filter(site => site.tags.includes(activeCategory))
    }, [activeCategory, initialSites, favorites])
```

### 添加 `"Favorites"` 分类
在 `components/category-tabs.tsx` 里添加 `"Favorites"` 分类。
```tsx
import { useLocalStorage } from "@/hooks/use-local-storage"

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

                {/* 原有的分类按钮 */}
```


