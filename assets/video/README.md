# Hero footage

`index-v2.html` expects the background clip here:

    hero-bg.mp4     required — H.264/AAC-free (it plays muted), 1920x1080
    hero-bg.webm    optional — VP9, listed first so browsers that take it
                    do, and skip the larger mp4

Until `hero-bg.mp4` exists the hero renders its poster,
`assets/img/hero-poster.jpg` — the hero fill lifted straight out of the
Figma frame at 1920x1080 — so the page already looks like the design, and
still does if the file 404s on a deploy or the codec is refused.

That fill is a video in Figma, but Figma only hands out stills of it: the
MCP returns the poster frame and a 480x270 preview, never the clip, and
`export_video` renders keyframe timelines rather than fills. So the clip
itself has to come from wherever it was uploaded from.

Keep it short and quiet: it loops, it is muted, and it sits behind the
title. Aim for under ~4 MB; it is fetched on every first visit, and
`.htaccess` leaves media on the host's long TTL rather than revalidating it.
