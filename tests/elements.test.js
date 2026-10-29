import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_STYLE } from '../src/lib/constants.js';
import {
  cloneElements,
  createElement,
  getBounds,
  getSelectionBounds,
  hitHandle,
  hitTest,
  isDegenerate,
  normalizeElement,
  reorder,
  scaleElement,
  topElementAt,
} from '../src/lib/elements.js';
import { distToSegment, pointInPolygon, snapAngle } from '../src/lib/geometry.js';

const make = (type, x, y, w, h, extra = {}) => ({ ...createElement(type, x, y, DEFAULT_STYLE), width: w, height: h, ...extra });
const line = (x, y, dx, dy) => ({ ...createElement('line', x, y, DEFAULT_STYLE), points: [[0, 0], [dx, dy]] });

test('geometry helpers', () => {
  assert.equal(distToSegment(5, 5, 0, 0, 10, 0), 5);
  assert.equal(distToSegment(-3, 0, 0, 0, 10, 0), 3);
  assert.ok(pointInPolygon(5, 5, [[0, 0], [10, 0], [10, 10], [0, 10]]));
  assert.ok(!pointInPolygon(15, 5, [[0, 0], [10, 0], [10, 10], [0, 10]]));
  const [sx, sy] = snapAngle(10, 1);
  assert.ok(Math.abs(sy) < 1e-9 && Math.abs(sx - Math.hypot(10, 1)) < 1e-9);
});

test('rectangle hit testing: hollow vs filled', () => {
  const hollow = make('rectangle', 0, 0, 100, 60);
  assert.ok(hitTest(hollow, 50, 0, 4), 'on the top edge');
  assert.ok(!hitTest(hollow, 50, 30, 4), 'inside a hollow rectangle is not a hit');
  const filled = make('rectangle', 0, 0, 100, 60, { backgroundColor: '#ffc9c9' });
  assert.ok(hitTest(filled, 50, 30, 4), 'inside a filled rectangle is a hit');
  assert.ok(!hitTest(filled, 130, 30, 4), 'outside');
});

test('negative width/height (dragging up-left) still hits and bounds correctly', () => {
  const r = make('rectangle', 100, 100, -50, -40);
  assert.deepEqual(getBounds(r), { x: 50, y: 60, w: 50, h: 40 });
  assert.ok(hitTest(r, 75, 60, 4));
});

test('ellipse and diamond hit testing', () => {
  const e = make('ellipse', 0, 0, 100, 60);
  assert.ok(hitTest(e, 50, 0, 4), 'top of ellipse');
  assert.ok(hitTest(e, 100, 30, 4), 'right of ellipse');
  assert.ok(!hitTest(e, 5, 5, 2), 'bounding-box corner is outside the ellipse');
  const d = make('diamond', 0, 0, 100, 100, { backgroundColor: '#a5d8ff' });
  assert.ok(hitTest(d, 50, 50, 4), 'centre of filled diamond');
  assert.ok(!hitTest(d, 5, 5, 2), 'corner of bbox is outside the diamond');
});

test('line hit testing and topmost selection', () => {
  const l = line(0, 0, 100, 100);
  assert.ok(hitTest(l, 50, 52, 4));
  assert.ok(!hitTest(l, 50, 80, 4));
  const bottom = make('rectangle', 0, 0, 100, 100, { backgroundColor: '#b2f2bb' });
  const top = make('rectangle', 20, 20, 100, 100, { backgroundColor: '#ffec99' });
  assert.equal(topElementAt([bottom, top], 50, 50, 4).id, top.id);
  assert.equal(topElementAt([bottom, top], 5, 5, 4).id, bottom.id);
  assert.equal(topElementAt([bottom, top], 500, 500, 4), null);
});

test('scaleElement scales shapes and points about an anchor', () => {
  const r = make('rectangle', 10, 10, 100, 50);
  const s = scaleElement(r, 10, 10, 2, 3);
  assert.deepEqual([s.x, s.y, s.width, s.height], [10, 10, 200, 150]);

  const l = line(10, 10, 40, 20);
  const sl = scaleElement(l, 10, 10, 0.5, 2);
  assert.deepEqual(sl.points, [[0, 0], [20, 40]]);

  // Flip across the right edge: the shape lands on the other side of the anchor.
  const flipped = normalizeElement(scaleElement(r, 110, 10, -1, 1));
  assert.deepEqual(getBounds(flipped), { x: 110, y: 10, w: 100, h: 50 });
  assert.ok(Object.is(r.width, 100), 'original is not mutated');
});

test('selection bounds and handle hit', () => {
  const a = make('rectangle', 0, 0, 10, 10);
  const b = make('ellipse', 40, 30, 20, 20);
  const box = getSelectionBounds([a, b]);
  assert.deepEqual(box, { x: 0, y: 0, w: 60, h: 50 });
  // Handles sit 6px outside the box at zoom 1.
  assert.equal(hitHandle(box, -6, -6, 1), 'nw');
  assert.equal(hitHandle(box, 66, 56, 1), 'se');
  assert.equal(hitHandle(box, 30, 25, 1), null);
});

test('reorder', () => {
  const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  const ids = (arr) => arr.map((e) => e.id).join('');
  assert.equal(ids(reorder([a, b, c, d], ['b'], 'front')), 'acdb');
  assert.equal(ids(reorder([a, b, c, d], ['c'], 'back')), 'cabd');
  assert.equal(ids(reorder([a, b, c, d], ['b'], 'forward')), 'acbd');
  assert.equal(ids(reorder([a, b, c, d], ['c'], 'backward')), 'acbd'.replace('acbd', 'acbd') && 'abcd'.replace('bc', 'cb'));
  assert.equal(ids(reorder([a, b, c, d], ['b', 'c'], 'forward')), 'adbc');
  assert.equal(ids(reorder([a, b, c, d], ['d'], 'forward')), 'abcd');
});

test('degenerate drags are discarded, real ones kept', () => {
  assert.ok(isDegenerate(make('rectangle', 0, 0, 1, 1)));
  assert.ok(!isDegenerate(make('rectangle', 0, 0, 20, 1)));
  assert.ok(isDegenerate(line(0, 0, 1, 1)));
  assert.ok(!isDegenerate(line(0, 0, 30, 0)));
});

test('cloneElements gives new ids and deep-copies points', () => {
  const l = line(5, 5, 10, 10);
  const [c] = cloneElements([l], 16, 16);
  assert.notEqual(c.id, l.id);
  assert.equal(c.x, 21);
  c.points[1][0] = 999;
  assert.equal(l.points[1][0], 10);
});
