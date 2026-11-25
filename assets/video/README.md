# Hero footage

`index-v2.html` plays this behind the title, muted and looping.

| file | what it is | size |
|---|---|---|
| `hero-bg.webm` | the delivery copy — VP9, 1920x1080, 7.07s, no audio | 2.9 MB |
| `hero-bg.mp4` | the untrimmed original, kept as a fallback | 30.3 MB |

## Why there are two, and why one is clamped

The supplied clip is the TMNS26 official film, not a background plate. It
carries burned-in lyric captions ("Salam Bertandang", "Alam terkembang
mengajar guru") and location lower-thirds ("Masjid Sri Sendayan / Seremban")
across most of its 41 seconds. Those land exactly where the H1 does and read
as a bug.

Sampling it second by second, **13.9-20.0s is the only caption-free
stretch** — beach aerial, horses on the sand, archery. The webm is that
stretch, cut out and re-encoded without the audio track the muted element
was never going to use.

The mp4 is still the whole film. It stays as a fallback for anything that
will not take VP9, and `data-loop-start` / `data-loop-end` on its `<source>`
hold it to the same window. Those attributes are deliberately on the
`<source>` and not the `<video>`: the webm is already the window and must
play whole, so `js/variant.js` reads the window from whichever file the
browser actually chose.

## Still worth doing

**Replace the mp4 with a trimmed one.** 30.3 MB is indefensible on a state
portal where plenty of visitors arrive on mobile data, `.htaccess`
deliberately leaves media on the long TTL, and its `moov` atom trails the
media so a player has to go hunting before frame one:

    ffmpeg -ss 13.9 -t 6.1 -i hero-bg.mp4 -an \
           -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p \
           -movflags +faststart hero-bg-trimmed.mp4

That should land around 2-3 MB. Drop it in as `hero-bg.mp4` and remove the
two `data-loop-*` attributes from its `<source>` — the file will already be
the window.

**Re-encoding the webm through ffmpeg would also fix its header.** It was
produced in-browser, and the recorder does not write a duration into the
container, so `video.duration` reads `Infinity` until something seeks to the
end. Looping is unaffected and nothing on the page reads the duration, but
it is a defect in the file:

    ffmpeg -i hero-bg.webm -c copy hero-bg-fixed.webm

## The poster

`assets/img/hero-poster.jpg` is the first frame of the re-cut, so the
handover from poster to footage is invisible. It also stays put if both
sources fail on a deploy, which means the hero reads as finished rather than
broken.
