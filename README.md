# DrawDesign

A hand-drawn-style infinite-canvas whiteboard for sketching, annotating, and exporting ideas.

[![Build](https://img.shields.io/badge/build-not%20configured-lightgrey)](#development)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-yellow)](https://developer.mozilla.org/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vite.dev/)

## Features

- Sketch rectangles, diamonds, ellipses, arrows, lines, freehand strokes, and text.
- Select, move, resize, style, reorder, copy, paste, duplicate, and delete elements.
- Pan and zoom an infinite canvas; use the optional dot grid and light/dark themes.
- Undo and redo up to 200 actions, with keyboard shortcuts for common operations.
- Autosave boards in browser storage, or save and open `.json` board files.
- Export the canvas as PNG (1x, 2x, or 3x; transparent or solid background) or SVG.
- Use a mouse, touch input, or pen.

## Demo and screenshots

The repository does not currently include a hosted demo or screenshot. Add a screenshot at
`docs/images/screenshot.png` when one is available.

*Screenshot coming soon. Add an image here when one is available.*

## Tech stack

- JavaScript (ES modules), React 19, and Vite 8
- Tailwind CSS 4 and `@tailwindcss/vite`
- Rough.js for hand-drawn rendering; Lucide React for icons
- Node.js built-in test runner, jsdom, and `@napi-rs/canvas` for tests
- ESLint 10 for linting

## Prerequisites

- Node.js 22.22.2 or newer in the 22.x line, 24.15.0 or newer in the 24.x line, or 26.0.0+
- npm (the repository includes `package-lock.json`)
- Git, if you are cloning the repository

## Installation

```sh
git clone https://github.com/lokeshazad10/DrawDesign.git
cd DrawDesign
npm ci
```

## Environment variables

The application has no required runtime environment variables. `.env.example` documents
`DRAWDESIGN_TEST_OUT`, an optional test-only setting that writes rendered test output to an
existing directory. The test runner does not load `.env` files automatically.

To use it, create the output directory and set the variable in your shell before running tests:

```sh
# PowerShell
New-Item -ItemType Directory -Force test-output
$env:DRAWDESIGN_TEST_OUT = "test-output"
npm test
```

```sh
# macOS/Linux
mkdir -p test-output
DRAWDESIGN_TEST_OUT=test-output npm test
```

## Development

Start the local development server:

```sh
npm run dev
```

Open the URL Vite prints (by default, <http://localhost:5173>). Changes are reloaded during
development.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check the project with ESLint |
| `npm test` | Run unit tests with Node.js's built-in test runner |

## Using the whiteboard

Open the app in a browser and select a tool from the toolbar, then draw on the canvas. Hold
**Shift** while drawing to constrain shapes or snap lines and arrows to 15-degree angles. Use
the toolbar and properties panel to select and style elements. Boards autosave in the browser;
use the file controls to save or open a `.json` board. The export dialog offers PNG and SVG.
Press `?` in the app to open the full shortcut reference.

| Key | Action | Key | Action |
| --- | --- | --- | --- |
| `V` / `1` | Select | `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `H` | Hand | `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / cut / paste |
| `R` / `2` | Rectangle | `Ctrl+D` | Duplicate |
| `D` / `3` | Diamond | `Ctrl+A` | Select all |
| `O` / `4` | Ellipse | `Ctrl+]` / `Ctrl+[` | Bring forward / send backward |
| `A` / `5` | Arrow | `Ctrl+'` | Toggle grid |
| `L` / `6` | Line | `Shift+1` | Zoom to fit |
| `P` / `7` | Draw | `Ctrl+Shift+E` | Export image |
| `T` / `8` | Text | `Q` | Keep tool after drawing |
| `E` / `0` | Eraser | `Delete` | Delete selection |

Hold **Space** and drag to pan. Use the hand tool or middle mouse button to pan as well.

## Testing

Run the unit tests and lint check before submitting changes:

```sh
npm test
npm run lint
```

The tests cover element geometry, hit testing, rendering, and PNG/SVG export. Build the
production bundle with `npm run build`.

## Project structure

```text
src/
  app/                      Application shell and global hooks
  features/
    board/
      components/           Canvas, workspace, toolbar, and panels
      lib/                  Element, geometry, and rendering helpers
      model/useBoard.js     Board state and actions
    export/                 Image export workflow
    help/                   Keyboard shortcut reference
  shared/                   Reusable hooks, utilities, and UI
  main.jsx                  Browser entry point
  styles.css                Tailwind entry and application styles
tests/                      Node.js unit tests
public/                     Static assets
```

## Roadmap

Ideas for future work include real-time collaboration, arrow binding to shapes, grouping,
image embedding, shareable links, and reusable shape libraries. Contributions and discussion
are welcome; these ideas are not committed release dates.

## Contributing

Bug reports, feature requests, documentation, tests, code, design, and translations are welcome.
Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## Code of Conduct

We expect everyone to help keep the project welcoming and respectful. See
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

DrawDesign is distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Support and contact

For bugs and feature requests, [open an issue](https://github.com/lokeshazad10/DrawDesign/issues).
For other questions, contact the maintainer at **[maintainer contact placeholder]**.
