import { useEffect, useRef, useState } from "react";
import { MAX_ZOOM, MIN_ZOOM } from "../lib/constants.js";
import {
  createElement,
  getSelectionBounds,
  hitHandle,
  hitPoint,
  hitTest,
  isDegenerate,
  isLinear,
  normalizeElement,
  scaleElement,
  topElementAt,
  getBounds,
  HANDLE_PAD,
} from "../lib/elements.js";
import {
  clamp,
  rectContains,
  rectFromPoints,
  snapAngle,
} from "../lib/geometry.js";
import { renderScene } from "../lib/render.js";

const SHAPE_TOOLS = new Set([
  "rectangle",
  "diamond",
  "ellipse",
  "line",
  "arrow",
]);
const RESIZE_CURSORS = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

export default function Canvas({ board }) {
  const S = board.s;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1, ready: false });
  const rafRef = useRef(0);
  const ix = useRef(null); // the interaction in progress
  const pointers = useRef(new Map());
  const overlay = useRef({ marquee: null, erasingIds: null });
  const space = useRef(false);
  const [cursor, setCursor] = useState("default");

  // ------------------------------------------------------------ painting
  const draw = () => {
    const canvas = canvasRef.current;
    const { w, h, dpr } = sizeRef.current;
    if (!canvas || !w) return;
    renderScene(canvas, {
      elements: S.elements,
      view: S.view,
      selectedIds: S.selectedIds,
      grid: S.grid,
      editingId: S.editing?.id ?? null,
      marquee: overlay.current.marquee,
      erasingIds: overlay.current.erasingIds,
      width: w,
      height: h,
      dpr,
    });
  };

  // Repaint after every render, at most once per animation frame.
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
  });

  // Keep the backing store matched to the element size and device pixel ratio.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const apply = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      const first = !sizeRef.current.ready;
      sizeRef.current = { w: r.width, h: r.height, dpr, ready: true };
      // Fresh board: put the origin in the middle of the screen.
      if (first && S.view.x === 0 && S.view.y === 0 && !S.elements.length) {
        board.setView({ x: r.width / 2, y: r.height / 2, zoom: 1 });
      } else {
        draw();
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------ coordinates
  const screenPoint = (clientX, clientY) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };
  const toWorld = (clientX, clientY) => {
    const p = screenPoint(clientX, clientY);
    const { x, y, zoom } = S.view;
    return { x: (p.x - x) / zoom, y: (p.y - y) / zoom };
  };

  // ------------------------------------------------------------ interaction helpers
  const ensureCheckpoint = (cur) => {
    if (!cur.checkpointed) {
      board.checkpoint();
      cur.checkpointed = true;
    }
  };

  const cancelInteraction = () => {
    const cur = ix.current;
    ix.current = null;
    overlay.current = { marquee: null, erasingIds: null };
    if (cur?.checkpointed) {
      board.discardCheckpoint();
      const alive = new Set(S.elements.map((e) => e.id));
      S.selectedIds = S.selectedIds.filter((id) => alive.has(id));
    }
    board.emit();
  };

  const eraseAt = (cur, wx, wy) => {
    const tol = 6 / S.view.zoom;
    // Interpolate so fast strokes can't skip over thin elements.
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(wx - cur.last.x, wy - cur.last.y) / tol),
    );
    for (let i = 1; i <= steps; i++) {
      const px = cur.last.x + ((wx - cur.last.x) * i) / steps;
      const py = cur.last.y + ((wy - cur.last.y) * i) / steps;
      for (const el of S.elements)
        if (!cur.ids.has(el.id) && hitTest(el, px, py, tol)) cur.ids.add(el.id);
    }
    cur.last = { x: wx, y: wy };
    overlay.current.erasingIds = cur.ids;
    board.emit();
  };

  // ------------------------------------------------------------ pointer down
  const onPointerDown = (e) => {
    // A click outside the text editor blurs it, which commits the text.
    if (S.editing) return;
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return;

    canvasRef.current.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      cancelInteraction();
      const [a, b] = [...pointers.current.values()];
      const mid = screenPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      ix.current = {
        mode: "pinch",
        d0: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid0: mid,
        view: { ...S.view },
      };
      return;
    }
    if (pointers.current.size > 2) return;

    const w = toWorld(e.clientX, e.clientY);
    const sp = screenPoint(e.clientX, e.clientY);
    const zoom = S.view.zoom;
    const tool = S.tool;

    if (e.button === 1 || tool === "hand" || space.current) {
      ix.current = {
        mode: "pan",
        sx: e.clientX,
        sy: e.clientY,
        view: { ...S.view },
      };
      setCursor("grabbing");
      return;
    }

    if (tool === "select") {
      const selIds = new Set(S.selectedIds);
      const selected = S.elements.filter((el) => selIds.has(el.id));

      if (selected.length === 1 && isLinear(selected[0])) {
        const index = hitPoint(selected[0], w.x, w.y, zoom);
        if (index >= 0) {
          ix.current = { mode: "point", id: selected[0].id, index };
          return;
        }
      } else if (selected.length) {
        const b0 = getSelectionBounds(selected);
        const handle = hitHandle(b0, w.x, w.y, zoom);
        if (handle) {
          const edgeX = handle.includes("w")
            ? b0.x
            : handle.includes("e")
              ? b0.x + b0.w
              : w.x;
          const edgeY = handle.includes("n")
            ? b0.y
            : handle.includes("s")
              ? b0.y + b0.h
              : w.y;
          ix.current = {
            mode: "resize",
            handle,
            orig: selected,
            b0,
            offX: w.x - edgeX,
            offY: w.y - edgeY,
          };
          return;
        }
      }

      const hit = topElementAt(S.elements, w.x, w.y, 6 / zoom);
      if (hit) {
        let ids = S.selectedIds;
        let collapseTo = null;
        if (e.shiftKey) {
          if (selIds.has(hit.id)) {
            board.select(ids.filter((id) => id !== hit.id));
            return;
          }
          ids = [...ids, hit.id];
          board.select(ids);
        } else if (!selIds.has(hit.id)) {
          ids = [hit.id];
          board.select(ids);
        } else if (ids.length > 1) {
          collapseTo = hit.id;
        }
        ix.current = {
          mode: "move",
          start: w,
          startScreen: sp,
          orig: S.elements.filter((el) => ids.includes(el.id)),
          moved: false,
          collapseTo,
        };
        return;
      }

      // Dragging inside a multi-selection's box moves the whole group.
      if (selected.length > 1) {
        const b = getSelectionBounds(selected);
        const pad = HANDLE_PAD / zoom;
        if (
          w.x >= b.x - pad &&
          w.x <= b.x + b.w + pad &&
          w.y >= b.y - pad &&
          w.y <= b.y + b.h + pad
        ) {
          ix.current = {
            mode: "move",
            start: w,
            startScreen: sp,
            orig: selected,
            moved: false,
            collapseTo: null,
          };
          return;
        }
      }

      if (!e.shiftKey && S.selectedIds.length) board.select([]);
      ix.current = {
        mode: "marquee",
        start: w,
        base: e.shiftKey ? S.selectedIds : [],
      };
      return;
    }

    if (SHAPE_TOOLS.has(tool)) {
      ix.current = {
        mode: "draw",
        start: w,
        startScreen: sp,
        el: createElement(tool, w.x, w.y, S.style),
        created: false,
      };
      return;
    }

    if (tool === "freedraw") {
      const el = createElement("freedraw", w.x, w.y, S.style);
      const cur = {
        mode: "freedraw",
        id: el.id,
        last: [0, 0],
        checkpointed: false,
      };
      ensureCheckpoint(cur);
      board.replace([...S.elements, el]);
      ix.current = cur;
      return;
    }

    if (tool === "eraser") {
      const cur = { mode: "erase", ids: new Set(), last: w };
      ix.current = cur;
      eraseAt(cur, w.x, w.y);
      return;
    }

    if (tool === "text") {
      ix.current = { mode: "text", world: w };
    }
  };

  // ------------------------------------------------------------ hover cursor
  const updateCursor = (e) => {
    const tool = S.tool;
    let c = "crosshair";
    if (space.current || tool === "hand") c = "grab";
    else if (tool === "text") c = "text";
    else if (tool === "select") {
      c = "default";
      const w = toWorld(e.clientX, e.clientY);
      const zoom = S.view.zoom;
      const selIds = new Set(S.selectedIds);
      const selected = S.elements.filter((el) => selIds.has(el.id));
      let handled = false;
      if (selected.length === 1 && isLinear(selected[0])) {
        if (hitPoint(selected[0], w.x, w.y, zoom) >= 0) {
          c = "pointer";
          handled = true;
        }
      } else if (selected.length) {
        const handle = hitHandle(getSelectionBounds(selected), w.x, w.y, zoom);
        if (handle) {
          c = RESIZE_CURSORS[handle];
          handled = true;
        }
      }
      if (!handled && topElementAt(S.elements, w.x, w.y, 6 / zoom)) c = "move";
    }
    setCursor(c);
  };

  // ------------------------------------------------------------ pointer move
  const onPointerMove = (e) => {
    if (pointers.current.has(e.pointerId))
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const cur = ix.current;
    if (!cur) {
      if (pointers.current.size <= 1 && !S.editing) updateCursor(e);
      return;
    }

    if (cur.mode === "pinch") {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = screenPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      const zoom = clamp(cur.view.zoom * (d / cur.d0), MIN_ZOOM, MAX_ZOOM);
      const wx = (cur.mid0.x - cur.view.x) / cur.view.zoom;
      const wy = (cur.mid0.y - cur.view.y) / cur.view.zoom;
      board.setView({ x: mid.x - wx * zoom, y: mid.y - wy * zoom, zoom });
      return;
    }

    const w = toWorld(e.clientX, e.clientY);

    switch (cur.mode) {
      case "pan":
        board.setView({
          ...cur.view,
          x: cur.view.x + (e.clientX - cur.sx),
          y: cur.view.y + (e.clientY - cur.sy),
        });
        break;

      case "move": {
        let dx = w.x - cur.start.x;
        let dy = w.y - cur.start.y;
        const sp = screenPoint(e.clientX, e.clientY);
        if (
          !cur.moved &&
          Math.hypot(sp.x - cur.startScreen.x, sp.y - cur.startScreen.y) < 3
        )
          break;
        cur.moved = true;
        ensureCheckpoint(cur);
        if (e.shiftKey) {
          if (Math.abs(dx) > Math.abs(dy)) dy = 0;
          else dx = 0;
        }
        const next = new Map(
          cur.orig.map((o) => [o.id, { ...o, x: o.x + dx, y: o.y + dy }]),
        );
        board.replace(S.elements.map((el) => next.get(el.id) ?? el));
        break;
      }

      case "resize": {
        ensureCheckpoint(cur);
        const { handle, b0, orig, offX, offY } = cur;
        const px = w.x - offX;
        const py = w.y - offY;
        let sx = 1;
        let sy = 1;
        let ax = b0.x;
        let ay = b0.y;
        if (handle.includes("e")) sx = (px - b0.x) / (b0.w || 1);
        if (handle.includes("w")) {
          sx = (b0.x + b0.w - px) / (b0.w || 1);
          ax = b0.x + b0.w;
        }
        if (handle.includes("s")) sy = (py - b0.y) / (b0.h || 1);
        if (handle.includes("n")) {
          sy = (b0.y + b0.h - py) / (b0.h || 1);
          ay = b0.y + b0.h;
        }
        if (e.shiftKey && handle.length === 2) {
          const m = Math.max(Math.abs(sx), Math.abs(sy));
          sx = (sx < 0 ? -1 : 1) * m;
          sy = (sy < 0 ? -1 : 1) * m;
        }
        if (Math.abs(sx) < 0.01) sx = sx < 0 ? -0.01 : 0.01;
        if (Math.abs(sy) < 0.01) sy = sy < 0 ? -0.01 : 0.01;
        const next = new Map(
          orig.map((o) => [o.id, scaleElement(o, ax, ay, sx, sy)]),
        );
        board.replace(S.elements.map((el) => next.get(el.id) ?? el));
        break;
      }

      case "point": {
        ensureCheckpoint(cur);
        const el = S.elements.find((x) => x.id === cur.id);
        if (!el) break;
        let px = w.x - el.x;
        let py = w.y - el.y;
        if (e.shiftKey && el.points.length === 2) {
          const other = el.points[1 - cur.index];
          const [dx, dy] = snapAngle(px - other[0], py - other[1]);
          px = other[0] + dx;
          py = other[1] + dy;
        }
        const points = el.points.map((p, i) =>
          i === cur.index ? [px, py] : p,
        );
        board.replace(
          S.elements.map((x) => (x.id === cur.id ? { ...x, points } : x)),
        );
        break;
      }

      case "marquee": {
        const rect = rectFromPoints(cur.start.x, cur.start.y, w.x, w.y);
        overlay.current.marquee = rect;
        const inside = S.elements
          .filter((el) => rectContains(rect, getBounds(el)))
          .map((el) => el.id);
        board.select([...new Set([...cur.base, ...inside])]);
        break;
      }

      case "draw": {
        const sp = screenPoint(e.clientX, e.clientY);
        if (!cur.created) {
          if (
            Math.hypot(sp.x - cur.startScreen.x, sp.y - cur.startScreen.y) < 2
          )
            break;
          ensureCheckpoint(cur);
          cur.created = true;
          board.replace([...S.elements, cur.el]);
        }
        let dx = w.x - cur.start.x;
        let dy = w.y - cur.start.y;
        const linear = cur.el.type === "line" || cur.el.type === "arrow";
        if (linear) {
          if (e.shiftKey) [dx, dy] = snapAngle(dx, dy);
          board.replace(
            S.elements.map((x) =>
              x.id === cur.el.id
                ? {
                    ...x,
                    points: [
                      [0, 0],
                      [dx, dy],
                    ],
                  }
                : x,
            ),
          );
        } else {
          if (e.shiftKey) {
            const m = Math.max(Math.abs(dx), Math.abs(dy));
            dx = (dx < 0 ? -1 : 1) * m;
            dy = (dy < 0 ? -1 : 1) * m;
          }
          board.replace(
            S.elements.map((x) =>
              x.id === cur.el.id ? { ...x, width: dx, height: dy } : x,
            ),
          );
        }
        break;
      }

      case "freedraw": {
        const el = S.elements.find((x) => x.id === cur.id);
        if (!el) break;
        const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
        const minStep = 1.5 / S.view.zoom;
        const points = [...el.points];
        let last = cur.last;
        for (const ev of events.length ? events : [e.nativeEvent]) {
          const p = toWorld(ev.clientX, ev.clientY);
          const rel = [p.x - el.x, p.y - el.y];
          if (Math.hypot(rel[0] - last[0], rel[1] - last[1]) >= minStep) {
            points.push(rel);
            last = rel;
          }
        }
        if (points.length !== el.points.length) {
          cur.last = last;
          board.replace(
            S.elements.map((x) => (x.id === cur.id ? { ...x, points } : x)),
          );
        }
        break;
      }

      case "erase":
        eraseAt(cur, w.x, w.y);
        break;

      default:
        break;
    }
  };

  // ------------------------------------------------------------ pointer up
  const releasePointer = (e) => {
    pointers.current.delete(e.pointerId);
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onPointerUp = (e) => {
    releasePointer(e);
    const cur = ix.current;
    if (!cur) return;

    if (cur.mode === "pinch") {
      if (pointers.current.size < 2) ix.current = null;
      return;
    }
    ix.current = null;

    switch (cur.mode) {
      case "move":
        if (!cur.moved && cur.collapseTo) board.select([cur.collapseTo]);
        break;

      case "resize": {
        const ids = new Set(cur.orig.map((o) => o.id));
        board.replace(
          S.elements.map((el) => (ids.has(el.id) ? normalizeElement(el) : el)),
        );
        break;
      }

      case "marquee":
        overlay.current.marquee = null;
        board.emit();
        break;

      case "draw": {
        const el = S.elements.find((x) => x.id === cur.el.id);
        if (!cur.created || !el || isDegenerate(el)) {
          if (cur.checkpointed) board.discardCheckpoint();
          board.emit();
          break;
        }
        board.replace(
          S.elements.map((x) => (x.id === el.id ? normalizeElement(x) : x)),
        );
        if (!S.toolLock) {
          board.setTool("select");
          board.select([el.id]);
        }
        break;
      }

      case "erase": {
        const ids = cur.ids;
        overlay.current.erasingIds = null;
        if (ids.size) board.commit(S.elements.filter((el) => !ids.has(el.id)));
        else board.emit();
        break;
      }

      case "text":
        board.startText(cur.world.x, cur.world.y);
        break;

      case "pan":
        updateCursor(e);
        break;

      default:
        break;
    }
  };

  const onPointerCancel = (e) => {
    releasePointer(e);
    cancelInteraction();
  };

  const onDoubleClick = (e) => {
    if (S.tool !== "select") return;
    const w = toWorld(e.clientX, e.clientY);
    const hit = topElementAt(S.elements, w.x, w.y, 6 / S.view.zoom);
    if (hit?.type === "text") board.editText(hit);
    else if (!hit) board.startText(w.x, w.y);
  };

  // ------------------------------------------------------------ wheel + keys
  useEffect(() => {
    const wrap = wrapRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const p = screenPoint(e.clientX, e.clientY);
      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinch sends many small deltas; a mouse wheel sends big ones.
        const k = Math.abs(e.deltaY) >= 50 ? 0.0015 : 0.01;
        board.zoomAt(Math.exp(-e.deltaY * k), p.x, p.y);
      } else {
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
        board.setView({ ...S.view, x: S.view.x - dx, y: S.view.y - dy });
      }
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const typing = (t) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable);
    const down = (e) => {
      if (e.code === "Space" && !typing(e.target)) {
        e.preventDefault();
        if (!space.current) {
          space.current = true;
          setCursor("grab");
        }
      }
      if (e.key === "Escape" && ix.current) cancelInteraction();
    };
    const up = (e) => {
      if (e.code === "Space") {
        space.current = false;
        setCursor("default");
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" data-theme-canvas={S.theme}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none dark:filter:invert(93%)_hue-rotate(180deg)"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
