# 產生 Phase 1 前端原型用的縮小圖（webp）。
# 用法：python3 tools/art/make_prototype_assets.py content/art src/assets/proto
# 注意：原型階段才把插畫打包進前端；Phase 2 起正式插畫只放在 Supabase 私有 bucket。
import sys, os
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(f'{dst}/characters', exist_ok=True)
os.makedirs(f'{dst}/silhouettes', exist_ok=True)
for i in range(1, 6):
    cid = f'fm{i:03d}'
    Image.open(f'{src}/clean/{cid}.png').convert('RGBA').resize((768, 768), Image.LANCZOS) \
        .save(f'{dst}/characters/{cid}.webp', quality=86, method=6)
    Image.open(f'{src}/silhouette/{cid}.png').convert('RGBA').resize((384, 384), Image.LANCZOS) \
        .save(f'{dst}/silhouettes/{cid}.webp', quality=80, method=6)
logo = Image.open(f'{src}/brand/logo.png').convert('RGBA')
logo.crop(logo.getbbox()).resize((512, int(512 * logo.crop(logo.getbbox()).height / logo.crop(logo.getbbox()).width)), Image.LANCZOS) \
    .save(f'{dst}/logo.webp', quality=90, method=6)
print('ok')
