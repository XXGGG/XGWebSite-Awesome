import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. 加载环境变量 (优先读取上级目录的 .env.local)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# 注意：这里必须使用 Service Role Key 才能进行增删改操作
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ 错误：未找到 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量。")
    print("请确保 .env.local 文件存在且包含这些变量。")
    exit(1)

# 2. 初始化 Supabase 客户端
supabase: Client = create_client(url, key)

# 3. 读取 Excel 文件
xlsx_path = os.path.join(os.path.dirname(__file__), 'data.xlsx')
try:
    # 读取 Excel，默认读取第一个 Sheet
    df = pd.read_excel(xlsx_path, engine='openpyxl')
    
    # 清理数据：
    # 1. 删除全为空的行
    df = df.dropna(how='all')
    # 2. 将 NaN 替换为空字符串
    df = df.fillna('')
    # 3. 去除所有字符串列的首尾空格
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
    
except FileNotFoundError:
    print(f"❌ 错误：找不到文件 {xlsx_path}")
    print("请确保 scripts 目录下有 data.xlsx 文件")
    exit(1)
except Exception as e:
    print(f"❌ 读取 Excel 失败: {e}")
    exit(1)

print(f"📊 开始处理 {len(df)} 条数据...")

# 4. 遍历处理每一行
for index, row in df.iterrows():
    state = row.get('state', '').strip()
    title = row.get('title', '').strip()
    
    # 基础数据准备
    # tags 处理：支持 Excel 中的中文/英文逗号，或者空格分隔
    raw_tags = str(row.get('tags', ''))
    tags_list = [t.strip() for t in raw_tags.replace('，', ',').replace(' ', ',').split(',') if t.strip()]

    site_data = {
        "title": title,
        "description": row.get('description', ''),
        "url": row.get('url', ''),
        "tags": tags_list,
        "image_url": row.get('image_url', ''),
        "is_favorite": str(row.get('is_favorite', '')).lower() == 'true'
    }

    if not title:
        print(f"⚠️ 跳过第 {index+1} 行：没有标题")
        continue

    try:
        if state == '新增':
            print(f"➕ [新增] {title}")
            # 先检查是否存在，避免重复插入报错 (可选，取决于数据库约束)
            existing = supabase.table('sites').select('id').eq('title', title).execute()
            if existing.data:
                print(f"   ⚠️ 已存在，跳过新增")
            else:
                supabase.table('sites').insert(site_data).execute()

        elif state == '删除':
            print(f"❌ [删除] {title}")
            supabase.table('sites').delete().eq('title', title).execute()

        elif state == '更新':
            print(f"🔄 [更新] {title}")
            # 更新时不修改创建时间等
            supabase.table('sites').update(site_data).eq('title', title).execute()

        elif state == '正常':
            # print(f"⏭️ [跳过] {title}")
            pass
            
        else:
            print(f"❓ [未知状态] {title}: {state}")

    except Exception as e:
        print(f"💥 处理 {title} 时出错: {e}")

print("\n✅ 所有操作已完成！")
