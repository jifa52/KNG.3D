# The Daily Jenya

A personal newspaper: **News**, **Markets** and **AI**, up to three editions a day, in Hebrew with English one tap away. Built to be read on a phone and on a PC.

**Read it:** https://jifa52.github.io/KNG.3D/

## How it works

Content and design are separate.

```
index.html                     home: opens the newest edition in the manifest (never edited)
archive/index.html             archive: built from the manifest (never edited)
404.html
assets/dj.js                   the renderer: nameplate, edition stars, tape, sections, language, light/dark, archive
assets/dj.css                  the broadsheet design
assets/editions.js             manifest: every edition, newest first
assets/images/                 licensed pictures
assets/logo-emblem-gold.png    the J-and-globe emblem (gold)
assets/logo-wordmark-gold.png  "The Daily Jenya" wordmark (gold); the edition line under it is live text
assets/favicon.svg
briefings/YYYY-MM-DD-HHMM/
  index.html                   identical shell (copy of templates/shell.html)
  edition.js                   the edition's content: DJ.edition({...})
  IMAGE-CREDITS.md             when the edition has pictures
templates/
  PUBLISH.md                   the complete brief for the edition bots
  shell.html                   the permalink page every edition copies
  example/                     a full edition in the current format (open it to see the layout)
  IMAGE-CREDITS.md             credit block pattern
tools/
  check.py                     validates editions, manifest and site files (standard library only)
  manifest.py                  rebuilds assets/editions.js from the editions
  convert_legacy.py            converts one old HTML file to edition.js on stdout
  verify_legacy.py             compares an original tree with a converted tree
.github/workflows/pages.yml    runs the check on every push; keeps published editions frozen
```

To publish, a bot writes one `edition.js`, copies the shell, and adds one line to the manifest. Everything it needs is in `templates/PUBLISH.md`.

## Reading

- **The nameplate** says which edition you are holding: "Your morning / midday / markets edition" under the wordmark ("The archive" on the archive), and the **edition stars** — ★ morning (08:50), ★★ midday (14:00), ★★★ markets (15:45). The pills under the ticker jump between today's runs.
- **The ticker** crawls the six market chips with the time the quotes were taken; hover or the pause button stops it, and it stays still if the device asks for reduced motion.
- **Markets** reads story → what is moving markets → companies → today and next, with the price snapshot last: the prices are context, not the headline.
- Each story leads with its **bottom line**, then numbered facts, **why it matters**, and **flags** (what is unconfirmed or easy to misread), with a confidence marker.
- `#news`, `#markets`, `#ai` open a section (`#premarket` still opens Markets). `#he` / `#en` set the language. The language and the day/night choice are remembered on the device.
- On a phone, secondary stories fold their details; tap **Details**. On a PC everything is open.

## Run locally

```bash
python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

Opening `index.html` straight from disk also works.

## Checks

```bash
python3 tools/check.py                    # everything
python3 tools/check.py 2026-10-04-0850    # one edition
python3 tools/manifest.py                 # rebuild the manifest from the editions
```

The workflow runs `tools/check.py` on every push and rejects changes to already-published editions unless the commit message contains `[archive-fix]`.

## History

Editions from 2 September to 3 October 2026 were hand-written HTML in three earlier designs. On 3 October 2026 they were converted into `edition.js` with `tools/convert_legacy.py`; `tools/verify_legacy.py` confirms every word of each original survives, apart from page chrome (buttons, section labels, the duplicated ticker). The originals are in git history.

Fonts: Newsreader, David Libre, IBM Plex Sans, and IBM Plex Sans Hebrew (SIL Open Font License), self-hosted in `assets/fonts/`. System faces are the fallback.
