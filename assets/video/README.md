# Hero footage

`index-v2.html` plays `hero-bg.mp4` behind the title, muted and looping.

In place now: the TMNS26 official loop — 1920x1080, 41.6s, H.264 + AAC,
**30.3 MB**.

## Before this goes anywhere public

The size is the problem. It is fetched on first visit, `.htaccess`
deliberately leaves media on the long TTL rather than revalidating it, and
the audience is a state portal where a lot of visitors arrive on mobile
data. A background loop wants to be a couple of megabytes, not thirty.

Three changes get it there, in order of payoff:

1. **Shorten it.** Nobody watches 41.6s of footage sitting behind a
   headline. Eight to twelve seconds that loop cleanly is the usual
   answer, and on its own it is most of the saving.
2. **Drop the audio.** There is an AAC track in the file and the element
   is muted, so it is paid for and never heard.
3. **Re-encode for delivery** — CRF around 26-28, and `-movflags +faststart`
   so the `moov` atom leads the file. It currently trails the media, which
   means a player has to go looking for it before it can show frame one.

With ffmpeg:

    ffmpeg -i hero-bg.mp4 -t 12 -an -vf scale=1920:-2 \
           -c:v libx264 -crf 27 -preset slow -movflags +faststart \
           hero-bg-web.mp4

A VP9 `hero-bg.webm` is worth adding next to it — roughly 30% smaller
again. If you make one, put its `<source>` **before** the mp4 in
`index-v2.html`. There is no webm listed at the moment, because listing a
file that does not exist only buys a 404 on every single load.

## The poster

`assets/img/hero-poster.jpg` is the hero fill lifted out of the Figma frame
at 1920x1080. It holds until the first frame decodes, and stays put if the
mp4 404s on a deploy or the codec is refused — so the hero reads as
finished rather than broken either way.

It is a different shot from the clip, so the handover is visible. Export a
frame from the loop itself and overwrite it if you want that seam gone.
