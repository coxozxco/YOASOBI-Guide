import { GITHUB_SVG } from "./icons.js";

const REPO_URL = "https://github.com/coxozxco/YOASOBI-Guide";
const TAIWAN_SOURCE_URL = "https://github.com/watain666/Vaundy-Taiwan-2026";
const KOREAN_AUTHOR_URL = "https://gall.dcinside.com/mgallery/board/view/?id=vaundy0606&no=35550";

export function siteFooterHtml(build){
  return `
    <footer class="credits">
      <nav class="credits-links" aria-label="專案連結">
        <p class="credits-copy">
          <span class="credits-copy-desktop">YOASOBI 卡拉 OK 練唱本（非官方粉絲練唱用，歌詞版權歸原權利人所有）</span>
          <span class="credits-copy-mobile">YOASOBI 卡拉 OK 練唱本<br>（非官方粉絲練唱用）</span>
          <span class="build">${build}</span>
        </p>
        <span class="credits-origin">
          <a class="credits-link credits-repo" href="${REPO_URL}" target="_blank" rel="noopener" aria-label="GitHub Repo" title="GitHub Repo">
            ${GITHUB_SVG}
          </a>
          <a class="credits-fork" href="${TAIWAN_SOURCE_URL}" target="_blank" rel="noopener">Based on Vaundy-Taiwan-2026</a>
          <a class="credits-fork" href="${KOREAN_AUTHOR_URL}" target="_blank" rel="noopener">Original by 카쿠메</a>
        </span>
      </nav>
    </footer>
  `;
}
