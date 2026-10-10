const $ = (id) => document.getElementById(id);

// Accepts a raw streamkey or a w2g.tv room URL: /rooms/<key>,
// or /room/?room_id=<key>. (?access_key= links are not accepted.)
function parseStreamkey(input) {
  const s = input.trim();
  let key = s;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      key = u.searchParams.get('room_id') || u.pathname.match(/\/rooms?\/([\w-]+)/)?.[1] || '';
    } catch { return null; }
  }
  return /^[\w-]+$/.test(key) ? key : null;
}

function say(msg, kind = '') {
  $('status').textContent = msg;
  $('status').className = kind;
}

async function render() {
  const { apiKey, streamkey, lastCheck } = await chrome.storage.local.get(['apiKey', 'streamkey', 'lastCheck']);
  $('room').textContent = streamkey ? `Active room: ${streamkey}` : 'No room configured.';
  $('room-input').value = streamkey || '';
  // The key is never shown back; blank means "keep the saved one".
  $('apiKey').placeholder = apiKey ? '•••••• saved (leave blank to keep)' : 'Paste your API key';
  $('sources').textContent = lastCheck
    ? `Last duplicate check used: ${lastCheck.used.join(', ') || 'none'}`
    : '';
}

$('save').addEventListener('click', async () => {
  // Either field may be saved on its own; a blank field keeps what's already stored.
  const update = {};
  const key = $('apiKey').value.trim();
  if (key) update.apiKey = key;
  const roomText = $('room-input').value.trim();
  if (roomText) {
    const streamkey = parseStreamkey(roomText);
    if (!streamkey) return say('Enter a valid streamkey or room URL.', 'error');
    update.streamkey = streamkey;
  }
  if (!Object.keys(update).length) return say('Nothing to save.', 'error');
  await chrome.storage.local.set(update);
  $('apiKey').value = '';
  const saved = await chrome.storage.local.get(['apiKey', 'streamkey']);
  const missing = [!saved.apiKey && 'API key', !saved.streamkey && 'room'].filter(Boolean);
  say(missing.length ? `Saved. Still needed: ${missing.join(' and ')}.` : 'Saved.', 'ok');
  render();
});

$('test').addEventListener('click', async () => {
  say('Testing…');
  const res = await chrome.runtime.sendMessage({ type: 'test' });
  say(res.message, res.ok ? 'ok' : 'error');
  render();
});

$('clear').addEventListener('click', async () => {
  const { streamkey, history = {} } = await chrome.storage.local.get(['streamkey', 'history']);
  if (!streamkey) return say('No room configured.', 'error');
  delete history[streamkey];
  await chrome.storage.local.set({ history });
  say('Local history cleared for this room.', 'ok');
});

render();
