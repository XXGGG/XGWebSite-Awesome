import os
import shutil
from supabase import create_client, Client
from dotenv import load_dotenv
import mimetypes

# 1. 加载环境变量
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ 错误：未找到 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量。")
    exit(1)

supabase: Client = create_client(url, key)

# 2. 文件夹路径配置
BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, 'images_upload')  # 待上传
DONE_DIR = os.path.join(BASE_DIR, 'images_done')      # 已完成
BUCKET_NAME = 'site-images'

# 确保文件夹存在
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DONE_DIR, exist_ok=True)

def upload_image():
    # 获取待上传文件列表
    files = [f for f in os.listdir(UPLOAD_DIR) if os.path.isfile(os.path.join(UPLOAD_DIR, f))]
    
    if not files:
        print("📂 images_upload 文件夹是空的，没有图片需要上传。")
        return

    print(f"🚀 发现 {len(files)} 张图片，开始上传...\n")

    for filename in files:
        # 1. 解析文件名 (假设文件名就是 title，例如 "Google.png")
        title_name = os.path.splitext(filename)[0]
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 获取 MIME 类型
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = 'application/octet-stream'

        try:
            print(f"📤 正在处理: {filename} (对应标题: {title_name})")
            
            # 2. 检查数据库是否存在该 Title
            # 注意：这里我们只更新已存在的网站。如果网站还没创建，图片就先不传。
            res = supabase.table('sites').select('id').eq('title', title_name).execute()
            
            if not res.data:
                print(f"   ⚠️ 跳过：数据库里没找到标题为 '{title_name}' 的网站。请先运行 sync.py 创建网站。")
                continue

            # 3. 上传到 Storage (覆盖模式)
            # 使用 timestamp 防止浏览器缓存，或者直接覆盖
            # 这里我们选择直接用文件名作为存储路径，方便管理
            storage_path = filename
            
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Upsert: 上传并覆盖
            supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": mime_type, "upsert": "true"}
            )
            
            # 4. 获取公开链接
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)
            
            # 5. 更新数据库 image_url 字段
            supabase.table('sites').update({"image_url": public_url}).eq('title', title_name).execute()
            print(f"   ✅ 上传成功！链接已更新: {public_url}")

            # 6. 移动文件到 done 文件夹
            shutil.move(file_path, os.path.join(DONE_DIR, filename))
            print(f"   📦 文件已归档到 images_done")

        except Exception as e:
            print(f"   ❌ 上传失败: {e}")

    print("\n🎉 所有任务处理完成！")

if __name__ == "__main__":
    upload_image()
