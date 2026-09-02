# 生態水文與生態減災研究室 網站

國立臺灣大學土木工程學系　施上粟教授研究室　（取代原 Weebly 站 `ntuce908.weebly.com`）

純靜態網站，**不需要任何建置工具**（沒有 Node、沒有 npm、沒有編譯）。
所有內容都放在 `content/` 的 JSON 檔，網頁載入時讀取並渲染，中英雙語即時切換。

---

## 專案結構

```
ntuce908-website/
├─ index.html            首頁
├─ research.html         研究主題
├─ pi.html               主持人
├─ members.html          研究成員
├─ publications.html     學術著作
├─ content/              ← 內容都在這裡，改這些檔就會改網站
│  ├─ site.json          站名、標語、聯絡資訊、頁尾連結
│  ├─ pi.json            老師簡介、研究興趣、教授課程
│  ├─ research.json      四大研究主題
│  ├─ members.json       成員（staff / student / alumni）
│  ├─ publications.json  期刊論文 42 篇
│  └─ news.json          最新消息
├─ assets/
│  ├─ css/style.css      版面樣式
│  ├─ js/app.js          渲染與語言切換
│  └─ img/               logo、主視覺、成員照片
└─ admin/                後台（Sveltia CMS）
   ├─ index.html
   └─ config.yml         ← 部署前要改 repo 名稱
```

---

## 本機預覽

網頁用 `fetch()` 讀取 JSON，**直接雙擊 HTML 檔會無法載入內容**，必須用本機伺服器：

```bash
cd ntuce908-website && python -m http.server 4173
```

然後開瀏覽器到 <http://localhost:4173>。

## 怎麼改內容

### 方式 A：後台網頁（老師與學生都適用，不用碰程式）

部署完成後開 `https://你的網址/admin/`，用 GitHub 帳號登入，
左側就有「網站設定／研究主題／研究成員／學術著作／最新消息」五個區塊，
填表單、按 Publish，網站幾分鐘後自動更新。

啟用步驟見第 5 節。

### 方式 B：直接改 JSON（自己維護最快）

打開 `content/` 裡對應的檔案編輯即可。所有欄位都是 `_zh` / `_en` 成對：
範例：
```jsonc
// content/members.json
{
  "people": [
    {
      "group": "student",          // staff（研究人員）/ student（在學）/ alumni（校友）
      "name_zh": "張凱傅",
      "name_en": "Kai-Fu Chang",
      "role_zh": "碩士生",
      "role_en": "Master student",
      "topic_zh": "魚道",
      "topic_en": "Fishway optimization and eco-hydraulics",
      "education": ["B.S., Hydraulic and Ocean Engineering, National Cheng Kung University, 2025"],
      "hometown_zh": "台中",
      "hometown_en": "New Taipei, Taiwan",
      "grad_year": 2027,           // 用來排序，數字越大越前面
      "photo": "assets/img/people/kai-fu-chang.jpg",
      "email": ""
    }
  ]
}
```

新增論文：在 `content/publications.json` 的 `publications` 陣列最前面加一筆，
`year` 會自動分組排序，`link` 放 DOI。

照片放 `assets/img/people/`，檔名用英文小寫加連字號。

> 只有 `_zh` 或只有 `_en` 也不會壞——缺哪一邊就自動顯示另一邊。

---

## 改過 CSS 或 JS 之後

GitHub Pages 讓瀏覽器把 `style.css` 與 `app.js` 快取十分鐘，所以改完可能要等一陣子
才看得到，甚至出現「新的 HTML 配舊的 JS」而畫面怪怪的。

**只要動過 `assets/css/style.css` 或 `assets/js/app.js`，上傳前先跑一次：**

```bash
python tools/stamp_assets.py
```

它會依檔案內容算出版本編號、寫進五個頁面的引用網址，檔案一改網址就變，快取自動失效。

> 只改 `content/` 裡的 JSON 不用跑，內容本來就是即時讀取的。

---

## 部署

網站是純靜態檔案，以下任一種都可以，擇一即可：

### GitHub Pages（免費、推薦）

```bash
cd ntuce908-website
git init && git add -A && git commit -m "Initial lab website"
git branch -M main
git remote add origin https://github.com/<帳號>/<倉庫名>.git
git push -u origin main
```

然後到 GitHub 倉庫 → Settings → Pages → Source 選 `main` / `/ (root)` → Save。
幾分鐘後網址是 `https://<帳號>.github.io/<倉庫名>/`。

### Cloudflare Pages（免費，速度較快、可綁自訂網域）

Cloudflare 後台 → Workers & Pages → Create → Pages → 連結上面的 GitHub 倉庫 →
Build command 留空、Output directory 填 `/` → Deploy。


---

## 啟用後台（讓老師也能自己改）

1. 先照第 4 節把網站推上 GitHub 並部署。
2. 編輯 `admin/config.yml`，把 `repo: OWNER/REPO` 改成實際的 `帳號/倉庫名`。
3. 請老師註冊一個 GitHub 帳號（免費）。
4. GitHub 倉庫 → Settings → Collaborators → 邀請老師的帳號（權限 Write）。
5. 老師開 `https://你的網址/admin/` → 按 Sign in with GitHub → 授權一次即可。

之後老師在後台按 Publish，等同於對倉庫送出一次 commit，網站會自動重新部署。
每一次修改都留在 git 紀錄裡，改壞了可以還原。

---

## 待辦

- [ ] `content/members.json` 的在學學生仍是 2019–2020 年舊資料，需更新為現任成員
- [ ] `content/members.json` 的 `topic_zh` 尚未填寫（目前中文版會自動顯示英文題目）
- [ ] `content/site.json` 的聯絡電話與地址請老師確認
- [ ] `admin/config.yml` 的 `repo` 待填
- [ ] 決定正式網域後，更新對外連結與舊站的轉址說明

---

## 內容來源

成員與論文資料由舊站 `ntuce908.weebly.com` 於 2026-09-02 擷取轉換：
論文 42 篇（2004–2026，含 DOI 連結）、成員 16 位（含照片）。
