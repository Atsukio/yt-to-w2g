# Chrome Web Store listing copy

## Name
YouTube to W2G

## Summary (max 132 characters)
Hover a YouTube video and add it to your Watch2Gether room playlist with one click.

## Category
Productivity (alternative: Social & Communication)

## Detailed description
YouTube to W2G adds a small "+ W2G" button to videos on YouTube. Click it and the video is added to the playlist of the Watch2Gether room you've set up - no copying links, no switching tabs.

How it works
- Hover a video thumbnail on YouTube and click "+ W2G".
- The video, with its title and thumbnail, is added to your room's playlist.
- The button shows whether it worked, or what went wrong.

Setup
1. Get your W2G API key from your Watch2Gether account.
2. Click the extension icon, paste the API key and your room link, and save.

Notes
- Works on youtube.com (home, search, channel pages and the watch-page sidebar).
- Your API key and room are stored only in your browser.
- This extension is not affiliated with or endorsed by YouTube or Watch2Gether.

## Single purpose
Add the YouTube video the user clicks on to the playlist of their chosen Watch2Gether room.

## Permission justifications
- **storage**: saves the user's W2G API key and room streamkey locally in the browser.
- **Host permission https://api.w2g.tv/\***: sends the add-to-playlist request to the Watch2Gether API.
- **Host permission https://w2g.tv/\***: the "Test connection" button loads the user's room page (which may redirect within w2g.tv) to confirm it exists.
- **Host permission https://www.youtube.com/oembed\***: looks up a video's title when it can't be read from the page.
- **Content script on https://www.youtube.com/\***: shows the "+ W2G" button on video thumbnails and reads the clicked video's link and title.
- **Remote code**: none. All code is in the package.

## Privacy policy URL
https://github.com/Atsukio/yt-to-w2g/blob/main/PRIVACY.md  (works once PRIVACY.md is pushed)

## Assets
- Icon: icons/icon128.png
- Screenshots: 1280x800. store-assets/screenshot-1280x800.png is a mock-up; replace with real captures before submitting.
