import { readFileSync, writeFileSync, existsSync } from "node:fs";

function replaceInFile(path, pairs) {
  if (!existsSync(path)) return;
  let text = readFileSync(path, "utf8");
  for (const [pattern, replacement] of pairs) {
    text = text.replace(pattern, replacement);
  }
  writeFileSync(path, text, "utf8");
  console.log("Updated:", path);
}

// 1. Patch index.html title & meta while preserving all SVG symbols and DOM IDs
replaceInFile("index.html", [
  [/<title>[\s\S]*?<\/title>/, "<title>YOASOBI 卡拉 OK 練唱本 — 熱門 20 首歌詞與伴奏</title>"],
  [/https:\/\/vaundy\.tiaui\.co\//g, "https://coxozxco.github.io/YOASOBI-Guide/"],
  [/content="#2a0a06"/g, 'content="#131736"'],
  [/Vaundy 應援指南/g, "YOASOBI 卡拉 OK 練唱"],
  [/VAUNDY\s*[“"]?HORO[”"]?\s*TAIPEI\s*應援指南/gi, "YOASOBI 卡拉 OK 練唱本"],
  [/VAUNDY ASIA ARENA TOUR 2026[^"<\n]*/gi, "YOASOBI 卡拉 OK 練唱本（熱門 20 首）"]
]);

// 2. Patch src/ui/home.js visible Vaundy headings while preserving button IDs & routes
replaceInFile("src/ui/home.js", [
  [/ASIA ARENA TOUR 2026/g, "KARAOKE PRACTICE GUIDE"],
  [/<span>VAUNDY<\/span>&ldquo;HORO&rdquo;/g, "<span>YOASOBI</span> 卡拉 OK 練唱"],
  [/VAUNDY/g, "YOASOBI"],
  [/Vaundy/g, "YOASOBI"],
  [/東京\/首爾歌單/g, "熱門 20 首練唱歌單"]
]);

// 3. Patch src/ui/footer.js while keeping attribution to original creators
replaceInFile("src/ui/footer.js", [
  [/VAUNDY ASIA ARENA TOUR 2026\s*[“"]?HORO[”"]?\s*[・·]\s*TAIWAN FAN CHANT GUIDE/g, "YOASOBI 卡拉 OK 練唱本（非官方粉絲製作）"],
  [/VAUNDY ASIA ARENA TOUR 2026\s*[“"]?HORO[”"]?/g, "YOASOBI 卡拉 OK 練唱本"],
  [/TAIWAN FAN CHANT GUIDE/g, "KARAOKE PRACTICE GUIDE"]
]);

// 4. Patch package.json name & bump version, plus sync CHANGELOG.md top entry
if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  pkg.name = "yoasobi-karaoke-guide";
  const parts = String(pkg.version || "1.0.0").split(".").map(Number);
  parts[1] = (parts[1] || 0) + 1;
  parts[2] = 0;
  const nextVer = parts.join(".");
  pkg.version = nextVer;
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");

  if (existsSync("package-lock.json")) {
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    lock.name = "yoasobi-karaoke-guide";
    lock.version = nextVer;
    if (lock.packages && lock.packages[""]) {
      lock.packages[""].name = "yoasobi-karaoke-guide";
      lock.packages[""].version = nextVer;
    }
    writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n", "utf8");
  }

  if (existsSync("CHANGELOG.md")) {
    const cl = readFileSync("CHANGELOG.md", "utf8");
    const header = `## v${nextVer} — YOASOBI 卡拉 OK 練唱版\n\n- 替換為 YOASOBI 熱門 20 首歌曲與卡拉 OK 伴奏雙軌切換。\n- 更新首頁視覺海報、PWA 圖示與網站標題。\n\n`;
    if (!cl.includes(`v${nextVer}`)) {
      writeFileSync("CHANGELOG.md", header + cl, "utf8");
    }
  }
  console.log("Bumped version to v" + nextVer);
}
