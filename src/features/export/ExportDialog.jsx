import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, FileCode2, X } from "lucide-react";
import {
  exportToCanvas,
  exportToSvg,
  svgToString,
} from "../board/lib/render.js";
import {
  canvasToBlob,
  copyImageToClipboard,
  downloadBlob,
  stamp,
} from "../../shared/lib/files.js";

export default function ExportDialog({ board, onClose, onToast }) {
  const { elements, selectedIds } = board.s;
  const hasSelection = selectedIds.length > 0;
  const [onlySelected, setOnlySelected] = useState(hasSelection);
  const [background, setBackground] = useState(true);
  const [dark, setDark] = useState(board.s.theme === "dark");
  const [scale, setScale] = useState(2);
  const previewRef = useRef(null);
  const dialogRef = useRef(null);

  const targets = useMemo(() => {
    const ids = new Set(selectedIds);
    return onlySelected && hasSelection
      ? elements.filter((e) => ids.has(e.id))
      : elements;
  }, [elements, selectedIds, onlySelected, hasSelection]);

  // Live preview (always at 1x so it stays cheap).
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rendered = exportToCanvas(targets, { scale: 1, background, dark });
    if (!rendered) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    ctx.drawImage(rendered, 0, 0);
  }, [targets, background, dark]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const render = () => exportToCanvas(targets, { scale, background, dark });

  const savePng = async () => {
    const canvas = render();
    if (!canvas) return;
    downloadBlob(await canvasToBlob(canvas), `drawdesign-${stamp()}.png`);
    onToast("Exported PNG");
  };

  const saveSvg = () => {
    const svg = exportToSvg(targets, { background });
    if (!svg) return;
    downloadBlob(
      new Blob([svgToString(svg)], { type: "image/svg+xml" }),
      `drawdesign-${stamp()}.svg`,
    );
    onToast("Exported SVG");
  };

  const copyPng = async () => {
    const canvas = render();
    if (!canvas) return;
    try {
      await copyImageToClipboard(await canvasToBlob(canvas));
      onToast("Copied image to clipboard");
    } catch (err) {
      onToast(err.message || "Could not copy the image");
    }
  };

  const empty = targets.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,17,22,0.5)] p-4"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[calc(100vh-32px)] w-[min(560px,100%)] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="mb-[14px] flex items-center justify-between">
          <h2
            id="export-title"
            className="m-0 font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.01em]"
          >
            Export image
          </h2>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-[var(--surface-2)]"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </header>

        <div
          className={`grid h-[260px] place-items-center overflow-hidden rounded-xl border border-[var(--border)] bg-white p-3 ${background ? "" : "preview-checker"}`}
        >
          {empty ? (
            <p className="text-[var(--muted)]">
              Nothing to export yet. Draw something first.
            </p>
          ) : (
            <canvas
              className="max-h-full max-w-full object-contain"
              ref={previewRef}
            />
          )}
        </div>

        <div className="my-[14px] flex flex-wrap items-center gap-x-[18px] gap-y-[10px]">
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              className="accent-[var(--accent)]"
              type="checkbox"
              checked={background}
              onChange={(e) => setBackground(e.target.checked)}
            />{" "}
            Include background
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              className="accent-[var(--accent)]"
              type="checkbox"
              checked={dark}
              onChange={(e) => setDark(e.target.checked)}
            />{" "}
            Dark mode
          </label>
          <label
            className={`inline-flex items-center gap-1.5 ${hasSelection ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
          >
            <input
              type="checkbox"
              className="accent-[var(--accent)]"
              disabled={!hasSelection}
              checked={onlySelected && hasSelection}
              onChange={(e) => setOnlySelected(e.target.checked)}
            />{" "}
            Selected objects only
          </label>
          <div
            className="ml-auto inline-flex items-center gap-1"
            role="group"
            aria-label="PNG scale"
          >
            <span className="mr-1 text-[var(--muted)]">PNG scale</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className="grid min-h-[30px] min-w-9 flex-none place-items-center rounded-[7px] border-0 bg-[var(--surface-2)] px-1.5 text-[12px] font-medium whitespace-nowrap aria-pressed:bg-[var(--accent)] aria-pressed:text-[var(--accent-ink)]"
                aria-pressed={scale === n}
                onClick={() => setScale(n)}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 font-semibold enabled:hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-[0.45]"
            disabled={empty}
            onClick={copyPng}
          >
            <Copy size={16} /> Copy PNG
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 font-semibold enabled:hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-[0.45]"
            disabled={empty}
            onClick={saveSvg}
          >
            <FileCode2 size={16} /> Download SVG
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[var(--accent)] px-4 font-semibold text-[var(--accent-ink)] shadow-[var(--shadow)] enabled:hover:brightness-[1.08] disabled:cursor-not-allowed disabled:opacity-[0.45]"
            disabled={empty}
            onClick={savePng}
          >
            <Download size={16} /> Download PNG
          </button>
        </footer>
      </div>
    </div>
  );
}
