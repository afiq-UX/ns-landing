# Hero footage

`index-v2.html` plays this behind the title, muted and looping.

| file | what it is | size |
|---|---|---|
| `hero-bg.webm` | the delivery copy — VP9, 1920x1080, 10.0s, no audio | 3.4 MB |
| `hero-bg.mp4` | the same cut for browsers without VP9 — H.264, faststart | 3.7 MB |

Both files are **00:00–00:10 of the supplied TMNS26 film**. Each one is the
window, so the `<video>` just loops whole and no script seeks it. There are
no `data-loop-*` attributes any more, and `js/variant.js` no longer carries
the clamp that read them.

## How they were cut

From the 41.6s original (kept in git history at `7609e9c`):

    ffmpeg -t 10 -i hero-bg-original.mp4 -an \
           -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p \
           -movflags +faststart hero-bg.mp4

    ffmpeg -t 10 -i hero-bg-original.mp4 -an \
           -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -cpu-used 2 \
           -pix_fmt yuv420p hero-bg.webm

CRF 36 on the webm is indistinguishable from the source at 1:1 under the
hero scrim, and lands below the mp4 rather than above it.

## The captions, which are a known cost

The film is the official TMNS26 cut, not a background plate. It carries
burned-in lyric captions and location lower-thirds over most of its 41s —
and the first ten seconds are no exception. From about **00:01** onward the
window shows "Salam Bertandang / negeri adatku", then "Tanah Pusako / elok
berbudi", "Alam terkombang / menjadi guru", "Tuah kotonyo". They sit low in
frame; only the first second or so is clean.

This window was asked for directly, so the captions stay. If they ever read
as a bug behind the H1, **13.9–20.0s is the only caption-free stretch in the
film** — beach aerial, horses on the sand, archery — and the same two
commands with `-ss 13.9 -t 6.1` put the hero back on it.

## The poster

`assets/img/hero-poster.jpg` is frame one of the cut, so the handover from
poster to footage is invisible. It also stays put if both sources fail on a
deploy, which means the hero reads as finished rather than broken. Re-cut
the clip and this has to be re-pulled with it:

    ffmpeg -i hero-bg.mp4 -frames:v 1 -q:v 4 ../img/hero-poster.jpg
