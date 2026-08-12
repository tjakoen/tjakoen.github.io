# event-video (portfolio)

The featured video of a `/calendar` event, between the hero photo strip and the body. Rendered by
`content.ts` `renderVideoCard` from the entry's `video:` frontmatter, composed in `shellChrome`.
Nothing renders when the key is absent, or when either the link or the poster is missing.

**It is a poster and a link, not an embed.** An embed means a third-party iframe and its scripts on a
page that has never carried one, and the video lives on that platform either way — the visitor ends up
there the moment they press play. So the whole tile is one anchor over a still we host ourselves, with
a decorative play badge on top (`aria-hidden`; the label carries the meaning). No script in it at all,
which makes the no-JS case the only case.

Flat frontmatter, one string, the same encoding idiom as a photo:

```yaml
video: "https://web.facebook.com/reel/… | /media/feed/…-reel-poster.jpg | 1600x900 | Label over the poster | Alt text for the still"
```

Fields in order: `href | poster | WxH | label | alt`. The dimensions reserve the box so a lazily-loaded
poster cannot shift the page; the label sits over the bottom of the still on a scrim.

```html
<a class="event-video" href="https://web.facebook.com/reel/880926974473813" rel="noopener">
  <img class="event-video__poster" src="/media/feed/gdg-hau-ai-hack-reel-poster.jpg"
       width="1600" height="900" alt="…" loading="lazy" decoding="async">
  <span class="event-video__play" aria-hidden="true">▶</span>
  <span class="event-video__label">Watch the recap on Facebook</span>
</a>
```

**Write the label like a link, not like a button.** It says where the tap goes and whose platform it
lands on, because the picture cannot.
