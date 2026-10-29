import { Maximize, Minus, Plus, Redo2, Undo2 } from "lucide-react";

export default function BottomBar({ board }) {
  const { view, past, future } = board.s;
  const cx = () => window.innerWidth / 2;
  const cy = () => window.innerHeight / 2;

  return (
    <div className="absolute bottom-3 left-3 z-10 flex gap-2 max-[720px]:top-16 max-[720px]:right-3 max-[720px]:bottom-auto max-[720px]:left-auto">
      <div
        className="flex items-center gap-0.5 rounded-(--radius) border border-(--border) bg-(--surface) p-1 shadow-(--shadow) max-[720px]:hidden"
        role="group"
        aria-label="Zoom"
      >
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-(--surface-2)"
          aria-label="Zoom out"
          title="Zoom out (Ctrl+-)"
          onClick={() => board.zoomAt(1 / 1.2, cx(), cy())}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          className="h-8 min-w-13 rounded-lg border-0 bg-transparent font-medium tabular-nums hover:bg-(--surface-2)"
          title="Reset zoom to 100% (Ctrl+0)"
          onClick={() => board.zoomTo(1, cx(), cy())}
        >
          {Math.round(view.zoom * 100)}%
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-(--surface-2)"
          aria-label="Zoom in"
          title="Zoom in (Ctrl++)"
          onClick={() => board.zoomAt(1.2, cx(), cy())}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-(--surface-2)"
          aria-label="Zoom to fit"
          title="Zoom to fit (Shift+1)"
          onClick={() =>
            board.fitToContent(window.innerWidth, window.innerHeight)
          }
        >
          <Maximize size={16} />
        </button>
      </div>
      <div
        className="flex items-center gap-0.5 rounded-(--radius) border border-(--border) bg-(--surface) p-1 shadow-(--shadow)"
        role="group"
        aria-label="History"
      >
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-(--surface-2) disabled:cursor-not-allowed disabled:opacity-[0.45]"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
          disabled={!past.length}
          onClick={board.undo}
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent p-0 hover:bg-(--surface-2) disabled:cursor-not-allowed disabled:opacity-[0.45]"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!future.length}
          onClick={board.redo}
        >
          <Redo2 size={16} />
        </button>
      </div>
    </div>
  );
}
