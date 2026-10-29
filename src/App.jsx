import { useCallback, useEffect, useRef, useState } from 'react';
import BottomBar from './components/BottomBar.jsx';
import Canvas from './components/Canvas.jsx';
import ExportDialog from './components/ExportDialog.jsx';
import HelpDialog from './components/HelpDialog.jsx';
import PropertiesPanel from './components/PropertiesPanel.jsx';
import TextEditor from './components/TextEditor.jsx';
import Toolbar from './components/Toolbar.jsx';
import TopBar from './components/TopBar.jsx';
import { TOOLS } from './lib/constants.js';
import { useBoard } from './state/useBoard.js';

export default function App() {
  const board = useBoard();
  const { theme, elements, editing } = board.s;
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  // Theme: the UI follows data-theme; the canvas is inverted with CSS (see styles.css).
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111418' : '#f4f5f7');
  }, [theme]);

  // Web fonts load late; measure saved text again once they are ready.
  useEffect(() => {
    const families = ['26px Caveat', '26px "Instrument Sans"', '26px "JetBrains Mono"'];
    Promise.all(families.map((f) => document.fonts.load(f)))
      .catch(() => {})
      .then(() => board.remeasureText());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t instanceof HTMLElement) {
        if (t.tagName === 'TEXTAREA' || t.isContentEditable) return;
        if (t.tagName === 'INPUT' && e.key.startsWith('Arrow')) return;
      }
      if (exportOpen || helpOpen) return;

      const S = board.s;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key;
      const lower = key.toLowerCase();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      if (mod) {
        switch (lower) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) board.redo();
            else board.undo();
            return;
          case 'y':
            e.preventDefault();
            board.redo();
            return;
          case 'c':
            if (S.selectedIds.length) {
              e.preventDefault();
              board.copy();
              showToast('Copied');
            }
            return;
          case 'x':
            if (S.selectedIds.length) {
              e.preventDefault();
              board.cut();
            }
            return;
          case 'v':
            if (S.clipboard.length) {
              e.preventDefault();
              board.paste();
            }
            return;
          case 'd':
            e.preventDefault();
            board.duplicate();
            return;
          case 'a':
            e.preventDefault();
            board.setTool('select');
            board.selectAll();
            return;
          case 'e':
            if (e.shiftKey) {
              e.preventDefault();
              setExportOpen(true);
            }
            return;
          case "'":
            e.preventDefault();
            board.toggleGrid();
            return;
          case ']':
          case '}':
            e.preventDefault();
            board.reorderSelected(e.shiftKey ? 'front' : 'forward');
            return;
          case '[':
          case '{':
            e.preventDefault();
            board.reorderSelected(e.shiftKey ? 'back' : 'backward');
            return;
          case '=':
          case '+':
            e.preventDefault();
            board.zoomAt(1.2, cx, cy);
            return;
          case '-':
            e.preventDefault();
            board.zoomAt(1 / 1.2, cx, cy);
            return;
          case '0':
            e.preventDefault();
            board.zoomTo(1, cx, cy);
            return;
          default:
            return;
        }
      }

      if (key === 'Delete' || key === 'Backspace') {
        if (S.selectedIds.length) {
          e.preventDefault();
          board.deleteSelected();
        }
        return;
      }
      if (key === 'Escape') {
        board.select([]);
        board.setTool('select');
        return;
      }
      if (key === 'Enter') {
        const only = S.selectedIds.length === 1 ? S.elements.find((el) => el.id === S.selectedIds[0]) : null;
        if (only?.type === 'text') {
          e.preventDefault();
          board.editText(only);
        }
        return;
      }
      if (key.startsWith('Arrow') && S.selectedIds.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        board.nudge(
          key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0,
          key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0,
        );
        return;
      }
      if (key === '?') {
        setHelpOpen(true);
        return;
      }
      if (e.shiftKey && e.code === 'Digit1') {
        board.fitToContent(window.innerWidth, window.innerHeight);
        return;
      }
      if (e.altKey || e.shiftKey) return;
      if (lower === 'q') {
        board.toggleLock();
        return;
      }
      const tool = TOOLS.find((x) => x.key === lower || (x.num && x.num === key));
      if (tool) board.setTool(tool.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportOpen, helpOpen]);

  const openExport = useCallback(() => setExportOpen(true), []);
  const openHelp = useCallback(() => setHelpOpen(true), []);

  return (
    <div className="app">
      <Canvas board={board} />
      <TextEditor board={board} />

      <TopBar board={board} onExport={openExport} onHelp={openHelp} onToast={showToast} />
      <Toolbar board={board} />
      <PropertiesPanel board={board} />
      <BottomBar board={board} />

      {elements.length === 0 && !editing && (
        <div className="empty-hint">
          <h1>Your board is empty</h1>
          <p>Pick a shape from the toolbar and drag on the canvas. Hold Space and drag to pan. Press ? for shortcuts.</p>
        </div>
      )}

      {exportOpen && <ExportDialog board={board} onClose={() => setExportOpen(false)} onToast={showToast} />}
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}

      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
