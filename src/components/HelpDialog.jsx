import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const GROUPS = [
  {
    title: 'Tools',
    rows: [
      ['Select', 'V or 1'],
      ['Rectangle', 'R or 2'],
      ['Diamond', 'D or 3'],
      ['Ellipse', 'O or 4'],
      ['Arrow', 'A or 5'],
      ['Line', 'L or 6'],
      ['Draw', 'P or 7'],
      ['Text', 'T or 8'],
      ['Eraser', 'E or 0'],
      ['Hand (pan)', 'H or hold Space'],
      ['Keep tool active', 'Q'],
    ],
  },
  {
    title: 'Canvas',
    rows: [
      ['Pan', 'Scroll, or drag with Space'],
      ['Zoom', 'Ctrl + scroll, or pinch'],
      ['Zoom to fit', 'Shift+1'],
      ['Reset zoom', 'Ctrl+0'],
      ['Show grid', "Ctrl+'"],
      ['Export image', 'Ctrl+Shift+E'],
    ],
  },
  {
    title: 'Editing',
    rows: [
      ['Undo / redo', 'Ctrl+Z / Ctrl+Shift+Z'],
      ['Copy, cut, paste', 'Ctrl+C / X / V'],
      ['Duplicate', 'Ctrl+D'],
      ['Select all', 'Ctrl+A'],
      ['Delete', 'Delete or Backspace'],
      ['Nudge (×10)', 'Arrows (+Shift)'],
      ['Bring forward / back', 'Ctrl+] / Ctrl+['],
      ['Edit text', 'Enter or double-click'],
      ['Straight lines, squares', 'Hold Shift while drawing'],
      ['Add to selection', 'Shift+click'],
    ],
  },
];

export default function HelpDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog wide" role="dialog" aria-modal="true" aria-labelledby="help-title" tabIndex={-1} ref={ref}>
        <header>
          <h2 id="help-title">Keyboard shortcuts</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="shortcut-grid">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              <dl>
                {g.rows.map(([name, keys]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>
                      <kbd>{keys}</kbd>
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
