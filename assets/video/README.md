# Hero footage

`index-v2.html` expects the background clip here:

    hero-bg.mp4     required — H.264/AAC-free (it plays muted), 1920x1080
    hero-bg.webm    optional — VP9, listed first so browsers that take it
                    do, and skip the larger mp4

Until `hero-bg.mp4` exists the hero renders its poster,
`assets/img/hero-bg.jpg`, which is the v1 shader plate — so the page looks
finished rather than broken, and the same is true if the file 404s on a
deploy or the codec is refused.

Keep it short and quiet: it loops, it is muted, and it sits behind the
title. Aim for under ~4 MB; it is fetched on every first visit, and
`.htaccess` leaves media on the host's long TTL rather than revalidating it.
