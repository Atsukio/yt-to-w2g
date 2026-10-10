// Site adapter contract:
//   name, matches(location), targetSelector, getVideo(target) -> { url, title } | null
// Register with window.W2GAdapters.push(adapter).
(window.W2GAdapters ||= []).push({
  name: 'youtube',
  matches: (loc) => /(^|\.)youtube\.com$/.test(loc.hostname),

  // Thumbnails (old + new renderers), watch-page player, Shorts player.
  targetSelector: [
    'ytd-thumbnail',
    'yt-thumbnail-view-model',
    '#movie_player',
    'ytd-reel-video-renderer',
  ].join(','),

  getVideo(target) {
    const isPlayer = target.id === 'movie_player' || target.tagName === 'YTD-REEL-VIDEO-RENDERER';
    if (isPlayer) {
      // The player always shows whatever the page URL points at.
      const title = target.tagName === 'YTD-REEL-VIDEO-RENDERER'
        ? target.querySelector('h2, .yt-shorts-video-title-view-model')?.textContent
        : document.title.replace(/^\(\d+\)\s*/, '').replace(/\s*-\s*YouTube$/, '');
      return { url: location.href, title: clean(title) };
    }

    const link = target.querySelector('a[href*="/watch?v="], a[href*="/shorts/"], a[href*="youtu.be/"]')
      || target.closest('a[href*="/watch?v="], a[href*="/shorts/"]');
    if (!link) return null;

    const card = target.closest(
      'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer,' +
      'ytd-playlist-video-renderer, yt-lockup-view-model, ytm-shorts-lockup-view-model, ytd-reel-item-renderer'
    ) || target.parentElement;
    const title = link.getAttribute('title')
      || card?.querySelector('#video-title, h3, [title]')?.textContent
      || link.getAttribute('aria-label');
    return { url: new URL(link.getAttribute('href'), location.origin).href, title: clean(title) };
  },
});

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
