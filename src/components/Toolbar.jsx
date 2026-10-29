import {
  ArrowUpRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Lock,
  LockOpen,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from 'lucide-react';
import { TOOLS } from '../lib/constants.js';

const ICONS = {
  select: MousePointer2,
  hand: Hand,
  rectangle: Square,
  diamond: Diamond,
  ellipse: Circle,
  arrow: ArrowUpRight,
  line: Minus,
  freedraw: Pencil,
  text: Type,
  eraser: Eraser,
};

// Mouse clicks leave focus on the button, which would swallow Space (pan). Keyboard use keeps focus.
const releaseFocus = (e) => {
  if (e.detail) e.currentTarget.blur();
};

export default function Toolbar({ board }) {
  const { tool, toolLock } = board.s;
  return (
    <nav className="toolbar" aria-label="Drawing tools">
      <button
        type="button"
        className="tool"
        aria-pressed={toolLock}
        title="Keep tool active after drawing (Q)"
        aria-label="Keep tool active after drawing"
        onClick={(e) => {
          board.toggleLock();
          releaseFocus(e);
        }}
      >
        {toolLock ? <Lock size={18} /> : <LockOpen size={18} />}
      </button>
      <span className="toolbar-sep" aria-hidden="true" />
      {TOOLS.map((t) => {
        const Icon = ICONS[t.id];
        const hint = t.num ? `${t.key.toUpperCase()} or ${t.num}` : t.key.toUpperCase();
        return (
          <button
            key={t.id}
            type="button"
            className="tool"
            aria-pressed={tool === t.id}
            title={`${t.label} (${hint})`}
            aria-label={t.label}
            onClick={(e) => {
              board.setTool(t.id);
              releaseFocus(e);
            }}
          >
            <Icon size={18} />
            <kbd aria-hidden="true">{t.num || t.key.toUpperCase()}</kbd>
          </button>
        );
      })}
    </nav>
  );
}
