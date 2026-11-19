import { EXT_LINK_SVG, SHARE_SVG, MOON_SVG } from "./icons.js";
import { siteFooterHtml } from "./footer.js";

const QUICK_PICKS = [
  { id: "Idol", jp: "アイドル", sub: "我推的孩子 OP", color: "pink" },
  { id: "YoruNiKakeru", jp: "夜に駆ける", sub: "出道代表作", color: "violet" },
  { id: "Gunjou", jp: "群青", sub: "藍色時期", color: "sky" },
  { id: "Kaibutsu", jp: "怪物", sub: "BEASTARS OP", color: "rose" },
  { id: "Shukufuku", jp: "祝福", sub: "水星的魔女 OP", color: "emerald" },
  { id: "Yuusha", jp: "勇者", sub: "葬送的芙莉蓮 OP", color: "amber" },
  { id: "Tabun", jp: "たぶん", sub: "抒情代表作", color: "indigo" },
  { id: "UNDEAD", jp: "UNDEAD", sub: "物語系列主題曲", color: "cyan" },
];

// Shared by Vite prerendering and client-side navigation.
export function homeHtml(build, themeToggle = `<button class="theme-toggle home-theme" type="button" data-theme-toggle aria-label="切換主題">${MOON_SVG}</button>`){
  const quickCards = QUICK_PICKS.map(item => `
    <a class="tf-song-pill tf-accent-${item.color}" href="#/song/${item.id}">
      <span class="tf-pill-dot"></span>
      <span class="tf-song-pill-title">${item.jp}</span>
      <span class="tf-song-pill-sub">${item.sub}</span>
    </a>
  `).join("");

  return `
    <section class="hero tf-hero">
      <header class="tf-topbar">
        <div class="tf-brand">
          <span class="tf-brand-dot"></span>
          <span class="tf-brand-name">YOASOBI KARAOKE</span>
        </div>
        <div class="tf-topbar-actions">
          <a class="tf-nav-link" href="#/guide">全部歌曲</a>
          <a class="tf-nav-link" href="#/setlist">熱門 20 首</a>
          ${themeToggle}
        </div>
      </header>

      <div class="hero-inner tf-hero-inner">
        <div class="tf-hero-badge">🎤 原唱 MV &amp; 卡拉 OK 伴奏雙軌</div>
        <h1 class="tour-title tf-title"><span>YOASOBI</span> 卡拉 OK 練唱</h1>
        <p class="tf-subtitle">同步日文、羅馬拼音與繁中歌詞，挑一首歌直接開唱</p>

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

        <nav class="main-menu tf-main-menu" aria-labelledby="main-menu-title">
          <h2 class="main-menu-title" id="main-menu-title" hidden>練唱歌單</h2>
          <div class="main-menu-actions tf-cta-row">
            <button class="menu-btn tf-btn-primary" type="button" id="setlist-btn">
              <span class="menu-btn-label">熱門 20 首</span>
              <span class="menu-btn-note">依序開唱</span>
            </button>
            <button class="menu-btn tf-btn-secondary" type="button" id="songs-btn">
              <span class="menu-btn-label">全部歌曲</span>
              <span class="menu-btn-note">搜尋與排序</span>
            </button>
          </div>
        </nav>

        <section class="info-section tf-sections">
          <div class="tf-section-card">
            <div class="tf-section-head">
              <h3>熱門點播</h3>
              <a class="tf-more-link" href="#/guide">全部 20 首 ›</a>
            </div>
            <div class="tf-song-grid">
              ${quickCards}
            </div>
          </div>

          <div class="tf-links-bar">
            <a class="menu-chip tf-chip" href="https://www.yoasobi-music.jp/" target="_blank" rel="noopener">
              <span class="chip-ico">${EXT_LINK_SVG}</span>
              <span class="chip-label">YOASOBI 官網</span>
            </a>
            <a class="menu-chip tf-chip" href="https://www.youtube.com/@YOASOBI_Official" target="_blank" rel="noopener">
              <span class="chip-ico">${EXT_LINK_SVG}</span>
              <span class="chip-label">官方 YouTube</span>
            </a>
            <button class="share-btn tf-chip" type="button" id="share-btn">${SHARE_SVG} 分享</button>
          </div>
        </section>
      </div>
    </section>

    ${siteFooterHtml(build)}
  `;
}
