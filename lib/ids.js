// Canonical video IDs. Format: "<site>:<id>", e.g. "yt:dQw4w9WgXcQ".

const YT_ID = /^[\w-]{11}$/;

export function canonicalId(input) {
  try {
    const u = new URL(input, 'https://www.youtube.com');
    const host = u.hostname.replace(/^(www|m|music)\./, '');
    let id = null;
    if (host === 'youtu.be') {
      id = u.pathname.split('/')[1];
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else id = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/)?.[1];
    }
    return id && YT_ID.test(id) ? `yt:${id}` : null;
  } catch {
    return null;
  }
}

export function canonicalUrl(id) {
  return `https://www.youtube.com/watch?v=${id.slice(3)}`;
}

// Pull every YouTube video ID out of arbitrary text (HTML, JSON, ...).
// Also matches thumbnail URLs (ytimg.com/vi/ID/), which playlist UIs usually render.
const SCAN = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^"'\s]*?&)?v=|shorts\/|embed\/|live\/)|ytimg\.com\/vi(?:_webp)?\/)([\w-]{11})/g;

export function idsFromText(text) {
  const ids = new Set();
  for (const m of text.matchAll(SCAN)) ids.add(`yt:${m[1]}`);
  return ids;
}
