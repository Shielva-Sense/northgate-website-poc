# Imagery in this demo

Every photograph in `public/img` is **AI-generated** for this demo. None of them
shows a real building, a real clinician or a real patient, and the practice
itself — Northgate Family Health — is fictional.

| File | What it shows | Where it is used |
|---|---|---|
| `consultation.jpg` | Consultation moment | Hero **poster** (see below) |
| `../video/hero.mp4` | The same shot, animated | Hero background, playing |
| `reception.jpg` | Reception desk | Operations band background |
| `waiting.jpg` | Waiting area | Gallery |
| `consulting.jpg` | Consulting room | Gallery |
| `treatment.jpg` | Minor-procedures room | Gallery |
| `recovery.jpg` | Recovery room | Gallery |
| `exterior.jpg` | Practice exterior | Gallery |
| `team/*.jpg` | Four clinician portraits | Team section |
| `dept/*.jpg` | Six department card images | Find a doctor |
| `story-hannah.jpg` | Patient-story first frame | Story **poster** |
| `../video/story-hannah.mp4` | Spoken patient story | Story section, click to play |

## Before this goes live for a real client

Replace all of them with the client's own photography, or with properly
licensed stock. Two reasons, and the first is the one that matters:

1. **Presenting a generated face as a named, registered clinician is a
   misrepresentation.** It is fine in a demo of the build; it is not fine on a
   real practice's site, where patients choose a doctor by that photo.
2. Generated interiors will not match the client's actual premises, and the
   whole argument of the gallery section is "this is the real place".

Swapping them needs no code change:

- Facility photos: keep the same filenames in `public/img`.
- Portraits: drop files into `public/img/team` and set `photo:` on the clinician
  in `app/features/clinic/constants.ts`. Leaving `photo` undefined is supported
  and renders a designed monogram instead — never a stock face.

Landscape images are sized 1536×864, portraits 817×1100, all JPEG. Keep to
roughly those dimensions; `next.config.ts` sets `images.unoptimized` because the
invite gate covers `/img/*` and the image optimizer cannot authenticate to it,
so what you put in `public/` is what is served.

## The hero video

`public/video/hero.mp4` plays muted, looping and inline behind the headline, the
way kling.ai's own landing page does it.

`consultation.jpg` is its `poster`, and that is deliberate: if the video 404s,
the codec is unsupported, the network is slow or the browser refuses autoplay,
the hero falls back to exactly the still design it replaced. It is never blank.
Verified by loading the page with no mp4 present at all.

It also does two things kling.ai does not:

- **Never plays under `prefers-reduced-motion: reduce`.** A full-bleed moving
  background is the single worst offender for vestibular triggers.
- **Pauses when scrolled out of view or the tab is backgrounded**, so it is not
  decoding frames nobody is looking at.

To swap it, drop a new `hero.mp4` in `public/video` and keep a matching still as
the poster. Keep it short, silent and near-motionless — it sits under text, so
anything with real movement in it makes the headline unreadable.

## The patient story video — read this before it goes anywhere near a client

`public/video/story-hannah.mp4` is a **synthetic person speaking a scripted
testimonial about a clinic that does not exist.** It is here so the section can
be demonstrated with sound, and for no other reason.

It must never appear on a real practice's site. A fabricated patient testimonial
is not a placeholder problem, it is a misrepresentation, and in healthcare it is
also a regulated one:

- **UK** — the GMC and the ASA/CAP Code both treat testimonials as advertising
  claims that must be genuine and substantiable. Fabricating one is a breach.
- **Identifiable patients need written, specific consent** before any footage is
  published, and consent to be filmed is not consent to be used in advertising.
  Get it in writing, and record what it covers and how it can be withdrawn.
- **US** — FTC endorsement rules prohibit fabricated testimonials outright, and
  identifiable patient footage engages HIPAA.

The section is deliberately click-to-play and the quote is rendered as text
beside the video, so it still works when a real client has one genuine filmed
story and nothing else — or none at all, in which case delete `PATIENT_STORY`
and the quote marquee below carries the section on its own.

To replace it: drop a real `story-<name>.mp4` in `public/video`, a matching
first-frame still in `public/img`, and update `PATIENT_STORY` in
`app/features/clinic/constants.ts`. Keep a real poster — the section renders the
poster and the quote until play is pressed, which is what most visitors see.
