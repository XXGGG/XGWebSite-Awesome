<div align="center" style="margin:50px">
  <img src='public/XGWebSite-Awesome.svg' width='150'/>
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

### 😅 暂时还没用上...
- **动画**: [Framer Motion](https://www.framer.com/motion/)

## 🍕 数据存放 and 增删改查 

目前，数据记录和图片都存放和调用 Supabase 中。

### 管理方法一：
飞书或Notion的表格：收集、填写好数据 -> 导出成 CSV -> 导入到 Supabase 
只要注意图片名称和网站名称Title一致，这样图片的调用和上传都很方便~ 
- 优点：
  - 简单方便，无需写代码。
  - 可以批量导入，节省时间。
- 缺点：
  - CSV 导入 Supabase 时需要注意重复或覆盖问题。（Title唯一性，导入Supabase不会忽略也不会覆盖，只会直接报错）

### 管理方法二：
写一个后台管理系统
- 优点：
  - 可以完整掌控数据，避免导入时的问题。
  - 可以自定义操作，满足特殊需求。
- 缺点：
  - 开发麻烦，使用得少。
  - 如果只是单条上传，后台似乎没那么方便。
  - 就算可以批量上传，也不可能在日常收集网站时，每次都手动操作一遍。（并且在日常收集网站时，一般都会先用表格来记录，最后过一段时间再统一发布，这样的话确实不如直接方法一方便。）

### 管理方法三：
直接在项目下的json或csv文件中修改，图片也放在本项目里。 不使用 supabase
- 优点：
  - 简单方便，无需写代码。
  - 可以直接在项目下修改，无需上传到 Supabase。
- 缺点：
  - 每次增删改查都需要push项目到github，才会在vercel上更新。
  - 练习不到 supabase 的使用，也不能完全掌握数据库的操作。

### 管理方法四：

1. NocoDB + Supabase (可惜，管理数组（如Tags）会出错.....)
在NocoDB 新建的MultiSelect(多选) 去到 Supabase 会变成 test
而在 Supabase 字段 text[] 去到 NocoDB 会变成 Specific DB type(我也不知道什么东西，但是反正不可编辑...)
并且在更新字段后，NocoDB 刷新元数据处，一直不肯出现更新后的字段。

2. Budibase + Supabase 
在 Budibase 新建的 MultiSelect(多选) 字段，会在 Supabase 中变成 json 类型。
在 Supabse 中的 text[] 去到 Budibase 中，会变成 text 类型。


无论 NocoDB 还是 Budibase ，他们之前设置的 多选MultiSelect 字段，只要重新导入都不会再次识别成 多选MultiSelect 字段。



## 参考：
- [LKs 网站推荐合集 - lkssite.vip](https://lkssite.vip/)

