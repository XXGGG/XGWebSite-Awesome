import { useState, useEffect } from "react"

// T 是一个泛型，代表我们要存的数据类型
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. 初始化 State
  // 解决 Hydration Mismatch：初始值使用 initialValue，确保服务端和客户端一致
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
      // 注意：这里我们得重新从 localStorage 读一遍，以防 storedValue 是旧的
      // 但由于 setValue 的参数可能是函数 (prev => next)，我们需要处理两种情况
      
      let valueToStore: T

      if (value instanceof Function) {
        // 如果是函数更新，我们尽量用当前的 storedValue
        // (在事件监听机制下，storedValue 应该是比较新的)
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
        window.dispatchEvent(new Event("local-storage"))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
