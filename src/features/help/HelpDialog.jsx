import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const GROUPS = [
  {
    title: "Tools",
    rows: [
      ["Select", "V or 1"],
      ["Rectangle", "R or 2"],
      ["Diamond", "D or 3"],
      ["Ellipse", "O or 4"],
      ["Arrow", "A or 5"],
      ["Line", "L or 6"],
      ["Draw", "P or 7"],
      ["Text", "T or 8"],
      ["Eraser", "E or 0"],
      ["Hand (pan)", "H or hold Space"],
      ["Keep tool active", "Q"],
    ],
  },
  {
    title: "Canvas",
    rows: [
      ["Pan", "Scroll, or drag with Space"],
      ["Zoom", "Ctrl + scroll, or pinch"],
      ["Zoom to fit", "Shift+1"],
      ["Reset zoom", "Ctrl+0"],
      ["Show grid", "Ctrl+'"],
      ["Export image", "Ctrl+Shift+E"],
    ],
  },
  {
    title: "Editing",
    rows: [
      ["Undo / redo", "Ctrl+Z / Ctrl+Shift+Z"],
      ["Copy, cut, paste", "Ctrl+C / X / V"],
      ["Duplicate", "Ctrl+D"],
      ["Select all", "Ctrl+A"],
      ["Delete", "Delete or Backspace"],
      ["Nudge (×10)", "Arrows (+Shift)"],
      ["Bring forward / back", "Ctrl+] / Ctrl+["],
      ["Edit text", "Enter or double-click"],
      ["Straight lines, squares", "Hold Shift while drawing"],
      ["Add to selection", "Shift+click"],
    ],
  },
];

export default function HelpDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(14,17,22,0.5)] p-4"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[calc(100vh-32px)] w-[min(820px,100%)] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        tabIndex={-1}
        ref={ref}
      >
        <header className="mb-[14px] flex items-center justify-between">
          <h2
            id="help-title"
            className="m-0 font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.01em]"
          >
            Keyboard shortcuts
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 mt-0 text-[13px] font-semibold">{g.title}</h3>
              <dl className="m-0">
                {g.rows.map(([name, keys]) => (
                  <div
                    className="flex justify-between gap-3 border-b border-[var(--border)] py-[5px]"
                    key={name}
                  >
                    <dt className="text-[var(--muted)]">{name}</dt>
                    <dd className="m-0 text-right">
                      <kbd className="rounded-[5px] border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-px">
                        {keys}
                      </kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
