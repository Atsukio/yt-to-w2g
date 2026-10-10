// Runs on w2g.tv room pages. Hands the page HTML to the service worker, which
// scans it for YouTube IDs. The playlist DOM isn't documented, so we don't
// depend on specific selectors.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'readPlaylist') sendResponse({ html: document.body.innerHTML });
});
