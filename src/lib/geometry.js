// Small, dependency-free geometry helpers.

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return dist(px, py, x1, y1);
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

// Ray casting. poly is [[x, y], ...]
export function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const crosses = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

// Rects are { x, y, w, h } with non-negative w/h.
export function rectContains(outer, inner) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

export function rectFromPoints(x1, y1, x2, y2) {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

// Snap a vector to the nearest multiple of `step` radians (default 15 degrees).
export function snapAngle(dx, dy, step = Math.PI / 12) {
  const len = Math.hypot(dx, dy);
  if (len === 0) return [0, 0];
  const a = Math.round(Math.atan2(dy, dx) / step) * step;
  return [Math.cos(a) * len, Math.sin(a) * len];
}
