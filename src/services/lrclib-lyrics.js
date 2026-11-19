/*
 * Live full-lyrics loader (LRCLIB) + automatic Traditional Chinese & Romaji (Kanji-aware)
 * + per-song time offset + custom Chinese/LRC storage.
 */

const LRC_CACHE_PREFIX = "yoasobi-lrc-full-v2:";
const AUTO_META_CACHE_PREFIX = "yoasobi-auto-tr-rm-v2:";
const CUSTOM_LRC_PREFIX = "yoasobi-custom-lrc-v1:";
const CUSTOM_TR_PREFIX = "yoasobi-custom-tr-v1:";
const OFFSET_PREFIX = "yoasobi-offset-v1:";

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

function normalizeJp(text) {
  return String(text || "").replace(/[\s\u3000、。,.!?！？「」『』（）()・]/g, "").trim();
}

export function getLyricOffset(songId, source) {
  const raw = safeGet(`${OFFSET_PREFIX}${songId}:${source}`);
  const num = Number(raw);
  return Number.isFinite(num) ? Math.round(num * 10) / 10 : 0;
}

export function setLyricOffset(songId, source, value) {
  const clamped = Math.max(-30, Math.min(30, Math.round(Number(value || 0) * 10) / 10));
  safeSet(`${OFFSET_PREFIX}${songId}:${source}`, String(clamped));
  return clamped;
}

export function getSavedCustomTr(songId) {
  return safeGet(`${CUSTOM_TR_PREFIX}${songId}`) || "";
}

export function getSavedCustomLrc(songId) {
  return safeGet(`${CUSTOM_LRC_PREFIX}${songId}`) || "";
}

export function saveCustomTranslations(songId, text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) safeRemove(`${CUSTOM_TR_PREFIX}${songId}`);
  else safeSet(`${CUSTOM_TR_PREFIX}${songId}`, trimmed);
}

export function saveCustomLrc(songId, text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) safeRemove(`${CUSTOM_LRC_PREFIX}${songId}`);
  else safeSet(`${CUSTOM_LRC_PREFIX}${songId}`, trimmed);
}

export function clearCachedLrclib(songId) {
  safeRemove(`${LRC_CACHE_PREFIX}${songId}`);
  safeRemove(`${AUTO_META_CACHE_PREFIX}${songId}`);
}

export function parseLrcToSongLines(lrcText, starterLines = [], customTrText = "", autoTrList = [], autoRmList = []) {
  const rawLines = String(lrcText || "").split(/\r?\n/);
  const timeRe = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const starterByJp = new Map();
  (starterLines || []).forEach(line => {
    const key = normalizeJp(line.jp);
    if (key) starterByJp.set(key, line);
  });

  const customTrList = String(customTrText || "")
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const items = [];
  for (const raw of rawLines) {
    const matches = [...raw.matchAll(timeRe)];
    if (!matches.length) continue;
    const body = raw.replace(timeRe, "").trim();
    if (!body) continue;
    const parts = body.split("|").map(s => s.trim());
    const jp = parts[0] || "";
    const inlineTr = parts[1] || "";
    if (!jp) continue;

    for (const m of matches) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const fracStr = m[3] || "0";
      const frac = parseInt(fracStr, 10) / Math.pow(10, fracStr.length);
      const time = Math.round((min * 60 + sec + frac) * 100) / 100;
      items.push({ time, jp, inlineTr });
    }
  }

  items.sort((a, b) => a.time - b.time);

  let prevTime = -1;
  return items.map((item, index) => {
    let t = item.time;
    if (t <= prevTime) t = Math.round((prevTime + 0.05) * 100) / 100;
    prevTime = t;

    const starter = starterByJp.get(normalizeJp(item.jp));
    const tr =
      item.inlineTr ||
      customTrList[index] ||
      (starter && starter.tr) ||
      (Array.isArray(autoTrList) ? autoTrList[index] : "") ||
      "";
    const romaji =
      (starter && starter.romaji) ||
      (Array.isArray(autoRmList) ? autoRmList[index] : "") ||
      "";

    const line = { index, time: t, jp: item.jp };
    if (tr) line.tr = tr;
    if (starter && starter.reading) line.reading = starter.reading;
    if (romaji) line.romaji = romaji;
    return line;
  });
}

export function buildLineKaraokeTiming(song, sourceLabel = "LRCLIB 同步歌詞") {
  if (!song || !Array.isArray(song.lyrics) || !song.lyrics.length) return null;
  const lines = song.lyrics.map((line, index) => {
    const start = Number(line.time) || 0;
    const next = index + 1 < song.lyrics.length ? Number(song.lyrics[index + 1].time) : start + 4;
    const end = Math.max(start + 0.3, Number.isFinite(next) ? next : start + 4);
    return { start, end, granularity: "line" };
  });
  return {
    format: "timed-lyrics-v1-aligned",
    songId: song.id,
    source: sourceLabel,
    providerOrder: [sourceLabel],
    offset: 0,
    matchedLines: lines.length,
    totalLines: song.lyrics.length,
    lines,
    bundled: true,
  };
}

function pickBestLrclibItem(list, expectedDuration) {
  const candidates = (list || []).filter(item => item && typeof item.syncedLyrics === "string" && item.syncedLyrics.trim());
  if (!candidates.length) return null;
  if (!Number.isFinite(expectedDuration) || expectedDuration <= 0) {
    return candidates[0];
  }
  return candidates
    .slice()
    .sort((a, b) => {
      const da = Number.isFinite(Number(a.duration)) ? Math.abs(Number(a.duration) - expectedDuration) : 999;
      const db = Number.isFinite(Number(b.duration)) ? Math.abs(Number(b.duration) - expectedDuration) : 999;
      return da - db;
    })[0];
}

async function fetchSyncedLrcFromLrclib(trackName, expectedDuration) {
  const qArtist = encodeURIComponent("YOASOBI");
  const qTrack = encodeURIComponent(trackName);

  try {
    const searchRes = await fetch(`https://lrclib.net/api/search?artist_name=${qArtist}&track_name=${qTrack}`);
    if (searchRes.ok) {
      const list = await searchRes.json();
      const best = pickBestLrclibItem(list, expectedDuration);
      if (best) return best.syncedLyrics;
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://lrclib.net/api/get?artist_name=${qArtist}&track_name=${qTrack}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.syncedLyrics === "string" && data.syncedLyrics.trim()) {
        return data.syncedLyrics;
      }
    }
  } catch (e) {}

  try {
    const fallbackRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent("YOASOBI " + trackName)}`);
    if (fallbackRes.ok) {
      const list = await fallbackRes.json();
      const best = pickBestLrclibItem(list, expectedDuration);
      if (best) return best.syncedLyrics;
    }
  } catch (e) {}

  return null;
}

async function translateAndRomanizeChunk(lines) {
  if (!lines.length) return { tr: [], rm: [] };
  const joined = lines.join("\n");
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=zh-TW&dt=t&dt=rm&q=${encodeURIComponent(joined)}`;
  const res = await fetch(url);
  if (!res.ok) return { tr: [], rm: [] };
  const data = await res.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) return { tr: [], rm: [] };

  const trJoined = data[0]
    .filter(seg => Array.isArray(seg) && typeof seg[0] === "string")
    .map(seg => seg[0])
    .join("");

  const rmJoined = data[0]
    .filter(seg => Array.isArray(seg) && typeof seg[3] === "string" && seg[3].trim())
    .map(seg => seg[3])
    .join("\n");

  const tr = trJoined.split(/\r?\n/).map(s => s.trim());
  const rm = rmJoined.split(/\r?\n/).map(s => s.trim());
  return { tr, rm };
}

async function getOrFetchAutoMeta(songId, jpLines) {
  if (!jpLines.length) return { tr: [], rm: [] };
  const cachedRaw = safeGet(`${AUTO_META_CACHE_PREFIX}${songId}`);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (
        cached &&
        Array.isArray(cached.tr) &&
        Array.isArray(cached.rm) &&
        cached.tr.length === jpLines.length &&
        cached.rm.length === jpLines.length
      ) {
        return cached;
      }
    } catch (e) {}
  }

  const trAll = [];
  const rmAll = [];
  const CHUNK_SIZE = 15;
  try {
    for (let i = 0; i < jpLines.length; i += CHUNK_SIZE) {
      const chunk = jpLines.slice(i, i + CHUNK_SIZE);
      const { tr, rm } = await translateAndRomanizeChunk(chunk);
      for (let j = 0; j < chunk.length; j++) {
        trAll.push(tr[j] || "");
        rmAll.push(rm[j] || "");
      }
    }
    if (trAll.some(Boolean) || rmAll.some(Boolean)) {
      const payload = { tr: trAll, rm: rmAll };
      safeSet(`${AUTO_META_CACHE_PREFIX}${songId}`, JSON.stringify(payload));
      return payload;
    }
  } catch (e) {}
  return { tr: [], rm: [] };
}

export async function hydrateFullLyricsForSong(song, expectedDuration = null) {
  if (!song) return { updated: false, source: "starter", count: 0 };
  if (!song._starterLyrics) {
    song._starterLyrics = (song.lyrics || []).map(l => ({ ...l }));
  }

  const customTr = getSavedCustomTr(song.id);
  const customLrc = getSavedCustomLrc(song.id);

  // 1. User custom LRC
  if (customLrc) {
    const preCustom = parseLrcToSongLines(customLrc, song._starterLyrics, customTr);
    const autoMeta = await getOrFetchAutoMeta(`${song.id}:custom`, preCustom.map(l => l.jp));
    const parsed = parseLrcToSongLines(customLrc, song._starterLyrics, customTr, autoMeta.tr, autoMeta.rm);
    if (parsed.length > 0) {
      song.lyrics = parsed;
      song._dynamicFullLyrics = true;
      return { updated: true, source: "自訂 LRC", count: parsed.length };
    }
  }

  // 2. Cached or live LRCLIB full synced lyrics
  let lrcText = safeGet(`${LRC_CACHE_PREFIX}${song.id}`);
  let fromCache = Boolean(lrcText);
  if (!lrcText) {
    const trackName = (song.titleJa || song.title || "").replace(/\s*\(.*?\)\s*$/, "").trim();
    lrcText = await fetchSyncedLrcFromLrclib(trackName, expectedDuration);
    if (lrcText) {
      safeSet(`${LRC_CACHE_PREFIX}${song.id}`, lrcText);
    }
  }

  if (lrcText) {
    const preParsed = parseLrcToSongLines(lrcText, song._starterLyrics, customTr);
    const autoMeta = preParsed.length > 0
      ? await getOrFetchAutoMeta(song.id, preParsed.map(l => l.jp))
      : { tr: [], rm: [] };
    const parsed = parseLrcToSongLines(lrcText, song._starterLyrics, customTr, autoMeta.tr, autoMeta.rm);
    if (parsed.length > 0) {
      song.lyrics = parsed;
      song._dynamicFullLyrics = true;
      const tags = [];
      if (parsed.some(l => l.romaji)) tags.push("羅馬拼音");
      if (parsed.some(l => l.tr)) tags.push("繁中翻譯");
      const base = fromCache ? "LRCLIB 快取" : "LRCLIB";
      return {
        updated: true,
        source: tags.length ? `${base}・${tags.join("＋")}` : base,
        count: parsed.length,
      };
    }
  }

  if (customTr) {
    const trLines = customTr.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    song.lyrics = song._starterLyrics.map((l, i) => ({ ...l, tr: trLines[i] || l.tr }));
    return { updated: true, source: "內建歌詞＋自訂中譯", count: song.lyrics.length };
  }

  song.lyrics = song._starterLyrics.map(l => ({ ...l }));
  return { updated: false, source: "內建示範段", count: song.lyrics.length };
}
