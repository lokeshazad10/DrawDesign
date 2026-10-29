import { Maximize, Minus, Plus, Redo2, Undo2 } from 'lucide-react';

export default function BottomBar({ board }) {
  const { view, past, future } = board.s;
  const cx = () => window.innerWidth / 2;
  const cy = () => window.innerHeight / 2;

  return (
    <div className="bottom-left">
      <div className="pill zoom" role="group" aria-label="Zoom">
        <button type="button" className="icon-btn" aria-label="Zoom out" title="Zoom out (Ctrl+-)" onClick={() => board.zoomAt(1 / 1.2, cx(), cy())}>
          <Minus size={16} />
        </button>
        <button type="button" className="zoom-value" title="Reset zoom to 100% (Ctrl+0)" onClick={() => board.zoomTo(1, cx(), cy())}>
          {Math.round(view.zoom * 100)}%
        </button>
        <button type="button" className="icon-btn" aria-label="Zoom in" title="Zoom in (Ctrl++)" onClick={() => board.zoomAt(1.2, cx(), cy())}>
          <Plus size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Zoom to fit" title="Zoom to fit (Shift+1)" onClick={() => board.fitToContent(window.innerWidth, window.innerHeight)}>
          <Maximize size={16} />
        </button>
      </div>
      <div className="pill history" role="group" aria-label="History">
        <button type="button" className="icon-btn" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!past.length} onClick={board.undo}>
          <Undo2 size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!future.length} onClick={board.redo}>
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
}
