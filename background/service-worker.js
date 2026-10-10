import { canonicalId, canonicalUrl, idsFromText } from '../lib/ids.js';

const API = 'https://api.w2g.tv';
const READ_RETRY_MS = 24 * 60 * 60 * 1000;

const getSettings = async () => (await chrome.storage.local.get(['apiKey', 'streamkey']));

async function fetchJson(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---- Duplicate-check sources. Each returns a Set of canonical IDs, or null if unavailable.

// Step 1: the docs list no read endpoint, so this is an unverified probe.
// A failure is remembered for 24h so every click isn't slowed down.
async function idsFromApi({ apiKey, streamkey }) {
  const { readProbe } = await chrome.storage.local.get('readProbe');
  if (readProbe && Date.now() - readProbe.at < READ_RETRY_MS && !readProbe.ok) return null;
  let ids = null;
  try {
    const url = `${API}/rooms/${streamkey}/playlists/current/playlist_items?w2g_api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetchJson(url);
    const text = res.ok ? await res.text() : '';
    // Only trust it if the body is JSON that actually contains playlist data.
    if (res.ok && /^\s*[[{]/.test(text)) ids = idsFromText(text);
  } catch { /* unreachable or blocked: treated as unsupported */ }
  await chrome.storage.local.set({ readProbe: { ok: !!ids, at: Date.now() } });
  return ids;
}

// Step 2: ask an open w2g.tv room tab (content/w2g-page.js) for its page HTML.
async function idsFromTab({ streamkey }) {
  // Room URLs come in two shapes (/rooms/<key> and /room/?room_id=<key>).
  const tabs = (await chrome.tabs.query({ url: 'https://w2g.tv/*' })).filter((t) => t.url.includes(streamkey));
  for (const tab of tabs) {
    try {
      const reply = await chrome.tabs.sendMessage(tab.id, { type: 'readPlaylist' });
      if (reply?.html) return idsFromText(reply.html);
    } catch { /* tab has no content script yet (needs reload) */ }
  }
  return null;
}

// Step 3: IDs this extension added itself.
async function idsFromLocal({ streamkey }) {
  const { history = {} } = await chrome.storage.local.get('history');
  return new Set(history[streamkey] || []);
}

async function remember(streamkey, id) {
  const { history = {} } = await chrome.storage.local.get('history');
  const list = new Set(history[streamkey] || []);
  list.add(id);
  history[streamkey] = [...list];
  await chrome.storage.local.set({ history });
}

// Fallback when the page gave us no title (YouTube's markup varies by renderer).
async function oembedTitle(id) {
  try {
    const res = await fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonicalUrl(id))}`);
    return res.ok ? (await res.json()).title : '';
  } catch {
    return '';
  }
}

// ---- Actions

async function addVideo({ url, title }) {
  const settings = await getSettings();
  if (!settings.apiKey || !settings.streamkey) {
    return { status: 'error', message: 'Set API key and room in the extension popup.' };
  }
  const id = canonicalId(url);
  if (!id) return { status: 'error', message: 'Could not identify the video.' };

  const sources = {
    api: await idsFromApi(settings),
    tab: await idsFromTab(settings),
    local: await idsFromLocal(settings),
  };
  const used = Object.entries(sources).filter(([, v]) => v).map(([k]) => k);
  await chrome.storage.local.set({ lastCheck: { used, at: Date.now() } });
  console.log('[W2G] duplicate check sources used:', used.join(', ') || 'none');

  if (used.some((k) => sources[k].has(id))) return { status: 'duplicate', sources: used };

  title = title?.trim() || (await oembedTitle(id));
  console.log('[W2G] adding', id, 'with title:', title || '(none)');
  try {
    const res = await fetchJson(`${API}/rooms/${settings.streamkey}/playlists/current/playlist_items/sync_update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        w2g_api_key: settings.apiKey,
        // `thumb` isn't in the official docs; a forum example uses it, so it's sent best-effort.
        add_items: [{ url: canonicalUrl(id), ...(title && { title }), thumb: `https://i.ytimg.com/vi/${id.slice(3)}/hqdefault.jpg` }],
      }),
    });
    if (!res.ok) {
      const hint = res.status === 401 || res.status === 403 ? 'Check API key and room membership.'
        : res.status === 404 ? 'Room not found (is this the streamkey?).' : '';
      const body = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 150);
      console.warn('[W2G] add failed:', res.status, body);
      return { status: 'error', message: `W2G returned ${res.status}. ${hint} ${body}`.trim() };
    }
  } catch (err) {
    console.warn('[W2G] add failed:', err.name);
    return { status: 'error', message: `Network error reaching W2G (${err.name}).` };
  }
  await remember(settings.streamkey, id);
  return { status: 'added', sources: used };
}

async function testConnection() {
  const settings = await getSettings();
  if (!settings.apiKey || !settings.streamkey) return { ok: false, message: 'Save an API key and room first.' };
  const lines = [];
  try {
    const res = await fetchJson(`https://w2g.tv/rooms/${settings.streamkey}`);
    if (!res.ok) return { ok: false, message: `Room page returned ${res.status}. Check the streamkey.` };
    lines.push('Room page reachable.');
  } catch {
    return { ok: false, message: 'Could not reach w2g.tv.' };
  }
  await chrome.storage.local.remove('readProbe');
  const api = await idsFromApi(settings);
  lines.push(api ? 'API playlist read works.' : 'API playlist read not available (expected).');
  const tab = await idsFromTab(settings);
  lines.push(tab ? 'Open room tab readable.' : 'No readable room tab open.');
  lines.push('API key can only be verified by adding a video.');
  return { ok: true, message: lines.join(' ') };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const job = msg.type === 'add' ? addVideo(msg)
    : msg.type === 'test' ? testConnection()
    : null;
  if (!job) return false;
  job.then(sendResponse, () => sendResponse({ status: 'error', ok: false, message: 'Unexpected error.' }));
  return true; // async response
});
