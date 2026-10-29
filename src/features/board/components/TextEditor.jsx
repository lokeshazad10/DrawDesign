import { useEffect, useRef, useState } from "react";
import { FONTS } from "../lib/constants.js";
import { LINE_HEIGHT, measureText } from "../lib/elements.js";

// A textarea laid over the canvas at the text element's position and zoom.
function Editor({ board, editing }) {
  const { view } = board.s;
  const ref = useRef(null);
  const done = useRef(false);
  const [value, setValue] = useState(editing.text);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    board.finishEditing(ref.current ? ref.current.value : value);
  };

  const { width, height } = measureText(
    value || " ",
    editing.fontSize,
    editing.fontFamily,
  );
  const lines = Math.max(1, value.split("\n").length);

  return (
    <textarea
      ref={ref}
      className="absolute z-5 m-0 resize-none overflow-hidden whitespace-pre border-0 bg-transparent p-0 outline-[1.5px] outline-dashed outline-offset-[3px] outline-(--accent)] dark:filter-[invert(93%)_hue-rotate(180deg)]"
      value={value}
      rows={lines}
      spellCheck={false}
      aria-label="Text"
      onChange={(e) => setValue(e.target.value)}
      onBlur={finish}
      onKeyDown={(e) => {
        if (
          e.key === "Escape" ||
          ((e.ctrlKey || e.metaKey) && e.key === "Enter")
        ) {
          e.preventDefault();
          finish();
        }
        e.stopPropagation();
      }}
      style={{
        left: editing.x * view.zoom + view.x,
        top: editing.y * view.zoom + view.y,
        width: (width + 12) * view.zoom,
        height: Math.max(height, editing.fontSize * LINE_HEIGHT) * view.zoom,
        fontSize: editing.fontSize * view.zoom,
        lineHeight: LINE_HEIGHT,
        fontFamily: FONTS[editing.fontFamily] ?? FONTS.hand,
        color: editing.strokeColor,
        opacity: editing.opacity / 100,
      }}
    />
  );
}

export default function TextEditor({ board }) {
  const { editing } = board.s;
  if (!editing) return null;
  return (
    <Editor
      key={`${editing.id}:${editing.x}:${editing.y}`}
      board={board}
      editing={editing}
    />
  );
}
