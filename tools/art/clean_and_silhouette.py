# 從 content/art/original 產生去字版（clean）與剪影（silhouette）。
# 用法：python3 tools/art/clean_and_silhouette.py content/art
# 需要：Pillow、numpy、scipy
import sys, numpy as np, scipy.ndimage as nd
from PIL import Image
R = sys.argv[1]
for i in range(1, 6):
    cid = f'fm{i:03d}'
    im = np.array(Image.open(f'{R}/original/{cid}.png').convert('RGBA'))
    a = im[:, :, 3] > 0
    lab, n = nd.label(a, structure=np.ones((3, 3)))
    sizes = nd.sum(a, lab, range(1, n + 1))
    keep = lab == (np.argmax(sizes) + 1)
    removed = int(a.sum() - keep.sum())
    out = im.copy(); out[~keep] = 0
    Image.fromarray(out).save(f'{R}/clean/{cid}.png', optimize=True)
    sil = np.zeros_like(out); sil[..., :3] = (70, 60, 80); sil[..., 3] = np.where(out[..., 3] > 32, 255, 0)
    Image.fromarray(sil).save(f'{R}/silhouette/{cid}.png', optimize=True)
    print(cid, 'components', n, 'removed px', removed)
