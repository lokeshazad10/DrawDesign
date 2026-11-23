// Board state: the scene, view, tool, selection and every action on them.
//
// State lives in one mutable store (a ref) that is read synchronously by the
// pointer handlers and re-rendered through a cheap counter. That avoids stale
// closures during a drag, where events arrive faster than React commits.
// Elements themselves are never mutated, so history is just a stack of arrays.

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DEFAULT_STYLE, MAX_ZOOM, MIN_ZOOM } from '../lib/constants.js';
import {
  cloneElements,
  createElement,
  createImageElement,
  getSelectionBounds,
  reorder,
  withMeasuredText,
} from '../lib/elements.js';
import { clamp } from '../lib/geometry.js';
import {
  clearImages,
  deleteImage,
  findRemovedImageKeys,
  migrateImageElements,
  pruneImageRecords,
  releaseAllImages,
  releaseImage,
  withoutImageSource,
  withImageSources,
} from '../lib/images.js';

const STORAGE_KEY = 'drawdesign:v1';
const LEGACY_STORAGE_KEY = 'inkboard:v1';
const HISTORY_LIMIT = 200;
const COALESCE_MS = 800;

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initialStore() {
  const saved = loadSaved();
  const prefersDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    elements: Array.isArray(saved?.elements) ? saved.elements : [],
    past: [],
    future: [],
    view: saved?.view ?? { x: 0, y: 0, zoom: 1 },
    viewport: {
      w: typeof window === 'undefined' ? 0 : window.innerWidth,
      h: typeof window === 'undefined' ? 0 : window.innerHeight,
    },
    tool: 'select',
    selectedIds: [],
    style: { ...DEFAULT_STYLE, ...(saved?.style ?? {}) },
    grid: saved?.grid ?? false,
    theme: saved?.theme ?? (prefersDark ? 'dark' : 'light'),
    toolLock: false,
    editing: null, // { id|null, x, y, text, fontSize, fontFamily, strokeColor, opacity }
    lastCommit: { key: null, t: 0 },
    clipboard: [],
    pasteCount: 0,
    migrationDone: false,
  };
}

export function serializeScene(s) {
  return {
    type: 'drawdesign',
    version: 2,
    elements: s.elements.map(withoutImageSource),
    view: s.view,
    style: s.style,
    grid: s.grid,
    theme: s.theme,
  };
}

export async function exportScene(s) {
  return {
    type: 'drawdesign',
    version: 2,
    elements: await withImageSources(s.elements.map(withoutImageSource)),
    view: s.view,
    style: s.style,
    grid: s.grid,
    theme: s.theme,
  };
}

export function useBoard({ onError } = {}) {
  const [, bump] = useReducer((n) => n + 1, 0);
  const [S] = useState(initialStore);
  const errorRef = useRef(onError);
  const emit = () => bump();

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  const reportError = (err) => {
    const message = typeof err === 'string' ? err : err?.message;
    errorRef.current?.(message || 'Image storage error');
  };

  const api = useMemo(() => {
    const ids = () => new Set(S.selectedIds);
    const selectedElements = () => S.elements.filter((el) => ids().has(el.id));
    const pruneSelection = () => {
      const alive = new Set(S.elements.map((e) => e.id));
      S.selectedIds = S.selectedIds.filter((id) => alive.has(id));
    };

    // ------------------------------------------------ history
    const checkpoint = () => {
      S.past.push(S.elements);
      if (S.past.length > HISTORY_LIMIT) S.past.shift();
      S.future = [];
      S.lastCommit = { key: null, t: 0 };
    };
    const discardCheckpoint = () => {
      S.elements = S.past.pop() ?? S.elements;
    };
    const cleanupRemovedImages = (previous, next) => {
      const clipboardIds = S.clipboard.map((el) => el.fileId);
      for (const fileId of findRemovedImageKeys(previous, next, clipboardIds)) {
        releaseImage(fileId);
        deleteImage(fileId).catch(reportError);
      }
    };
    const replace = (next) => {
      cleanupRemovedImages(S.elements, next);
      S.elements = next;
      emit();
    };
    // Record a change. Repeated commits with the same `key` inside a short window
    // (dragging a slider, nudging with arrow keys) collapse into one undo step.
    const commit = (next, key = null) => {
      const now = performance.now();
      const coalesce = key && S.lastCommit.key === key && now - S.lastCommit.t < COALESCE_MS;
      if (!coalesce) checkpoint();
      S.lastCommit = { key, t: now };
      replace(next);
    };
    const undo = () => {
      if (!S.past.length) return;
      S.future.push(S.elements);
      S.elements = S.past.pop();
      S.lastCommit = { key: null, t: 0 };
      pruneSelection();
      emit();
    };
    const redo = () => {
      if (!S.future.length) return;
      S.past.push(S.elements);
      S.elements = S.future.pop();
      S.lastCommit = { key: null, t: 0 };
      pruneSelection();
      emit();
    };

    // ------------------------------------------------ view
    const setView = (view) => {
      S.view = view;
      emit();
    };
    const setViewport = (w, h) => {
      if (S.viewport.w === w && S.viewport.h === h) return;
      S.viewport = { w, h };
      emit();
    };
    const zoomAt = (factor, cx, cy) => {
      const { x, y, zoom } = S.view;
      const next = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM);
      const k = next / zoom;
      setView({ x: cx - (cx - x) * k, y: cy - (cy - y) * k, zoom: next });
    };
    const zoomTo = (zoom, cx, cy) => zoomAt(zoom / S.view.zoom, cx, cy);
    const fitToContent = (width, height) => {
      const targets = S.selectedIds.length ? selectedElements() : S.elements;
      const b = getSelectionBounds(targets);
      if (!b) return setView({ x: width / 2, y: height / 2, zoom: 1 });
      const zoom = clamp(Math.min((width - 160) / Math.max(b.w, 1), (height - 200) / Math.max(b.h, 1), 2), MIN_ZOOM, MAX_ZOOM);
      setView({
        x: width / 2 - (b.x + b.w / 2) * zoom,
        y: height / 2 - (b.y + b.h / 2) * zoom,
        zoom,
      });
    };

    // ------------------------------------------------ tool / selection
    const select = (list) => {
      S.selectedIds = list;
      emit();
    };
    const setTool = (tool) => {
      S.tool = tool;
      if (tool !== 'select') S.selectedIds = [];
      emit();
    };
    const toggleLock = () => {
      S.toolLock = !S.toolLock;
      emit();
    };
    const toggleGrid = () => {
      S.grid = !S.grid;
      emit();
    };
    const toggleTheme = () => {
      S.theme = S.theme === 'dark' ? 'light' : 'dark';
      emit();
    };
    const selectAll = () => select(S.elements.map((e) => e.id));

    // ------------------------------------------------ editing actions
    const deleteSelected = () => {
      if (!S.selectedIds.length) return;
      const sel = ids();
      commit(S.elements.filter((e) => !sel.has(e.id)));
      S.selectedIds = [];
      emit();
    };

    const duplicate = () => {
      const picked = selectedElements();
      if (!picked.length) return;
      const copies = cloneElements(picked, 16, 16);
      commit([...S.elements, ...copies]);
      select(copies.map((c) => c.id));
    };

    const copy = () => {
      S.clipboard = selectedElements();
      S.pasteCount = 0;
    };

    const cut = () => {
      copy();
      deleteSelected();
    };

    const paste = () => {
      if (!S.clipboard.length) return;
      S.pasteCount += 1;
      const offset = 16 * S.pasteCount;
      const copies = cloneElements(S.clipboard, offset, offset);
      commit([...S.elements, ...copies]);
      S.tool = 'select';
      select(copies.map((c) => c.id));
    };

    const addImage = (image, point) => {
      if (!image?.fileId) return;
      const { view, viewport } = S;
      const center = point ?? {
        x: (viewport.w / 2 - view.x) / view.zoom,
        y: (viewport.h / 2 - view.y) / view.zoom,
      };
      const base = createImageElement(image, 0, 0, S.style);
      const el = {
        ...base,
        x: center.x - base.width / 2,
        y: center.y - base.height / 2,
      };
      commit([...S.elements, el]);
      S.tool = 'select';
      S.selectedIds = [el.id];
    };

    const nudge = (dx, dy) => {
      if (!S.selectedIds.length) return;
      const sel = ids();
      commit(S.elements.map((e) => (sel.has(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e)), 'nudge');
    };

    const reorderSelected = (direction) => {
      if (!S.selectedIds.length) return;
      commit(reorder(S.elements, S.selectedIds, direction));
    };

    // Apply style changes to the defaults and to whatever is selected.
    const applyStyle = (patch, key = null) => {
      S.style = { ...S.style, ...patch };
      if (S.selectedIds.length) {
        const sel = ids();
        const next = S.elements.map((el) => {
          if (!sel.has(el.id)) return el;
          // Only touch properties that make sense for the element.
          const own = {};
          for (const [k, v] of Object.entries(patch)) {
            if ((k === 'fontSize' || k === 'fontFamily') && el.type !== 'text') continue;
            if ((k === 'backgroundColor' || k === 'fillStyle') && (el.type === 'text' || el.points)) continue;
            own[k] = v;
          }
          if (el.type === 'text' && ('fontSize' in own || 'fontFamily' in own)) return withMeasuredText(el, own);
          return { ...el, ...own };
        });
        commit(next, key);
      } else {
        emit();
      }
    };

    // ------------------------------------------------ text editing
    const startText = (x, y) => {
      S.editing = {
        id: null,
        x,
        y,
        text: '',
        fontSize: S.style.fontSize,
        fontFamily: S.style.fontFamily,
        strokeColor: S.style.strokeColor,
        opacity: S.style.opacity,
      };
      emit();
    };
    const editText = (el) => {
      S.selectedIds = [el.id];
      S.editing = {
        id: el.id,
        x: el.x,
        y: el.y,
        text: el.text,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        strokeColor: el.strokeColor,
        opacity: el.opacity,
      };
      emit();
    };
    const finishEditing = (text) => {
      const ed = S.editing;
      if (!ed) return;
      S.editing = null;
      const clean = text.replace(/\s+$/g, '');
      if (ed.id) {
        if (!clean) {
          commit(S.elements.filter((e) => e.id !== ed.id));
          S.selectedIds = [];
        } else {
          commit(S.elements.map((e) => (e.id === ed.id ? withMeasuredText(e, { text: clean }) : e)));
        }
      } else if (clean) {
        const base = createElement('text', ed.x, ed.y, { ...S.style, fontSize: ed.fontSize, fontFamily: ed.fontFamily });
        const el = withMeasuredText(base, { text: clean });
        commit([...S.elements, el]);
        if (!S.toolLock) S.tool = 'select';
        S.selectedIds = S.toolLock ? [] : [el.id];
      }
      emit();
    };

    // ------------------------------------------------ scene
    const clearScene = () => {
      if (!S.elements.length) return;
      commit([]);
      S.selectedIds = [];
      S.clipboard = [];
      releaseAllImages();
      clearImages().catch(reportError);
      emit();
    };
    const loadScene = async (data) => {
      if (!data || !['drawdesign', 'inkboard'].includes(data.type) || !Array.isArray(data.elements)) {
        throw new Error('Not a DrawDesign file');
      }
      const { elements } = await migrateImageElements(data.elements);
      const previous = S.elements;
      checkpoint();
      S.elements = elements;
      S.selectedIds = [];
      S.clipboard = [];
      if (data.view) S.view = data.view;
      cleanupRemovedImages(previous, elements);
      const keep = elements.map((el) => el.fileId);
      pruneImageRecords(keep).catch(reportError);
      S.migrationDone = true;
      emit();
    };
    const remeasureText = () => {
      // Fonts load asynchronously; re-measure saved text once they are ready.
      if (!S.elements.some((e) => e.type === 'text')) return;
      S.elements = S.elements.map((e) => (e.type === 'text' ? withMeasuredText(e) : e));
      emit();
    };

    return {
      checkpoint, discardCheckpoint, replace, commit, undo, redo,
      setView, setViewport, zoomAt, zoomTo, fitToContent,
      select, setTool, toggleLock, toggleGrid, toggleTheme, selectAll,
      deleteSelected, duplicate, copy, cut, paste, addImage, nudge, reorderSelected, applyStyle,
      startText, editText, finishEditing,
      clearScene, loadScene, remeasureText,
      emit,
    };
    // S is a stable ref value; bump is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    migrateImageElements(S.elements)
      .then(({ elements, changed }) => {
        if (active && changed) {
          S.elements = elements;
          emit();
        }
      })
      .catch(reportError)
      .finally(() => {
        if (!active) return;
        S.migrationDone = true;
        emit();
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist (debounced) after anything changes.
  useEffect(() => {
    if (!S.migrationDone) return undefined;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeScene(S)));
      } catch {
        reportError('Board storage is full or unavailable; recent changes were not saved.');
      }
    }, 400);
    return () => clearTimeout(t);
  });

  return { s: S, ...api };
}
