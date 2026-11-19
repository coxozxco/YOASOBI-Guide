/*
 * Live full-lyrics loader (LRCLIB) + per-song time offset + custom Chinese/LRC storage.
 * Runs in the visitor's browser so all 20 YOASOBI songs load complete synced lines
 * (40-80 lines per song), cache them in localStorage for offline use, and stay synced
 * across both Original MV and Karaoke backing tracks.
 */

const LRC_CACHE_PREFIX = "yoasobi-lrc-full-v1:";
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
}

export function parseLrcToSongLines(lrcText, starterLines = [], customTrText = "") {
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

  // Ensure strictly increasing timestamps so timing ranges never collapse to 0
  let prevTime = -1;
  return items.map((item, index) => {
    let t = item.time;
    if (t <= prevTime) t = Math.round((prevTime + 0.05) * 100) / 100;
    prevTime = t;

    const starter = starterByJp.get(normalizeJp(item.jp));
    const tr = item.inlineTr || customTrList[index] || (starter && starter.tr) || "";
    const line = { index, time: t, jp: item.jp };
    if (tr) line.tr = tr;
    if (starter && starter.reading) line.reading = starter.reading;
    if (starter && starter.romaji) line.romaji = starter.romaji;
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

async function fetchSyncedLrcFromLrclib(trackName) {
  const qArtist = encodeURIComponent("YOASOBI");
  const qTrack = encodeURIComponent(trackName);

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
    const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent("YOASOBI " + trackName)}`);
    if (searchRes.ok) {
      const list = await searchRes.json();
      if (Array.isArray(list)) {
        const hit = list.find(item => item && typeof item.syncedLyrics === "string" && item.syncedLyrics.trim());
        if (hit) return hit.syncedLyrics;
      }
    }
  } catch (e) {}

  return null;
}

export async function hydrateFullLyricsForSong(song) {
  if (!song) return { updated: false, source: "starter" };
  if (!song._starterLyrics) {
    song._starterLyrics = (song.lyrics || []).map(l => ({ ...l }));
  }

  const customTr = getSavedCustomTr(song.id);
  const customLrc = getSavedCustomLrc(song.id);

  // 1. User's custom LRC takes highest priority
  if (customLrc) {
    const parsed = parseLrcToSongLines(customLrc, song._starterLyrics, customTr);
    if (parsed.length > 0) {
      song.lyrics = parsed;
      song._dynamicFullLyrics = true;
      return { updated: true, source: "自訂 LRC", count: parsed.length };
    }
  }

  // 2. Cached LRCLIB full synced lyrics
  let lrcText = safeGet(`${LRC_CACHE_PREFIX}${song.id}`);
  let fromCache = Boolean(lrcText);

  // 3. Fetch live from LRCLIB if not cached
  if (!lrcText) {
    const trackName = (song.titleJa || song.title || "").replace(/\s*\(.*?\)\s*$/, "").trim();
    lrcText = await fetchSyncedLrcFromLrclib(trackName);
    if (lrcText) {
      safeSet(`${LRC_CACHE_PREFIX}${song.id}`, lrcText);
    }
  }

  if (lrcText) {
    const parsed = parseLrcToSongLines(lrcText, song._starterLyrics, customTr);
    if (parsed.length > 0) {
      song.lyrics = parsed;
      song._dynamicFullLyrics = true;
      return { updated: true, source: fromCache ? "LRCLIB（離線快取）" : "LRCLIB 完整同步歌詞", count: parsed.length };
    }
  }

  // Fallback to starter lyrics (still apply custom translations if user pasted them)
  if (customTr) {
    const trLines = customTr.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    song.lyrics = song._starterLyrics.map((l, i) => ({ ...l, tr: trLines[i] || l.tr }));
    return { updated: true, source: "內建歌詞 + 自訂中譯", count: song.lyrics.length };
  }

  song.lyrics = song._starterLyrics.map(l => ({ ...l }));
  return { updated: false, source: "內建示範段", count: song.lyrics.length };
}
