// Drawing: scene -> <canvas>, plus PNG / SVG export.
//
// Shapes are drawn with roughjs for the hand-drawn look. Drawables are cached per
// element object; since elements are immutable, a changed element is a cache miss
// and an unchanged one is free.

import rough from "roughjs";
import { ACCENT, FONTS, GRID_SIZE, PAPER } from "./constants.js";
import {
  HANDLE_PAD,
  LINE_HEIGHT,
  diamondPoints,
  getBounds,
  getHandles,
  getSelectionBounds,
  isLinear,
} from "./elements.js";

const generator = rough.generator();
const drawableCache = new WeakMap();
const roughCanvasCache = new WeakMap();

// ---------------------------------------------------------------- drawables

function roughOptions(el) {
  const opts = {
    seed: el.seed,
    roughness: el.roughness,
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    bowing: 1,
  };
  if (el.strokeStyle === "dashed")
    opts.strokeLineDash = [el.strokeWidth * 4 + 4, el.strokeWidth * 3 + 4];
  if (el.strokeStyle === "dotted")
    opts.strokeLineDash = [0.1, el.strokeWidth * 2 + 4];
  if (el.backgroundColor !== "transparent") {
    opts.fill = el.backgroundColor;
    opts.fillStyle = el.fillStyle;
    opts.fillWeight = Math.max(1, el.strokeWidth / 2);
    opts.hachureGap = Math.max(6, el.strokeWidth * 4);
  }
  return opts;
}

function arrowHeadSegments(el) {
  const pts = el.points;
  const [x1, y1] = [
    el.x + pts[pts.length - 2][0],
    el.y + pts[pts.length - 2][1],
  ];
  const [x2, y2] = [
    el.x + pts[pts.length - 1][0],
    el.y + pts[pts.length - 1][1],
  ];
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 1) return [];
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = Math.min(Math.max(14, el.strokeWidth * 5), length * 0.6);
  const spread = (28 * Math.PI) / 180;
  return [angle + Math.PI - spread, angle + Math.PI + spread].map((a) => [
    [x2, y2],
    [x2 + Math.cos(a) * head, y2 + Math.sin(a) * head],
  ]);
}

// Returns rough drawables for roughjs-drawn types; empty for freedraw / text.
export function getDrawables(el) {
  const cached = drawableCache.get(el);
  if (cached) return cached;

  const opts = roughOptions(el);
  const b = getBounds(el);
  let drawables = [];
  switch (el.type) {
    case "rectangle":
      if (b.w >= 1 && b.h >= 1)
        drawables = [generator.rectangle(b.x, b.y, b.w, b.h, opts)];
      break;
    case "diamond":
      if (b.w >= 1 && b.h >= 1)
        drawables = [generator.polygon(diamondPoints(b), opts)];
      break;
    case "ellipse":
      if (b.w >= 1 && b.h >= 1)
        drawables = [
          generator.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, opts),
        ];
      break;
    case "line":
    case "arrow": {
      if (el.points.length >= 2) {
        const abs = el.points.map(([px, py]) => [el.x + px, el.y + py]);
        const lineOpts = { ...opts, fill: undefined };
        drawables = [generator.linearPath(abs, lineOpts)];
        if (el.type === "arrow") {
          const headOpts = { ...lineOpts, strokeLineDash: undefined };
          for (const [[ax, ay], [bx, by]] of arrowHeadSegments(el)) {
            drawables.push(generator.line(ax, ay, bx, by, headOpts));
          }
        }
      }
      break;
    }
    default:
      break;
  }
  drawableCache.set(el, drawables);
  return drawables;
}

// SVG path string for a freehand stroke (smoothed through midpoints).
export function freedrawPath(el) {
  const p = el.points.map(([px, py]) => [el.x + px, el.y + py]);
  const f = (n) => Math.round(n * 100) / 100;
  if (p.length === 1)
    return `M${f(p[0][0])} ${f(p[0][1])} L${f(p[0][0])} ${f(p[0][1])}`;
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  if (p.length === 2) return `${d} L${f(p[1][0])} ${f(p[1][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${f(p[i][0])} ${f(p[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = p[p.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
}

// ---------------------------------------------------------------- canvas drawing

function getRoughCanvas(canvas) {
  let rc = roughCanvasCache.get(canvas);
  if (!rc) {
    rc = rough.canvas(canvas);
    roughCanvasCache.set(canvas, rc);
  }
  return rc;
}

export function drawElement(ctx, rc, el, alphaScale = 1) {
  ctx.save();
  ctx.globalAlpha = (el.opacity / 100) * alphaScale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (el.type === "text") {
    ctx.font = `${el.fontSize}px ${FONTS[el.fontFamily] ?? FONTS.hand}`;
    ctx.fillStyle = el.strokeColor;
    ctx.textBaseline = "top";
    el.text.split("\n").forEach((line, i) => {
      ctx.fillText(
        line,
        el.x,
        el.y + i * el.fontSize * LINE_HEIGHT + el.fontSize * 0.08,
      );
    });
  } else if (el.type === "freedraw") {
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth = el.strokeWidth;
    if (el.strokeStyle === "dashed")
      ctx.setLineDash([el.strokeWidth * 4 + 4, el.strokeWidth * 3 + 4]);
    if (el.strokeStyle === "dotted")
      ctx.setLineDash([0.1, el.strokeWidth * 2 + 4]);
    ctx.stroke(new Path2D(freedrawPath(el)));
  } else {
    for (const drawable of getDrawables(el)) rc.draw(drawable);
  }
  ctx.restore();
}

function drawGrid(ctx, view, width, height) {
  const size = GRID_SIZE * view.zoom;
  if (size < 8) return;
  ctx.save();
  ctx.fillStyle = "#d9dde3";
  const startX = ((view.x % size) + size) % size;
  const startY = ((view.y % size) + size) % size;
  const r = Math.max(0.8, Math.min(1.4, view.zoom * 0.9));
  for (let x = startX; x < width; x += size) {
    for (let y = startY; y < height; y += size) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSelection(ctx, elements, selectedIds, zoom) {
  const selected = elements.filter((el) => selectedIds.includes(el.id));
  if (!selected.length) return;
  const px = 1 / zoom;
  const pad = HANDLE_PAD * px;

  ctx.save();
  ctx.strokeStyle = ACCENT;
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 1.5 * px;

  // Per-element outline when several are selected.
  if (selected.length > 1) {
    ctx.setLineDash([4 * px, 3 * px]);
    ctx.globalAlpha = 0.6;
    for (const el of selected) {
      const b = getBounds(el);
      ctx.strokeRect(b.x - 2 * px, b.y - 2 * px, b.w + 4 * px, b.h + 4 * px);
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }

  const handle = (x, y) => {
    const s = 8 * px;
    ctx.beginPath();
    ctx.roundRect(x - s / 2, y - s / 2, s, s, 2 * px);
    ctx.fill();
    ctx.stroke();
  };

  if (selected.length === 1 && isLinear(selected[0])) {
    const el = selected[0];
    for (const [qx, qy] of el.points) handle(el.x + qx, el.y + qy);
  } else {
    const b = getSelectionBounds(selected);
    ctx.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
    for (const [hx, hy] of Object.values(getHandles(b, pad))) handle(hx, hy);
  }
  ctx.restore();
}

// opts: { elements, view, selectedIds, grid, editingId, marquee, erasingIds, width, height, dpr }
export function renderScene(canvas, opts) {
  const {
    elements,
    view,
    selectedIds,
    grid,
    editingId,
    marquee,
    erasingIds,
    width,
    height,
    dpr,
  } = opts;
  const ctx = canvas.getContext("2d");
  const rc = getRoughCanvas(canvas);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  if (grid) drawGrid(ctx, view, width, height);

  ctx.setTransform(
    dpr * view.zoom,
    0,
    0,
    dpr * view.zoom,
    dpr * view.x,
    dpr * view.y,
  );

  for (const el of elements) {
    if (el.id === editingId) continue;
    drawElement(ctx, rc, el, erasingIds?.has(el.id) ? 0.2 : 1);
  }

  drawSelection(ctx, elements, selectedIds, view.zoom);

  if (marquee) {
    ctx.save();
    ctx.fillStyle = `${ACCENT}1f`;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1 / view.zoom;
    ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h);
    ctx.strokeRect(marquee.x, marquee.y, marquee.w, marquee.h);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- export

function exportBox(elements, padding) {
  const b = getSelectionBounds(elements);
  if (!b) return null;
  return {
    x: b.x - padding,
    y: b.y - padding,
    w: Math.max(1, b.w + padding * 2),
    h: Math.max(1, b.h + padding * 2),
  };
}

const defaultCreateCanvas = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

// Returns a canvas with the elements drawn tightly, or null if there is nothing to draw.
export function exportToCanvas(
  elements,
  { scale = 2, background = true, dark = false, padding = 28 } = {},
  createCanvas = defaultCreateCanvas,
) {
  const box = exportBox(elements, padding);
  if (!box) return null;
  const w = Math.ceil(box.w * scale);
  const h = Math.ceil(box.h * scale);

  const scene = createCanvas(w, h);
  const ctx = scene.getContext("2d");
  const rc = rough.canvas(scene);
  if (background) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.setTransform(scale, 0, 0, scale, -box.x * scale, -box.y * scale);
  for (const el of elements) drawElement(ctx, rc, el);

  if (!dark) return scene;

  // Dark export: same colour inversion the live canvas uses.
  const out = createCanvas(w, h);
  const octx = out.getContext("2d");
  octx.filter = "invert(93%) hue-rotate(180deg)";
  octx.drawImage(scene, 0, 0);
  octx.filter = "none";
  return out;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function exportToSvg(
  elements,
  { background = true, padding = 28 } = {},
  doc = document,
) {
  const box = exportBox(elements, padding);
  if (!box) return null;

  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("xmlns", SVG_NS);
  svg.setAttribute("width", String(Math.ceil(box.w)));
  svg.setAttribute("height", String(Math.ceil(box.h)));
  svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.w} ${box.h}`);

  if (background) {
    const rect = doc.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(box.x));
    rect.setAttribute("y", String(box.y));
    rect.setAttribute("width", String(box.w));
    rect.setAttribute("height", String(box.h));
    rect.setAttribute("fill", "#ffffff");
    svg.appendChild(rect);
  }

  const rs = rough.svg(svg);
  for (const el of elements) {
    const g = doc.createElementNS(SVG_NS, "g");
    g.setAttribute("opacity", String(el.opacity / 100));
    g.setAttribute("stroke-linecap", "round");
    g.setAttribute("stroke-linejoin", "round");

    if (el.type === "text") {
      el.text.split("\n").forEach((line, i) => {
        const t = doc.createElementNS(SVG_NS, "text");
        t.setAttribute("x", String(el.x));
        t.setAttribute(
          "y",
          String(el.y + i * el.fontSize * LINE_HEIGHT + el.fontSize * 0.08),
        );
        t.setAttribute("dominant-baseline", "hanging");
        t.setAttribute("font-size", String(el.fontSize));
        t.setAttribute("font-family", FONTS[el.fontFamily] ?? FONTS.hand);
        t.setAttribute("fill", el.strokeColor);
        t.setAttribute("xml:space", "preserve");
        t.textContent = line;
        g.appendChild(t);
      });
    } else if (el.type === "freedraw") {
      const path = doc.createElementNS(SVG_NS, "path");
      path.setAttribute("d", freedrawPath(el));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", el.strokeColor);
      path.setAttribute("stroke-width", String(el.strokeWidth));
      g.appendChild(path);
    } else {
      for (const drawable of getDrawables(el)) g.appendChild(rs.draw(drawable));
    }
    svg.appendChild(g);
  }
  return svg;
}

export function svgToString(svg) {
  return new XMLSerializer().serializeToString(svg);
}
