import { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import { downloadBlob, readFileText, stamp } from '../lib/files.js';
import { serializeScene } from '../state/useBoard.js';

export default function TopBar({ board, onExport, onHelp, onToast }) {
  const { theme, grid } = board.s;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !rootRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  const saveFile = () => {
    const blob = new Blob([JSON.stringify(serializeScene(board.s), null, 2)], { type: 'application/json' });
    downloadBlob(blob, `inkboard-${stamp()}.json`);
    onToast('Saved board to file');
  };

  const openFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      board.loadScene(JSON.parse(await readFileText(file)));
      board.fitToContent(window.innerWidth, window.innerHeight);
      onToast(`Opened ${file.name}`);
    } catch {
      onToast('That file is not an Inkboard board');
    }
  };

  const clear = () => {
    if (!board.s.elements.length) return;
    if (window.confirm('Clear the whole board? You can undo this with Ctrl+Z.')) {
      board.clearScene();
      onToast('Board cleared');
    }
  };

  return (
    <>
      <div className="topbar-left" ref={rootRef}>
        <button
          type="button"
          className="menu-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Menu size={18} />
          <span className="wordmark">Inkboard</span>
        </button>
        {open && (
          <div className="menu" role="menu">
            <button type="button" role="menuitem" onClick={run(() => fileRef.current?.click())}>
              <FolderOpen size={16} /> Open board…
            </button>
            <button type="button" role="menuitem" onClick={run(saveFile)}>
              <Save size={16} /> Save board to file
            </button>
            <button type="button" role="menuitem" onClick={run(onExport)}>
              <ImageDown size={16} /> Export image… <kbd>Ctrl+Shift+E</kbd>
            </button>
            <hr />
            <button type="button" role="menuitem" onClick={run(() => board.fitToContent(window.innerWidth, window.innerHeight))}>
              <Maximize size={16} /> Zoom to fit <kbd>Shift+1</kbd>
            </button>
            <button type="button" role="menuitem" aria-checked={grid} onClick={run(board.toggleGrid)}>
              <Grid3x3 size={16} /> {grid ? 'Hide grid' : 'Show grid'} <kbd>Ctrl+'</kbd>
            </button>
            <button type="button" role="menuitem" onClick={run(board.toggleTheme)}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
            <hr />
            <button type="button" role="menuitem" onClick={run(onHelp)}>
              <Keyboard size={16} /> Keyboard shortcuts <kbd>?</kbd>
            </button>
            <button type="button" role="menuitem" className="danger" onClick={run(clear)}>
              <Trash2 size={16} /> Clear board
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={openFile} />
      </div>

      <div className="topbar-right">
        <button type="button" className="primary-btn" onClick={onExport}>
          <ImageDown size={16} /> Export
        </button>
      </div>
    </>
  );
}
