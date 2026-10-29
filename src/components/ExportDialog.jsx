import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, FileCode2, X } from 'lucide-react';
import { exportToCanvas, exportToSvg, svgToString } from '../lib/render.js';
import { canvasToBlob, copyImageToClipboard, downloadBlob, stamp } from '../lib/files.js';

export default function ExportDialog({ board, onClose, onToast }) {
  const { elements, selectedIds } = board.s;
  const hasSelection = selectedIds.length > 0;
  const [onlySelected, setOnlySelected] = useState(hasSelection);
  const [background, setBackground] = useState(true);
  const [dark, setDark] = useState(board.s.theme === 'dark');
  const [scale, setScale] = useState(2);
  const previewRef = useRef(null);
  const dialogRef = useRef(null);

  const targets = useMemo(() => {
    const ids = new Set(selectedIds);
    return onlySelected && hasSelection ? elements.filter((e) => ids.has(e.id)) : elements;
  }, [elements, selectedIds, onlySelected, hasSelection]);

  // Live preview (always at 1x so it stays cheap).
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const render = () => exportToCanvas(targets, { scale, background, dark });

  const savePng = async () => {
    const canvas = render();
    if (!canvas) return;
    downloadBlob(await canvasToBlob(canvas), `inkboard-${stamp()}.png`);
    onToast('Exported PNG');
  };

  const saveSvg = () => {
    const svg = exportToSvg(targets, { background });
    if (!svg) return;
    downloadBlob(new Blob([svgToString(svg)], { type: 'image/svg+xml' }), `inkboard-${stamp()}.svg`);
    onToast('Exported SVG');
  };

  const copyPng = async () => {
    const canvas = render();
    if (!canvas) return;
    try {
      await copyImageToClipboard(await canvasToBlob(canvas));
      onToast('Copied image to clipboard');
    } catch (err) {
      onToast(err.message || 'Could not copy the image');
    }
  };

  const empty = targets.length === 0;

  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" tabIndex={-1} ref={dialogRef}>
        <header>
          <h2 id="export-title">Export image</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>

        <div className={`preview${background ? '' : ' checker'}`}>
          {empty ? <p className="muted">Nothing to export yet. Draw something first.</p> : <canvas ref={previewRef} />}
        </div>

        <div className="options">
          <label className="check">
            <input type="checkbox" checked={background} onChange={(e) => setBackground(e.target.checked)} /> Include background
          </label>
          <label className="check">
            <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} /> Dark mode
          </label>
          <label className={`check${hasSelection ? '' : ' disabled'}`}>
            <input
              type="checkbox"
              disabled={!hasSelection}
              checked={onlySelected && hasSelection}
              onChange={(e) => setOnlySelected(e.target.checked)}
            />{' '}
            Selected objects only
          </label>
          <div className="scale" role="group" aria-label="PNG scale">
            <span>PNG scale</span>
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" className="seg" aria-pressed={scale === n} onClick={() => setScale(n)}>
                {n}x
              </button>
            ))}
          </div>
        </div>

        <footer>
          <button type="button" className="ghost-btn" disabled={empty} onClick={copyPng}>
            <Copy size={16} /> Copy PNG
          </button>
          <button type="button" className="ghost-btn" disabled={empty} onClick={saveSvg}>
            <FileCode2 size={16} /> Download SVG
          </button>
          <button type="button" className="primary-btn" disabled={empty} onClick={savePng}>
            <Download size={16} /> Download PNG
          </button>
        </footer>
      </div>
    </div>
  );
}
