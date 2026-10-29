import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { JSDOM } from 'jsdom';
import { DEFAULT_STYLE } from '../src/lib/constants.js';
import { createElement } from '../src/lib/elements.js';
import { exportToCanvas, exportToSvg, renderScene, svgToString } from '../src/lib/render.js';

globalThis.Path2D = Path2D;

const OUT = process.env.INKBOARD_TEST_OUT;

const shape = (type, x, y, w, h, extra = {}) => ({ ...createElement(type, x, y, DEFAULT_STYLE), width: w, height: h, ...extra });
const linear = (type, x, y, pts, extra = {}) => ({ ...createElement(type, x, y, DEFAULT_STYLE), points: pts, ...extra });

function sampleBoard() {
  return [
    shape('rectangle', -300, -160, 200, 120, { backgroundColor: '#a5d8ff', fillStyle: 'hachure', seed: 11 }),
    shape('ellipse', -40, -170, 160, 130, { backgroundColor: '#b2f2bb', fillStyle: 'solid', strokeColor: '#2f9e44', seed: 12 }),
    shape('diamond', 170, -170, 130, 130, { backgroundColor: '#ffec99', fillStyle: 'cross-hatch', roughness: 2, seed: 13 }),
    linear('arrow', -100, -100, [[0, 0], [60, 0]], { seed: 14, strokeColor: '#1971c2' }),
    linear('arrow', 120, -105, [[0, 0], [50, 10]], { seed: 15, strokeStyle: 'dashed' }),
    linear('line', -300, 20, [[0, 0], [600, 0]], { seed: 16, strokeStyle: 'dotted', strokeColor: '#e03131' }),
    shape('rectangle', -300, 60, 160, 90, { roughness: 0, strokeColor: '#1e1e1e', seed: 17 }),
    linear('freedraw', -90, 70, [[0, 20], [14, -4], [30, 28], [46, 0], [64, 30], [82, 2], [100, 26]], { seed: 18, strokeColor: '#e03131', strokeWidth: 3 }),
    { ...createElement('text', 130, 70, DEFAULT_STYLE), text: 'Hello, Inkboard', fontSize: 32, width: 220, height: 40 },
  ];
}

test('renderScene paints the scene, grid and selection without throwing', () => {
  const canvas = createCanvas(900, 560);
  const elements = sampleBoard();
  renderScene(canvas, {
    elements,
    view: { x: 450, y: 280, zoom: 1 },
    selectedIds: [elements[0].id, elements[1].id],
    grid: true,
    editingId: null,
    marquee: { x: -320, y: -190, w: 440, h: 190 },
    erasingIds: new Set([elements[6].id]),
    width: 900,
    height: 560,
    dpr: 1,
  });
  const png = canvas.toBuffer('image/png');
  assert.ok(png.length > 5000, 'image has content');

  // Something non-paper was drawn near the first rectangle's border.
  const px = canvas.getContext('2d').getImageData(450 - 300, 280 - 160, 1, 1).data;
  assert.ok(px[3] > 0);
  if (OUT) fs.writeFileSync(path.join(OUT, 'scene.png'), png);
});

test('exportToCanvas crops to content and honours scale and background', () => {
  const els = sampleBoard();
  const small = exportToCanvas(els, { scale: 1, background: true }, createCanvas);
  const big = exportToCanvas(els, { scale: 2, background: true }, createCanvas);
  assert.ok(big.width >= small.width * 2 - 1);
  const corner = small.getContext('2d').getImageData(1, 1, 1, 1).data;
  assert.deepEqual([...corner], [255, 255, 255, 255]);

  const transparent = exportToCanvas(els, { scale: 1, background: false }, createCanvas);
  assert.equal(transparent.getContext('2d').getImageData(1, 1, 1, 1).data[3], 0);

  assert.equal(exportToCanvas([], {}, createCanvas), null);
  if (OUT) fs.writeFileSync(path.join(OUT, 'export.png'), big.toBuffer('image/png'));
});

test('exportToSvg produces valid, self-contained SVG', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  globalThis.XMLSerializer = dom.window.XMLSerializer;
  const svg = exportToSvg(sampleBoard(), { background: true }, dom.window.document);
  const text = svgToString(svg);
  assert.match(text, /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(text, /viewBox="/);
  assert.ok((text.match(/<path/g) ?? []).length >= 8, 'rough shapes became paths');
  assert.match(text, /Hello, Inkboard/);
  assert.equal(exportToSvg([], {}, dom.window.document), null);
  if (OUT) fs.writeFileSync(path.join(OUT, 'export.svg'), text);
});
