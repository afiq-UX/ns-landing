# Hero footage

`index-v2.html` plays this behind the title, muted and looping.

| file | what it is | size |
|---|---|---|
| `hero-bg.mp4` | the supplied TMNS26 film, whole — H.264, 1920x1080, 41.6s, no audio | 30.3 MB |

**The whole film, not a window.** It closes on the frame it opens on, so
`loop` wraps invisibly and the element needs no clamp: there are no
`data-loop-*` attributes and `js/variant.js` carries no seek.

This replaces a 10.0s cut (00:00–00:10) that shipped at 3.7 MB mp4 +
3.4 MB webm. That cut is in git history at `7609e9c`.

## Two things to settle before this ships

**The size.** 30.3 MB is the source encode, not a web one, and it is the
only copy of the full length that exists. It wants a pass:

    ffmpeg -i hero-bg-original.mp4 -an \
           -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p \
           -movflags +faststart hero-bg.mp4

**There is no webm.** The 3.4 MB one was the ten-second cut, and a VP9
browser would have preferred it over this file and played the wrong thing,
so it was removed rather than left to win. To put one back at full length:

    ffmpeg -i hero-bg-original.mp4 -an \
           -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -cpu-used 2 \
           -pix_fmt yuv420p hero-bg.webm

then add its `<source>` above the mp4's in `index-v2.html`. CRF 36 on the
webm was indistinguishable from the source at 1:1 under the hero scrim.

Re-encoding must not re-cut: the seamless wrap depends on the last frame
being the first, so any trim has to keep both ends.

## The captions

The film is the official TMNS26 cut, not a background plate. It carries
burned-in lyric captions and location lower-thirds over most of its 41s.
From about **00:01** the frame shows "Salam Bertandang / negeri adatku",
then "Tanah Pusako / elok berbudi", "Alam terkombang / menjadi guru",
"Tuah kotonyo", and location titles follow. They sit low in frame.

Playing the film whole means playing all of them. **13.9–20.0s is the only
caption-free stretch** — beach aerial, horses on the sand, archery — but it
is six seconds and it does not loop on itself, so it is a window, not an
alternative to this.

## The poster

`assets/img/hero-poster.jpg` is frame one of the film, which is also its
last frame, so the handover from poster to footage is invisible and so is
every wrap. It also stays put if the source fails on a deploy, which means
the hero reads as finished rather than broken. Re-encode and re-pull it:

    ffmpeg -i hero-bg.mp4 -frames:v 1 -q:v 4 ../img/hero-poster.jpg
