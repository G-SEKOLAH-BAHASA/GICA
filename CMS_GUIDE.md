# GICA Website CMS v1 操作指南

## 工讀生日常操作

1. 前往 https://app.pagescms.org/，以管理員邀請的電子郵件登入。
2. 開啟 `G-SEKOLAH-BAHASA/GICA`，選擇管理員指定的內容分支。
3. 在「GICA 網站內容」編輯首頁、關於 GICA、語言學校、全人關懷、消息、故事、照片、影片、按鈕或聯絡資訊。
4. 圖片請使用圖片欄位上傳；影片只貼 YouTube 網址，不上傳影片檔。
5. 儲存後，請管理員開啟或更新 Pull Request。PR 的 `Validate website content` 會檢查資料並產生可下載的 `gica-website-preview`。
6. 管理員確認桌面與手機版後合併 PR。合併到 `main` 後，GitHub Actions 會自動建置並發布 GitHub Pages。

## 管理員首次設定

1. 合併本功能 PR 後，前往 https://app.pagescms.org/ 並用 GitHub 登入。
2. 將 Pages CMS GitHub App 安裝到 `G-SEKOLAH-BAHASA/GICA`（只選此 repository）。
3. 在 Pages CMS 邀請工讀生為 collaborator。使用 collaborator 模式時，工讀生不需要 GitHub repository 權限，只能使用 `.pages.yml` 暴露的內容與媒體介面。
4. 建立內容工作分支（建議 `content/draft`），並要求工讀生固定在該分支編輯；管理員以 PR 預覽、審核與發布。
5. 在 GitHub `Settings → Branches` 為 `main` 建立保護規則：要求 Pull Request、至少一名管理員核准、要求 `Validate website content` 通過，並禁止直接推送。

## 安全與資料規則

- 不得上傳學員報名資料、電話、地址、證件、健康／雇主資料、未去識別化個案紀錄、密碼、API key 或 `.env`。
- 故事與人物照片必須完成去識別化並取得公開授權。
- `.pages.yml` 只開放 `public/content/site.json` 與 `public/assets/uploads/`；CSS、Actions 與核心程式不會出現在工讀生後台。
- GitHub 保留每次 CMS 儲存的 commit，可從 PR 或 commit history 回復。

## 建置與部署

- 內容來源：`public/content/site.json`
- 圖片上傳：`public/assets/uploads/`
- 建置：`node scripts/build.mjs` 將 `public/` 產生為 `dist/`
- 預覽：PR 工作流程驗證後下載 `gica-website-preview` artifact
- 正式發布：合併到 `main` 後由 `.github/workflows/pages.yml` 自動發布 `dist/`
