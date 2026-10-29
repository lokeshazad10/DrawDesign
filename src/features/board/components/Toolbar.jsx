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
} from "lucide-react";
import { TOOLS } from "../lib/constants.js";

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
    <nav
      className="absolute left-1/2 top-3 z-10 flex max-w-[calc(100vw-16px)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-(--radius) border border-(--border) bg-(--surface) p-1 shadow-(--shadow) scrollbar-width:none [&::-webkit-scrollbar]:hidden max-[720px]:bottom-2.5 max-[720px]:top-auto"
      aria-label="Drawing tools"
    >
      <button
        type="button"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-transparent p-0 text-(--text) hover:bg-(--surface-2) aria-pressed:bg-(--accent) aria-pressed:text-(--accent-ink)"
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
      <span
        className="my-1 mx-1 w-px self-stretch bg-(--border)"
        aria-hidden="true"
      />
      {TOOLS.map((t) => {
        const Icon = ICONS[t.id];
        const hint = t.num
          ? `${t.key.toUpperCase()} or ${t.num}`
          : t.key.toUpperCase();
        return (
          <button
            key={t.id}
            type="button"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-transparent p-0 text-(--text) hover:bg-(--surface-2) aria-pressed:bg-(--accent) aria-pressed:text-(--accent-ink)"
            aria-pressed={tool === t.id}
            title={`${t.label} (${hint})`}
            aria-label={t.label}
            onClick={(e) => {
              board.setTool(t.id);
              releaseFocus(e);
            }}
          >
            <Icon size={18} />
            <kbd
              className="absolute right-0.75 bottom-px text-[9px] leading-none opacity-[0.55]"
              aria-hidden="true"
            >
              {t.num || t.key.toUpperCase()}
            </kbd>
          </button>
        );
      })}
    </nav>
  );
}
