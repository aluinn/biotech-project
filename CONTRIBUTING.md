# Contributing to Fold

Thanks for helping out. Fold is a small static site, so most changes are quick to make and easy to review.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- Report a bug or suggest a feature with an [issue](https://github.com/aluinn/biotech-project/issues/new/choose).
- Pick up a drafted task from [docs/issues](docs/issues). Ones labelled `good first issue` are the best place to start.
- Improve the docs, or the wording of the plain-English explanations in the app.

For anything bigger than a small fix, please open an issue first so we can agree on the approach before you spend time on it.

## Setup

You need [Node.js](https://nodejs.org) 20 or newer and, for screenshots, Google Chrome.

```bash
git clone https://github.com/<your-username>/biotech-project.git
cd biotech-project
npm install
npm start          # http://localhost:8000
```

There is no build step. Edit `index.html`, `style.css` or `app.js` and refresh the page. The app needs an internet connection, because it calls UniProt, AlphaFold DB and the 3Dmol.js CDN.

## Commands

| Command | What it does |
|---|---|
| `npm start` | Serve the app at `http://localhost:8000` |
| `npm run screenshots` | Regenerate the screenshots in `docs/assets/` (needs network and Chrome) |
| `npm run benchmark` | Measure fetch and render times, see `docs/PERFORMANCE.md` |

## Project layout

| Path | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Theme and responsive layout |
| `app.js` | Search, data fetching, 3D viewer, confidence colouring |
| `scripts/` | Dev server and screenshot script |
| `docs/` | Architecture notes, screenshots and issue drafts |

## Branches

Branch from `main` and use a short, lowercase, prefixed name:

- `feat/shareable-links`
- `fix/tooltip-overflow`
- `docs/architecture-diagram`
- `chore/update-deps`

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org): `type(optional scope): summary`, in the imperative mood and under about 72 characters.

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`. Example: `fix(viewer): keep tooltip inside the viewer box`.

## Pull requests

1. Keep each pull request to one change. Small is good.
2. Fill in the pull request template, and link the issue it closes.
3. Match the existing style: plain JavaScript, no framework, no build tooling, comments that explain *why*. Don't reformat code you aren't changing.
4. Don't add a runtime dependency without discussing it in an issue first. Fold deliberately has none.
5. Add a screenshot or short recording for any visible change, and check it on a phone-width window.
6. Update the README, docs and `CHANGELOG.md` (under `Unreleased`) when behaviour changes.
7. Don't commit secrets, generated files you can recreate, or large media.

A maintainer will review as soon as they can. Expect some back-and-forth. It is about the code, not you.

## Reporting security issues

Please don't use public issues. See [SECURITY.md](SECURITY.md).
