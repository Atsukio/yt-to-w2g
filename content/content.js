(() => {
  const adapter = (window.W2GAdapters || []).find((a) => a.matches(location));
  if (!adapter) return;

  const MARK = 'data-w2g-injected';
  const RESULT_MS = 3000; // how long the result message stays before resetting
  const STYLE = `
    :host { all: initial; position: absolute; top: 8px; left: 8px; z-index: 2147483647; display: none; }
    button { all: initial; font: 600 12px/1 Arial, sans-serif; color: #fff; background: #e8532b;
      padding: 6px 9px; border-radius: 4px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.5); }
    button:hover { background: #ff6a40; }
    button[data-state="loading"] { opacity: .7; cursor: wait; }
    button[data-state="added"] { background: #2e9d4f; }
    button[data-state="error"] { background: #c0392b; }
  `;
  const LABELS = {
    idle: '+ W2G', loading: '…', added: 'Added', error: 'Error',
  };

  function createButton(target) {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'closed' });
    root.innerHTML = `<style>${STYLE}</style><button type="button"></button>`;
    const btn = root.querySelector('button');
    let timer;

    const setState = (state, title = '') => {
      btn.dataset.state = state;
      btn.textContent = LABELS[state];
      btn.title = title;
    };
    setState('idle');

    // Swallow everything so the site never sees the click and opens the video.
    for (const type of ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup']) {
      btn.addEventListener(type, (e) => { e.stopPropagation(); e.preventDefault(); });
    }
    btn.addEventListener('click', async () => {
      if (btn.dataset.state === 'loading') return;
      const video = adapter.getVideo(target); // read at click time: YouTube recycles elements
      if (!video) return flash('error', 'Could not find the video link.');
      setState('loading');
      host.keepVisible = true;
      try {
        const res = await chrome.runtime.sendMessage({ type: 'add', ...video });
        if (res.status === 'error') console.warn('[YouTube to W2G]', res.message);
        flash(res.status, res.message || '');
      } catch {
        flash('error', 'Extension was reloaded. Refresh the page.');
      }
    });

    // Keep the button on screen while the result shows, even if the mouse leaves.
    function flash(state, title) {
      setState(state, title);
      host.keepVisible = true;
      host.style.display = 'block';
      clearTimeout(timer);
      timer = setTimeout(() => {
        setState('idle');
        host.keepVisible = false;
        if (!target.matches(':hover')) host.style.display = 'none';
      }, RESULT_MS);
    }

    root.host.style.display = 'none';
    return host;
  }

  function inject(target) {
    if (target.hasAttribute(MARK)) return;
    target.setAttribute(MARK, '');
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    const host = createButton(target);
    target.appendChild(host);
    target.addEventListener('mouseenter', () => { host.style.display = 'block'; });
    target.addEventListener('mouseleave', () => { if (!host.keepVisible) host.style.display = 'none'; });
  }

  const scan = () => document.querySelectorAll(adapter.targetSelector).forEach(inject);

  // Debounced: YouTube mutates the DOM constantly.
  let pending;
  const schedule = () => { clearTimeout(pending); pending = setTimeout(scan, 300); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('yt-navigate-finish', schedule);
  scan();
})();
