import { useEffect, useRef, useState } from "react";
import {
  FolderOpen,
  Grid3x3,
  ImageDown,
  Keyboard,
  Maximize,
  Menu,
  Moon,
  Save,
  Sun,
  Trash2,
} from "lucide-react";
import {
  downloadBlob,
  readFileText,
  stamp,
} from "../../../shared/lib/files.js";
import { serializeScene } from "../model/useBoard.js";

export default function TopBar({ board, onExport, onHelp, onToast }) {
  const { theme, grid } = board.s;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (
        e.type === "keydown"
          ? e.key === "Escape"
          : !rootRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  const openFilePicker = () => {
    setOpen(false);
    fileRef.current?.click();
  };

  const saveFile = () => {
    const blob = new Blob([JSON.stringify(serializeScene(board.s), null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `drawdesign-${stamp()}.json`);
    onToast("Saved board to file");
  };

  const openFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      board.loadScene(JSON.parse(await readFileText(file)));
      board.fitToContent(window.innerWidth, window.innerHeight);
      onToast(`Opened ${file.name}`);
    } catch {
      onToast("That file is not a DrawDesign board");
    }
  };

  const clear = () => {
    if (!board.s.elements.length) return;
    if (
      window.confirm("Clear the whole board? You can undo this with Ctrl+Z.")
    ) {
      board.clearScene();
      onToast("Board cleared");
    }
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-11" ref={rootRef}>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-(--radius) border border-(--border) bg-(--surface) px-3 pr-3.5 shadow-(--shadow) hover:bg-(--surface-2) max-[720px]:px-3"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={18} />
          <span className="font-(family-name:--font-display) text-[16px] font-bold tracking-[-0.01em] max-[720px]:hidden">
            DrawDesign
          </span>
        </button>
        {open && (
          <div
            className="absolute top-[52px] left-0 min-w-[250px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow)]"
            role="menu"
          >
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={openFilePicker}
            >
              <FolderOpen size={16} /> Open board…
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={run(saveFile)}
            >
              <Save size={16} /> Save board to file
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={run(onExport)}
            >
              <ImageDown size={16} /> Export image…{" "}
              <kbd className="ml-auto text-[var(--muted)]">Ctrl+Shift+E</kbd>
            </button>
            <hr className="my-1.5 mx-1 border-0 border-t border-[var(--border)]" />
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={run(() =>
                board.fitToContent(window.innerWidth, window.innerHeight),
              )}
            >
              <Maximize size={16} /> Zoom to fit{" "}
              <kbd className="ml-auto text-[var(--muted)]">Shift+1</kbd>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              aria-checked={grid}
              onClick={run(board.toggleGrid)}
            >
              <Grid3x3 size={16} /> {grid ? "Hide grid" : "Show grid"}{" "}
              <kbd className="ml-auto text-[var(--muted)]">Ctrl+'</kbd>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={run(board.toggleTheme)}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{" "}
              {theme === "dark" ? "Light theme" : "Dark theme"}
            </button>
            <hr className="my-1.5 mx-1 border-0 border-t border-[var(--border)]" />
            <button
              type="button"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left hover:bg-[var(--surface-2)]"
              role="menuitem"
              onClick={run(onHelp)}
            >
              <Keyboard size={16} /> Keyboard shortcuts{" "}
              <kbd className="ml-auto text-[var(--muted)]">?</kbd>
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-[10px] rounded-lg border-0 bg-transparent px-[10px] py-2 text-left text-[var(--danger)] hover:bg-[var(--surface-2)]"
              onClick={run(clear)}
            >
              <Trash2 size={16} /> Clear board
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={openFile}
        />
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[var(--accent)] px-4 font-semibold text-[var(--accent-ink)] shadow-[var(--shadow)] enabled:hover:brightness-[1.08]"
          onClick={onExport}
        >
          <ImageDown size={16} /> Export
        </button>
      </div>
    </>
  );
}
