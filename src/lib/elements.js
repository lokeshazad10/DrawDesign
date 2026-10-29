// Element model + pure helpers (bounds, hit testing, transforms).
//
// Elements are treated as immutable: every change produces a new object, which
// is what makes undo/redo a simple stack of arrays.
//
// Shape elements (rectangle, diamond, ellipse) use x, y, width, height. Width and
// height can be negative while dragging; getBounds() always normalises.
// Line, arrow and freedraw elements use an origin (x, y) plus `points` that are
// relative to that origin.

import { FONTS } from './constants.js';
import { clamp, distToSegment, pointInPolygon } from './geometry.js';

let counter = 0;
export const uid = () => `${Math.random().toString(36).slice(2, 9)}${(counter++).toString(36)}`;
const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export const isLinear = (el) => el.type === 'line' || el.type === 'arrow';
export const hasPoints = (el) => isLinear(el) || el.type === 'freedraw';
export const isShape = (el) => el.type === 'rectangle' || el.type === 'diamond' || el.type === 'ellipse';
export const isFilled = (el) => isShape(el) && el.backgroundColor !== 'transparent';

export function createElement(type, x, y, style) {
  const el = {
    id: uid(),
    type,
    x,
    y,
    width: 0,
    height: 0,
    seed: randomSeed(),
    strokeColor: style.strokeColor,
    backgroundColor: style.backgroundColor,
    fillStyle: style.fillStyle,
    strokeWidth: style.strokeWidth,
    strokeStyle: style.strokeStyle,
    roughness: style.roughness,
    opacity: style.opacity,
  };
  if (type === 'line' || type === 'arrow' || type === 'freedraw') {
    el.points = [[0, 0]];
    el.backgroundColor = 'transparent';
  }
  if (type === 'text') {
    el.text = '';
    el.fontSize = style.fontSize;
    el.fontFamily = style.fontFamily;
    el.backgroundColor = 'transparent';
  }
  return el;
}

// ---------------------------------------------------------------- text

let measureCtx = null;
export function measureText(text, fontSize, fontFamily) {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  measureCtx.font = `${fontSize}px ${FONTS[fontFamily] ?? FONTS.hand}`;
  const lines = text.split('\n');
  const width = Math.max(8, ...lines.map((line) => measureCtx.measureText(line).width));
  return { width, height: lines.length * fontSize * LINE_HEIGHT };
}
export const LINE_HEIGHT = 1.25;

export function withMeasuredText(el, patch = {}) {
  const next = { ...el, ...patch };
  const { width, height } = measureText(next.text, next.fontSize, next.fontFamily);
  return { ...next, width, height };
}

// ---------------------------------------------------------------- bounds

export function getBounds(el) {
  if (hasPoints(el)) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [px, py] of el.points) {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    return { x: el.x + minX, y: el.y + minY, w: maxX - minX, h: maxY - minY };
  }
  return {
    x: Math.min(el.x, el.x + el.width),
    y: Math.min(el.y, el.y + el.height),
    w: Math.abs(el.width),
    h: Math.abs(el.height),
  };
}

export function getSelectionBounds(elements) {
  if (!elements.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    const b = getBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w);
    maxY = Math.max(maxY, b.y + b.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function diamondPoints(b) {
  return [
    [b.x + b.w / 2, b.y],
    [b.x + b.w, b.y + b.h / 2],
    [b.x + b.w / 2, b.y + b.h],
    [b.x, b.y + b.h / 2],
  ];
}

// ---------------------------------------------------------------- hit testing

export function hitTest(el, px, py, tolerance) {
  const t = tolerance + el.strokeWidth / 2;
  const b = getBounds(el);

  switch (el.type) {
    case 'rectangle': {
      if (isFilled(el) && px >= b.x - t && px <= b.x + b.w + t && py >= b.y - t && py <= b.y + b.h + t) {
        return true;
      }
      const { x, y, w, h } = b;
      return (
        distToSegment(px, py, x, y, x + w, y) <= t ||
        distToSegment(px, py, x + w, y, x + w, y + h) <= t ||
        distToSegment(px, py, x + w, y + h, x, y + h) <= t ||
        distToSegment(px, py, x, y + h, x, y) <= t
      );
    }
    case 'diamond': {
      const poly = diamondPoints(b);
      if (isFilled(el) && pointInPolygon(px, py, poly)) return true;
      for (let i = 0; i < poly.length; i++) {
        const [x1, y1] = poly[i];
        const [x2, y2] = poly[(i + 1) % poly.length];
        if (distToSegment(px, py, x1, y1, x2, y2) <= t) return true;
      }
      return false;
    }
    case 'ellipse': {
      const rx = b.w / 2;
      const ry = b.h / 2;
      const cx = b.x + rx;
      const cy = b.y + ry;
      const r = Math.max(1, Math.min(rx, ry));
      const d = Math.hypot((px - cx) / Math.max(rx, 0.5), (py - cy) / Math.max(ry, 0.5));
      return isFilled(el) ? d <= 1 + t / r : Math.abs(d - 1) * r <= t;
    }
    case 'line':
    case 'arrow':
    case 'freedraw': {
      const pts = el.points;
      if (pts.length === 1) return Math.hypot(px - (el.x + pts[0][0]), py - (el.y + pts[0][1])) <= t + 2;
      for (let i = 0; i < pts.length - 1; i++) {
        if (
          distToSegment(px, py, el.x + pts[i][0], el.y + pts[i][1], el.x + pts[i + 1][0], el.y + pts[i + 1][1]) <= t
        ) {
          return true;
        }
      }
      return false;
    }
    case 'text':
      return px >= b.x - t && px <= b.x + b.w + t && py >= b.y - t && py <= b.y + b.h + t;
    default:
      return false;
  }
}

// Topmost element under the pointer (elements later in the array are drawn on top).
export function topElementAt(elements, px, py, tolerance) {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (hitTest(elements[i], px, py, tolerance)) return elements[i];
  }
  return null;
}

// ---------------------------------------------------------------- handles

export const HANDLE_NAMES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

// Handles sit on the selection bounds expanded by `pad` (world units).
export function getHandles(b, pad) {
  const x0 = b.x - pad;
  const y0 = b.y - pad;
  const x1 = b.x + b.w + pad;
  const y1 = b.y + b.h + pad;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  return {
    nw: [x0, y0],
    n: [mx, y0],
    ne: [x1, y0],
    e: [x1, my],
    se: [x1, y1],
    s: [mx, y1],
    sw: [x0, y1],
    w: [x0, my],
  };
}

export const HANDLE_PAD = 6; // screen px
export const HANDLE_HIT = 9; // screen px radius

export function hitHandle(b, px, py, zoom) {
  const handles = getHandles(b, HANDLE_PAD / zoom);
  const r = HANDLE_HIT / zoom;
  for (const name of HANDLE_NAMES) {
    const [hx, hy] = handles[name];
    if (Math.abs(px - hx) <= r && Math.abs(py - hy) <= r) return name;
  }
  return null;
}

// Index of the point handle under the pointer for a selected line/arrow, or -1.
export function hitPoint(el, px, py, zoom) {
  const r = HANDLE_HIT / zoom;
  for (let i = 0; i < el.points.length; i++) {
    if (Math.hypot(px - (el.x + el.points[i][0]), py - (el.y + el.points[i][1])) <= r) return i;
  }
  return -1;
}

// ---------------------------------------------------------------- transforms

// Scale an element about the anchor (ax, ay) by (sx, sy). Negative factors flip.
export function scaleElement(orig, ax, ay, sx, sy) {
  if (orig.type === 'text') {
    const b = getBounds(orig);
    const ts = Math.abs(sy === 1 && sx !== 1 ? sx : sy);
    const fontSize = clamp(Math.round(orig.fontSize * ts), 8, 400);
    const minX = sx >= 0 ? ax + (b.x - ax) * sx : ax + (b.x + b.w - ax) * sx;
    const minY = sy >= 0 ? ay + (b.y - ay) * sy : ay + (b.y + b.h - ay) * sy;
    return withMeasuredText(orig, { x: minX, y: minY, fontSize });
  }
  const next = { ...orig, x: ax + (orig.x - ax) * sx, y: ay + (orig.y - ay) * sy };
  if (orig.points) {
    next.points = orig.points.map(([px, py]) => [px * sx, py * sy]);
  } else {
    next.width = orig.width * sx;
    next.height = orig.height * sy;
  }
  return next;
}

// Make width/height positive so stored shapes are tidy once a drag finishes.
export function normalizeElement(el) {
  if (hasPoints(el) || el.type === 'text') return el;
  let { x, y, width, height } = el;
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  return { ...el, x, y, width, height };
}

// True when a just-drawn element is too small to be intentional (a stray click).
export function isDegenerate(el) {
  if (el.type === 'freedraw' || el.type === 'text') return false;
  if (isLinear(el)) {
    const [p0, p1] = [el.points[0], el.points[el.points.length - 1]];
    return Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 3;
  }
  return Math.abs(el.width) < 3 && Math.abs(el.height) < 3;
}

// ---------------------------------------------------------------- ordering / cloning

export function reorder(elements, ids, direction) {
  const sel = new Set(ids);
  const arr = [...elements];
  if (direction === 'front') return [...arr.filter((e) => !sel.has(e.id)), ...arr.filter((e) => sel.has(e.id))];
  if (direction === 'back') return [...arr.filter((e) => sel.has(e.id)), ...arr.filter((e) => !sel.has(e.id))];
  if (direction === 'forward') {
    for (let i = arr.length - 2; i >= 0; i--) {
      if (sel.has(arr[i].id) && !sel.has(arr[i + 1].id)) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    }
  } else if (direction === 'backward') {
    for (let i = 1; i < arr.length; i++) {
      if (sel.has(arr[i].id) && !sel.has(arr[i - 1].id)) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
    }
  }
  return arr;
}

export function cloneElements(elements, dx = 0, dy = 0) {
  return elements.map((el) => ({
    ...el,
    id: uid(),
    x: el.x + dx,
    y: el.y + dy,
    points: el.points ? el.points.map((p) => [...p]) : undefined,
  }));
}
