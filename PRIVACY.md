# Privacy Policy - YouTube to W2G

_Last updated: 2026-10-10_

YouTube to W2G is a browser extension that adds YouTube videos to a Watch2Gether (w2g.tv) room playlist. This policy explains what it does with your data.

## What the extension stores
- Your **W2G API key** and **room streamkey**, which you enter in the extension popup.
- They are stored only in your browser using `chrome.storage.local`. They are never sent to the extension author or any analytics service.

## What the extension sends
- When you click **+ W2G**, the extension sends the video's URL, title and thumbnail address, together with your API key, to the Watch2Gether API (`api.w2g.tv`) to add the video to your room's playlist.
- If a video's title can't be read from the page, the extension asks YouTube's public oEmbed service (`youtube.com/oembed`) for it. Only the video URL is sent.
- **Test connection** loads your room page on `w2g.tv`.
- Requests go only to those services. Their own privacy policies apply to how they handle the data.

## What the extension reads
- On `youtube.com` it reads video links and titles from the page so it can add the video you click. This data is not stored or transmitted anywhere except as described above.

## What the extension does not do
- It does not collect personal information, browsing history or analytics.
- It does not sell or share data with third parties.
- It does not load or run remote code.

## Contact
Open an issue at https://github.com/Atsukio/yt-to-w2g/issues.
