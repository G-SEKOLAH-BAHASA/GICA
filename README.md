# GICA BAHASA 網站

GICA（社團法人臺中市國際關懷印尼協會）新版官方網站的製作專案。

- 製作／驗收網址：https://gica-bahasa-demo.gica-org-tw.chatgpt.site/
- 現行正式網站：https://gica.org.tw/
- 正式網站在新版驗收完成前維持不變。

## 專案結構

- `public/`：網站編輯來源。
- `dist/`：可部署至網站主機的靜態成品。
- `.openai/hosting.json`：目前示範網站的發布設定。
- `PROJECT_HANDOFF.md`：跨電腦協作與接手說明。
- `.pages.yml`：Pages CMS 後台欄位與媒體權限設定。
- `public/content/site.json`：非技術人員可管理的公開網站內容。
- `CMS_GUIDE.md`：工讀生與管理員的後台操作、預覽與發布指南。

## 內容管理後台

後台使用 [Pages CMS](https://app.pagescms.org/)。它只顯示 `.pages.yml` 指定的內容與圖片欄位；網站核心程式不在編輯介面中。詳細設定與操作請見 `CMS_GUIDE.md`。

## 資料保護

此儲存庫只能保存公開網站所需的內容。不得加入學員報名資料、電話、地址、居留或雇主資訊、內部個案紀錄，以及未取得公開授權的照片或生命故事。
