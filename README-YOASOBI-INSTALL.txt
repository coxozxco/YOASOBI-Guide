====================================================
YOASOBI 卡拉 OK 練唱版 — 一鍵替換與上線步驟（GitHub Codespaces）
====================================================

1. 打開你的 GitHub 儲存庫：https://github.com/coxozxco/YOASOBI-Guide
2. 點綠色按鈕「Code」→ 切換到「Codespaces」→ 點「Create codespace on main」。
3. 等瀏覽器裡的 VS Code 載入完成後，把這個 ZIP 解壓縮後的所有檔案與資料夾
   （src/、images/、furigana.js、manifest.json、icon-*.png、apple-touch-icon.png、patch-branding.mjs）
   直接拖進左側檔案總管覆蓋原有檔案。
4. 在下方終端機依序貼上以下指令並按 Enter：

   npm ci
   node patch-branding.mjs
   npx vitest run -u
   npm run build

5. 確認沒有紅字錯誤後，把變更推上 GitHub：

   git add -A
   git commit -m "feat: switch to YOASOBI 20-song karaoke guide"
   git push

6. 等 GitHub Actions 的「Deploy Vite site to GitHub Pages」跑完變綠燈，
   打開 https://coxozxco.github.io/YOASOBI-Guide/ 就完成囉！

【卡拉 OK 使用方式】
- 每首歌預設播放「原唱 MV」，點選影片下方的「MV / Live」切換鈕就會切到「卡拉 OK 伴奏」影片。
- 後續如果想把每首歌補成完整逐行歌詞，只要照 src/song-lyrics.js 與 furigana.js 的格式新增行數即可。
