# -*- coding: utf-8 -*-
"""替 CSS / JS 的引用加上版本編號，讓瀏覽器在改版後立刻取得新檔。

GitHub Pages 對靜態檔設 max-age=600，瀏覽器會把 app.js 與 style.css 快取
十分鐘。改版後若只更新其中一支，訪客可能拿到「新的 HTML 配舊的 JS」而看到
壞掉或過時的畫面。加上 ?v=<內容雜湊> 之後，檔案一改網址就變，快取自動失效。

**只有在改過 assets/css/style.css 或 assets/js/app.js 之後才需要執行：**

    python tools/stamp_assets.py

只改 content/*.json 的內容不必執行（JSON 本來就以 no-cache 讀取）。
"""
import glob
import hashlib
import io
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

ASSETS = {
    'assets/css/style.css': 'css',
    'assets/js/app.js': 'js',
}

digests = {}
for path in ASSETS:
    data = io.open(path, 'rb').read()
    digests[path] = hashlib.sha256(data).hexdigest()[:8]
    print(f'{path}  →  v={digests[path]}')

changed = 0
for page in sorted(glob.glob('*.html')):
    src = io.open(page, encoding='utf-8').read()
    out = src
    for path, kind in ASSETS.items():
        attr = 'href' if kind == 'css' else 'src'
        out = re.sub(
            rf'({attr}="{re.escape(path)})(\?v=[0-9a-f]+)?(")',
            rf'\g<1>?v={digests[path]}\g<3>',
            out,
        )
    if out != src:
        io.open(page, 'w', encoding='utf-8', newline='\n').write(out)
        changed += 1
        print(f'  更新 {page}')

print(f'\n共更新 {changed} 個頁面')
