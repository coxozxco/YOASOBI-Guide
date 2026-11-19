import { EXT_LINK_SVG, SHARE_SVG, MOON_SVG, INFO_SVG } from "./icons.js";
import { siteFooterHtml } from "./footer.js";

// Shared by Vite prerendering and client-side navigation.
export function homeHtml(build, themeToggle = `<button class="theme-toggle home-theme" type="button" data-theme-toggle aria-label="切換主題">${MOON_SVG}</button>`){
  return `
    <section class="hero">
      ${themeToggle}
      <div class="hero-inner">
        <div class="eyebrow">KARAOKE PRACTICE GUIDE</div>
        <h1 class="tour-title"><span>YOASOBI</span> 卡拉 OK 練唱</h1>

        <div class="countdown" id="countdown" hidden>
          <div class="cd-pill">
            <span class="cd-dday" id="cd-dday">D-00</span>
            <span class="cd-sep"></span>
            <span class="cd-clock" id="cd-clock">00:00:00</span>
          </div>
        </div>

        <div class="today-card" id="today-card" hidden>
          <div class="today-head"><span class="dot"></span><span id="today-title">今日</span></div>
          <div class="today-now" id="today-now"></div>
          <ul class="today-list" id="today-list"></ul>
        </div>

        <nav class="main-menu" aria-labelledby="main-menu-title">
          <h2 class="main-menu-title" id="main-menu-title">練唱歌單</h2>
          <div class="main-menu-actions">
            <button class="menu-btn" type="button" id="songs-btn">
              <span class="menu-btn-label">全部歌曲</span>
              <span class="menu-btn-note">搜尋歌名・排序</span>
            </button>
            <button class="menu-btn" type="button" id="setlist-btn">
              <span class="menu-btn-label">熱門 20 首</span>
              <span class="menu-btn-note">依序練唱</span>
            </button>
          </div>
        </nav>

        <section class="info-section">
          <div class="menu-card">
            <div class="menu-links">
              <a class="menu-chip" href="https://www.yoasobi-music.jp/" target="_blank" rel="noopener">
                <span class="chip-ico">${EXT_LINK_SVG}</span>
                <span class="chip-label">YOASOBI 官方網站</span>
              </a>
              <a class="menu-chip" href="https://www.youtube.com/@YOASOBI_Official" target="_blank" rel="noopener">
                <span class="chip-ico">${EXT_LINK_SVG}</span>
                <span class="chip-label">官方 YouTube</span>
              </a>
            </div>
          </div>

          <aside class="home-note">
            <span class="home-note-ico">${INFO_SVG}</span>
            <div class="home-note-body">
              <b>卡拉 OK 練唱使用說明</b>
              <p>點進任一首歌後，右側會同步顯示<b>日文歌詞（附假名注音、羅馬字）與繁體中文翻譯</b>；點選影片下方的「原唱 MV / 卡拉 OK」可隨時切換純伴奏練唱。</p>
              <p class="sub">下方工具列支援倍速調整、單曲循環、字級縮放與卡拉 OK 逐字高亮開關。</p>
            </div>
          </aside>

          <div class="home-foot">
            <button class="share-btn" type="button" id="share-btn">${SHARE_SVG} 分享</button>
          </div>
        </section>
      </div>
    </section>

    ${siteFooterHtml(build)}
  `;
}
