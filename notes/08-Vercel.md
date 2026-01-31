# 8. Vercel 部署

绝对不能在生产环境关闭 RLS (Row Level Security)，且 NEXT_PUBLIC_ 会暴露给浏览器。
之前为了开发方便暂时关闭了 RLS，但在上线前，我们需要构建一套 既安全又能管理 的架构。

### 核心概念：两把钥匙 🔑
Supabase 提供了两把钥匙，用法完全不同：

1. Anon Key (公开钥匙)
   
   - 变量名： NEXT_PUBLIC_SUPABASE_ANON_KEY
   - 能暴露吗？ 能（必须暴露给浏览器）。
   - 权限 ：受 RLS 限制。如果不开启 RLS，它就是“裸奔”。
   - 用途 ：给普通访客用（查看网站列表）。
2. Service Role Key (特权钥匙) 🛑
   
   - 变量名： SUPABASE_SERVICE_ROLE_KEY (注意没有 NEXT_PUBLIC_ )
   - 能暴露吗？ 绝对不能！ 只能在服务器端（Server Actions / API）使用。
   - 权限 ： 无视 RLS，拥有最高权限 。
   - 用途 ：给管理员（也就是你）在后台增删改查用。

## 环境变量

在本地开发时，我们把敏感信息（比如数据库地址、密钥）放在 `.env.local` 文件里。
但在 Git 提交时，为了安全，这个文件默认是被**忽略**的（ `.gitignore` 文件，里面有一行 `.env*`）。

这就意味着：**GitHub 上并没有你的 `.env.local` 文件。**
所以当把代码部署到 Vercel 时，Vercel 一脸懵逼：“你要我连 Supabase，但地址和钥匙在哪呢？”

Vercel 的控制台手动告诉它。


## Vercel 配置环境变量

### 第一步：导入项目
1. 代码 Push 到了 GitHub。
2. 打开 [Vercel Dashboard](https://vercel.com/dashboard)。
3. 点击 **"Add New..."** -> **"Project"**。
4. 找到 对应 仓库，点击 **Import**。

### 第二步：填写 Environment Variables (关键！)
去项目的 **Settings** -> **Environment Variables**），把 `.env.local` 里的内容搬过去。

你需要添加以下变量：

| Key (变量名) | Value (值) | 说明 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://.....supabase.co` | 你的 Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.....` | 你的 Supabase Anon Key |

**操作步骤：**
1. 复制本地 `.env.local` 里的 `NEXT_PUBLIC_SUPABASE_URL` 的值。
2. 在 Vercel 的 **Key** 框填 `NEXT_PUBLIC_SUPABASE_URL`，**Value** 框填刚才复制的值。
3. 点击 **Add**。
4. 同样的步骤，添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
