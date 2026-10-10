# W2G Quick Add

Hover a YouTube video, click **+ W2G**, and it's added to your Watch2Gether room's playlist (unless it's already there).

## Get your W2G API key
1. Log in at <https://w2g.tv>.
2. Open your account's API page (see the [API documentation](https://community.w2g.tv/t/watch2gether-api-documentation/133767)) and copy the key.
3. Your account must be a member of the room you want to add to.

## Load the extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this project folder (the one containing `manifest.json`).
3. Click the extension icon, paste the API key and the room (raw streamkey or `https://w2g.tv/rooms/<key>`), then **Save** and **Test connection**.
4. Reload any open YouTube / w2g.tv tabs.

## Duplicate check
Sources are combined in this order; the popup shows which ones answered on the last add (also logged in the service worker console).
1. **API read** - the docs list no read endpoint, so the extension probes `GET .../playlist_items` and remembers a failure for 24h. Expected to be unavailable.
2. **Open room tab** - if a `w2g.tv/rooms/<key>` tab is open (loaded after installing), its page is scanned for YouTube links/thumbnails.
3. **Local history** - IDs this extension has added per room. Clear it from the popup.

Videos are matched by canonical ID (`yt:VIDEOID`), so `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, extra params and timestamps all count as the same video.

## Known limitations
- The W2G API has no documented way to read a playlist, and the `sync_update` response bodies are undocumented. Success is judged by HTTP status only.
- The room-tab reader scans page HTML for YouTube IDs because the w2g.tv playlist markup is undocumented. It may miss items, and it may also match the currently playing video. Unverified.
- Videos added directly in W2G, with no room tab open, can't be detected; they'll be added again.
- "Test connection" can't validate the API key (every documented endpoint writes); it confirms the room page is reachable.
- YouTube's markup changes often; selectors live in `content/adapters/youtube.js`.
- The player button sits top-left and may overlap YouTube's own overlays (e.g. the live/ad badges).
- v1 supports YouTube only. To add a site, add an adapter in `content/adapters/`, list it in the manifest content scripts, and extend `lib/ids.js`.

## License

MIT - see [LICENSE](LICENSE).
