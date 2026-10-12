# YouTube to W2G

> **This project has been merged into [Everything for YouTube](https://github.com/Atsukio/clean-subs-for-youtube) and is now archived.**
> The W2G button lives on there as an optional feature (off by default), alongside other YouTube tools, with every feature switchable from the extension popup. Please use that repo for new releases, issues and updates.

Hover a YouTube video, click the **W** button, and it's added to your Watch2Gether room's playlist.

## Get your W2G API key
1. Log in at <https://w2g.tv>.
2. Open your account's API page (see the [API documentation](https://community.w2g.tv/t/watch2gether-api-documentation/133767)) and copy the key.
3. Your account must be a member of the room you want to add to.

## Load the extension
1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this project folder (the one containing `manifest.json`).
3. Click the extension icon, paste the API key and the room (the raw streamkey or a room URL such as `https://w2g.tv/rooms/<key>` or `https://w2g.tv/room/?room_id=<key>`), then **Save** and **Test connection**.
4. Reload any open YouTube tabs.

## Duplicates
The extension does not check whether a video is already in the playlist. The W2G API has no documented way to read a playlist, so every click adds the video.

## Known limitations
- The W2G API has no documented way to read a playlist, and the `sync_update` response bodies are undocumented. Success is judged by HTTP status only.
- "Test connection" can't validate the API key (every documented endpoint writes); it confirms the room page is reachable.
- YouTube's markup changes often; selectors live in `content/adapters/youtube.js`.
- The button appears on preview thumbnails only, not on the video player. It sits top-left and may overlap YouTube's own overlays (e.g. live badges).
- v1 supports YouTube only. To add a site, add an adapter in `content/adapters/`, list it in the manifest content scripts, and extend `lib/ids.js`.

## License

MIT - see [LICENSE](LICENSE).
