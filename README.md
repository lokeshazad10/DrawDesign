# DrawDesign

A hand-drawn style infinite-canvas whiteboard, in the spirit of Excalidraw and Eraser.io.
Built with React 19, Vite, Tailwind CSS and [rough.js](https://roughjs.com). Everything is drawn on a single
HTML canvas, and the board autosaves to your browser.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run lint       # ESLint
npm test           # unit tests (geometry, hit-testing, rendering, export)
```

## Features

- **Tools:** select, hand, rectangle, diamond, ellipse, arrow, line, freehand pen, text, eraser
- **Select & edit:** click, shift-click, marquee select, move, resize with 8 handles, drag line/arrow end-points
- **Styling:** stroke colour, fill colour, fill style, stroke width, solid/dashed/dotted, sloppiness, opacity, three fonts and four text sizes
- **Infinite canvas:** pan (Space+drag, hand tool, middle mouse, scroll), zoom (Ctrl+wheel, pinch, buttons), zoom to fit
- **History:** undo/redo (200 steps), with slider drags and arrow-key nudges collapsed into one step
- **Clipboard:** copy, cut, paste, duplicate, layer order (forward/backward/front/back)
- **Files:** autosave to localStorage, save/open boards as `.json` files, export PNG (1x/2x/3x, transparent or solid background) and SVG
- **Light/dark theme**, optional dot grid, touch and pen support, keyboard-shortcut cheat sheet (press `?`)

## Shortcuts

| Key | Action | Key | Action |
| --- | --- | --- | --- |
| `V` / `1` | Select | `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `H` | Hand | `Ctrl+C / X / V` | Copy / cut / paste |
| `R` / `2` | Rectangle | `Ctrl+D` | Duplicate |
| `D` / `3` | Diamond | `Ctrl+A` | Select all |
| `O` / `4` | Ellipse | `Ctrl+]` / `Ctrl+[` | Bring forward / send backward |
| `A` / `5` | Arrow | `Ctrl+'` | Toggle grid |
| `L` / `6` | Line | `Shift+1` | Zoom to fit |
| `P` / `7` | Draw | `Ctrl+Shift+E` | Export image |
| `T` / `8` | Text | `Q` | Keep tool after drawing |
| `E` / `0` | Eraser | `Del` | Delete selection |

Hold **Shift** while drawing to constrain to squares/circles or 15° angles.

## Project structure

```
src/
  app/                      application shell and global app hooks
  features/
    board/
      components/           canvas, workspace, toolbar, panels and board controls
      lib/                  board model helpers, geometry and rendering
      model/useBoard.js     board state and actions
    export/                 image export workflow and dialog
    help/                   keyboard-shortcut help dialog
  shared/
    hooks/                  reusable app hooks (toast)
    lib/                    shared browser utilities (file handling)
    ui/                     reusable UI components
  main.jsx                  browser entry point
  styles.css                Tailwind entry, theme tokens and custom gradients
tests/                      node:test unit tests
```

Feature code is grouped by domain; shared utilities stay outside feature modules, and `app/`
composes features without owning their implementation details.

## Design notes

- State lives in one mutable store that pointer handlers read synchronously, so fast drags never see stale React state. React re-renders through a counter.
- Elements are immutable, so undo/redo is just a stack of arrays.
- Canvas redraws are throttled to one per animation frame and are DPR-aware.

## Ideas for next steps

Real-time collaboration (WebSocket/CRDT such as Yjs), arrow binding to shapes, grouping, image
embedding, a shareable-link backend, and a library of reusable shapes.
