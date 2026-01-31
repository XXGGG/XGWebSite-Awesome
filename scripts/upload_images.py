import os
import shutil
import hashlib
import tldextract
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
            res = supabase.table('sites').select('id, url').eq('title', title_name).execute()
            
            if not res.data:
                print(f"   ⚠️ 跳过：数据库里没找到标题为 '{title_name}' 的网站。请先运行 sync.py 创建网站。")
                continue

            site_info = res.data[0]
            site_url = site_info.get('url', '')

            # 3. 生成云端文件名 (使用域名主体)
            # 策略：尝试从网站 URL 中提取域名主体（domain），如果提取失败或 URL 为空，则回退到 MD5 哈希。
            # 例如：https://www.google.com -> google.png
            #       https://github.com -> github.png
            file_ext = os.path.splitext(filename)[1]
            
            domain_name = ""
            if site_url:
                try:
                    # 使用 tldextract 智能提取域名主体 (自动处理 .com.cn, .co.uk 等复杂后缀)
                    extracted = tldextract.extract(site_url)
                    if extracted.domain:
                        domain_name = extracted.domain
                except Exception:
                    pass
            
            if domain_name:
                # 成功提取到域名主体，使用它作为文件名
                # 为了防止同一个域名有多个不同图片（虽然理论上不太可能），可以加个 hash 后缀或者直接用
                # 这里我们直接用域名，简洁为主
                storage_path = f"{domain_name}{file_ext}"
            else:
                # 提取失败（可能是 URL 为空或非法），回退到 MD5 方案
                print(f"   ⚠️ 警告：无法从 URL '{site_url}' 提取域名，将使用哈希文件名。")
                filename_hash = hashlib.md5(filename.encode('utf-8')).hexdigest()
                storage_path = f"{filename_hash}{file_ext}"
            
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
