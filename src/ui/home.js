import { SHARE_SVG, MOON_SVG } from "./icons.js";
import { siteFooterHtml } from "./footer.js";

const QUICK_CHIPS = [
  { id: "Idol", label: "アイドル" },
  { id: "YoruNiKakeru", label: "夜に駆ける" },
  { id: "Gunjou", label: "群青" },
  { id: "Kaibutsu", label: "怪物" },
  { id: "Shukufuku", label: "祝福" },
  { id: "Yuusha", label: "勇者" },
  { id: "Tabun", label: "たぶん" },
  { id: "UNDEAD", label: "UNDEAD" },
];

export function homeHtml(build, themeToggle = `<button class="theme-toggle home-theme" type="button" data-theme-toggle aria-label="切換主題">${MOON_SVG}</button>`){
  const chipsHtml = QUICK_CHIPS.map(c =>
    `<a class="gm-chip" href="#/song/${c.id}" data-chip-label="${c.label.toLowerCase()}">${c.label}</a>`
  ).join("");

  return `
    <section class="hero gm-home">
      <header class="gm-topbar">
        <span class="gm-brand">YOASOBI <span class="gm-brand-tag">Karaoke</span></span>
        <div class="gm-topbar-right">
          <a class="gm-top-link" href="#/setlist">熱門 20 首</a>
          <a class="gm-top-link" href="#/guide">全部歌曲</a>
          ${themeToggle}
        </div>
      </header>

      <div class="hero-inner gm-center-stage">
        <div class="countdown" id="countdown" hidden><div class="cd-pill"><span class="cd-dday" id="cd-dday"></span><span class="cd-clock" id="cd-clock"></span></div></div>
        <div class="today-card" id="today-card" hidden><div class="today-head"><span id="today-title"></span></div><div id="today-now"></div><ul id="today-list"></ul></div>

        <p class="gm-greeting">YOASOBI 卡拉 OK 練唱</p>
        <h1 class="tour-title gm-headline">今天想唱哪一首？</h1>

        <div class="gm-search-pill">
          <svg class="gm-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
          <input id="home-quick-search" type="search" autocomplete="off" placeholder="搜尋歌名，例如：アイドル、群青、勇者…" aria-label="搜尋 YOASOBI 歌曲" />
          <button type="button" class="gm-go-btn" id="setlist-btn" title="從第一首開始練唱">開始練唱</button>
        </div>

        <div class="gm-chip-row" id="home-chip-row">
          ${chipsHtml}
        </div>

        <div class="gm-sub-actions">
          <button class="gm-subtle-btn" type="button" id="songs-btn">瀏覽全部 20 首歌曲 ›</button>
          <button class="gm-subtle-btn share-btn" type="button" id="share-btn">${SHARE_SVG} 分享</button>
        </div>
      </div>
    </section>

    ${siteFooterHtml(build)}
  `;
}
