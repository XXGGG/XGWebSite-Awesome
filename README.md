<div align="center" style="margin:50px">
  <img src='img/XGWebSite-Awesome.svg' width='150'/>
</div>

<h1 align="center">
 XGWebSite-Awesome 
</h1>

<p align='center'>
    <samp>
        一个极简风格(性冷淡风)的精选网站收藏集。
    </samp>
</p>

<br/>

![Project Status](https://img.shields.io/badge/Status-Development-black) ![License](https://img.shields.io/badge/License-MIT-black)

本项目是个人学习项目。（干中学）
主要给我练习 React 和 Next 以及 Supabase 数据库 和 Vercel 部署。

> ps: 其实我是Vue入门的。但是！React也是得了解的嘛~ 工具没有好坏，都要学！

## 🛠️ 技术栈

<img src="https://skillicons.dev/icons?i=nextjs,ts,tailwind,supabase,vercel" />

<br/>

- **框架**: [Next.js 16](https://nextjs.org/) 
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **数据**: [Supabase](https://supabase.com/)
- **部署**: [Vercel](https://vercel.com/)

## 🍕 数据存放 and 增删改查 

目前，网站数据和图片都存放 Supabase 中。

- 在 Supabase 表数据是 👇
 
| 字段名 | 说明 | 类型/备注 |
| :--- | :--- | :--- |
| `id` | ID自增 | uuid，唯一且随机 |
| `title` | 网站标题 | text，唯一且必有 |
| `description` | 网站描述 | text |
| `url` | 网站链接 | text |
| `image_url` | 网站Logo图片链接 | text |
| `tags` | 网站标签 | text[] |
| `is_favorite` | 是否收藏 | bool |
| `created_at` | 创建时间 | timestamptz |

### ✒️ 数据管理方案演进

我在开发过程中探索了多种管理网站数据的方法，以下是我的踩坑记录和最终选择。

### 1️⃣ 方案一：纯本地管理 (JSON/CSV) ⭐⭐
不使用数据库，直接维护项目内的 JSON/CSV 文件，图片也存在本地。
- **优点**：简单粗暴，无需后端。
- **缺点**：每次更新都需要 Git Push 才能上线；无法练习 Supabase。

### 2️⃣ 方案二：NocoDB/Budibase + Supabase ⭐
尝试用可视化数据库工具（类似多维表格）来管理 Supabase 数据。
- **优点**：操作界面友好。
- **缺点**：**兼容性极差**。
  - NocoDB 无法正确识别 PostgreSQL 的 `text[]` (数组) 字段。
  - 多选字段在同步过程中经常丢失类型或变成 JSON，维护成本极高。

### 3️⃣ 方案三：自建后台管理系统 ⭐⭐⭐⭐
开发一个 Admin 后台，支持 CSV 导入和图片上传。
- **优点**：功能完全定制，体验最好。
- **缺点**：开发成本高；数据管理与收集（飞书）割裂，两边数据容易不同步。

### 4️⃣ 方案四：飞书表格 + Python 脚本 (最终方案) ⭐⭐⭐⭐⭐
**核心思路**：以【飞书多维表格】为唯一数据源，通过 Python 脚本单向同步到 Supabase。

**操作流程**：
1.  **日常收集**：在飞书表格中随时记录新发现的网站。
2.  **导出数据**：将飞书表格导出为 Excel (`data.xlsx`)。
3.  **一键同步**：运行 `sync.py` 脚本，自动处理增删改查。
4.  **图片处理**：图片放入 `images_upload` 文件夹，运行 `upload_images.py` 自动上传并关联 URL。

**飞书表格设计**：
只需增加一列 `state` (状态) 用于控制同步逻辑：
- `新增`：默认状态，脚本会将其写入数据库。
- `更新`：脚本会根据 Title 更新该条数据。
- `删除`：脚本会删除数据库中对应 Title 的数据。
- `正常`：脚本跳过不处理。

> **结论**：这是目前最平衡的方案。飞书移动端体验极佳，方便随时记录；Python 脚本解决了繁琐的数据库操作。

---

### 🤖 未来展望：飞书机器人
计划开发一个飞书机器人，通过 API 直接读取飞书表格并同步到 Supabase，实现真正的全自动化（省去导出 Excel 的步骤）。

## 📤 脚本使用说明

在 `scripts` 目录下提供了两个核心脚本：

1.  **数据同步** (`sync.py`)
    - 作用：将 `data.xlsx` 中的数据同步到 Supabase。
    - 用法：配置好 `.env.local` 和 `data.xlsx` 后运行脚本。

2.  **图片上传** (`upload_images.py`)
    - 作用：自动上传图片并更新数据库中的 `image_url`。
    - 用法：将图片（文件名需与网站 Title 一致）放入 `images_upload` 目录，运行脚本。上传成功后文件会自动移至 `images_done`。

## 开发记录：
1. [x] [01-项目规划.md](notes/01-项目规划.md)
2. [x] [02-字体.md](notes/02-字体.md)
3. [x] [03-暗黑模式.md](notes/03-暗黑模式.md)
4. [x] [04-顶部导航栏.md](notes/04-顶部导航栏.md)
5. [x] [05-卡片.md](notes/05-卡片.md)
6. [x] [06-分类栏.md](notes/06-分类栏.md)
7. [x] [07-Supabse.md](notes/07-Supabse.md) 
8. [x] [08-Vercel.md](notes/08-Vercel.md) 
9. [x] [09-数据上传.md](notes/09-数据上传.md)
10. [x] [10-优化-空Logo.md](notes/10-优化-空Logo.md) 
11. [x] [11-Github与投稿.md](notes/11-Github与投稿.md) (投稿先暂停吧.... haha)

## 参考：
- [LKs 网站推荐合集 - lkssite.vip](https://lkssite.vip/)
