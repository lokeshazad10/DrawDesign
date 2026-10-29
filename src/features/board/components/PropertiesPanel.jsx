import {
  BringToFront,
  ChevronDown,
  ChevronUp,
  Copy,
  SendToBack,
  Trash2,
} from "lucide-react";
import {
  BACKGROUND_COLORS,
  FONT_SIZES,
  STROKE_COLORS,
} from "../lib/constants.js";

function Segmented({ label, options, value, onChange, className = "" }) {
  return (
    <div
      className={`flex gap-0.5 rounded-[9px] bg-(--surface-2) p-0.5 ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className="grid min-h-7.5 flex-1 place-items-center rounded-[7px] border-0 bg-transparent px-1.5 text-[12px] font-medium whitespace-nowrap hover:bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] aria-pressed:bg-(--surface) aria-pressed:text-(--accent) aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
          aria-pressed={value === o.value}
          title={o.title ?? o.label}
          onClick={() => onChange(o.value)}
        >
          {o.content ?? o.label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ label, colors, value, onChange }) {
  const custom =
    value !== undefined && value !== "transparent" && !colors.includes(value);
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`relative h-6.5 w-6.5 rounded-[7px] border border-[rgba(0,0,0,0.18)] p-0 dark:border-[rgba(255,255,255,0.22)] aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-[var(--accent)]${c === "transparent" ? " swatch-none" : ""}`}
          style={c === "transparent" ? undefined : { background: c }}
          aria-pressed={value === c}
          aria-label={c === "transparent" ? `${label}: none` : `${label}: ${c}`}
          title={c === "transparent" ? "None" : c}
          onClick={() => onChange(c)}
        />
      ))}
      <label
        className={`relative block h-6.5 w-6.5 cursor-pointer rounded-[7px] border border-[rgba(0,0,0,0.18)] dark:border-[rgba(255,255,255,0.22)]${custom ? " outline-2 outline-offset-2 outline-(--accent)" : ""} swatch-custom`}
        style={custom ? { background: value } : undefined}
        title="Custom colour"
      >
        <input
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          type="color"
          aria-label={`${label}: custom colour`}
          value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? value : "#1e1e1e"}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

const bar = (h, dash) => (
  <span
    className="block w-6 rounded-xs bg-current"
    style={{
      height: h,
      borderTopStyle: dash ?? "solid",
      borderTopWidth: h,
      background: dash ? "transparent" : undefined,
    }}
  />
);

export default function PropertiesPanel({ board }) {
  const { tool, selectedIds, elements, style } = board.s;
  const selected = elements.filter((el) => selectedIds.includes(el.id));
  const drawingTool = [
    "rectangle",
    "diamond",
    "ellipse",
    "arrow",
    "line",
    "freedraw",
    "text",
  ].includes(tool);
  if (!selected.length && !drawingTool) return null;

  const types = new Set(selected.length ? selected.map((e) => e.type) : [tool]);
  const hasType = (...list) => list.some((t) => types.has(t));
  const isShape = (e) =>
    e.type === "rectangle" || e.type === "diamond" || e.type === "ellipse";

  // The value shared by the selection (undefined when mixed), or the default style.
  const val = (key, pred = () => true) => {
    if (!selected.length) return style[key];
    const pool = selected.filter(pred);
    if (!pool.length) return style[key];
    return pool.every((e) => e[key] === pool[0][key])
      ? pool[0][key]
      : undefined;
  };

  const set = (patch, key) => board.applyStyle(patch, key);
  const showBackground = hasType("rectangle", "diamond", "ellipse");
  const showStroke = !(types.size === 1 && types.has("text"));
  const showRoughness = hasType(
    "rectangle",
    "diamond",
    "ellipse",
    "line",
    "arrow",
  );
  const showText = hasType("text");
  const bg = val("backgroundColor", isShape);

  return (
    <aside
      className="absolute top-17 left-3 z-9 flex max-h-[calc(100vh-140px)] w-53 flex-col gap-3.5 overflow-y-auto rounded-(--radius) border border-(--border) bg-(--surface) p-3 shadow-(--shadow) max-[720px]:top-auto max-[720px]:right-2 max-[720px]:bottom-16 max-[720px]:left-2 max-[720px]:max-h-[42vh] max-[720px]:w-auto"
      aria-label="Properties"
    >
      <section>
        <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
          {showText && !showStroke ? "Text colour" : "Stroke"}
        </h2>
        <Swatches
          label="Stroke"
          colors={STROKE_COLORS}
          value={val("strokeColor")}
          onChange={(c) => set({ strokeColor: c }, "strokeColor")}
        />
      </section>

      {showBackground && (
        <section>
          <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
            Background
          </h2>
          <Swatches
            label="Background"
            colors={BACKGROUND_COLORS}
            value={bg}
            onChange={(c) => set({ backgroundColor: c }, "backgroundColor")}
          />
          {bg !== "transparent" && (
            <Segmented
              label="Fill"
              className="mt-2"
              value={val("fillStyle", isShape)}
              onChange={(v) => set({ fillStyle: v })}
              options={[
                { value: "hachure", label: "Hatch", title: "Hatch fill" },
                {
                  value: "cross-hatch",
                  label: "Cross",
                  title: "Cross-hatch fill",
                },
                { value: "solid", label: "Solid", title: "Solid fill" },
              ]}
            />
          )}
        </section>
      )}

      {showStroke && (
        <>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Stroke width
            </h2>
            <Segmented
              label="Stroke width"
              value={val("strokeWidth")}
              onChange={(v) => set({ strokeWidth: v })}
              options={[
                { value: 1, title: "Thin", content: bar(1) },
                { value: 2, title: "Regular", content: bar(2) },
                { value: 4, title: "Bold", content: bar(4) },
              ]}
            />
          </section>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Stroke style
            </h2>
            <Segmented
              label="Stroke style"
              value={val("strokeStyle")}
              onChange={(v) => set({ strokeStyle: v })}
              options={[
                { value: "solid", title: "Solid", content: bar(2) },
                { value: "dashed", title: "Dashed", content: bar(2, "dashed") },
                { value: "dotted", title: "Dotted", content: bar(2, "dotted") },
              ]}
            />
          </section>
        </>
      )}

      {showRoughness && (
        <section>
          <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
            Sloppiness
          </h2>
          <Segmented
            label="Sloppiness"
            value={val(
              "roughness",
              (e) => e.type !== "text" && e.type !== "freedraw",
            )}
            onChange={(v) => set({ roughness: v })}
            options={[
              { value: 0, label: "Clean", title: "Architect: clean lines" },
              { value: 1, label: "Loose", title: "Artist: slightly loose" },
              { value: 2, label: "Wild", title: "Cartoonist: very loose" },
            ]}
          />
        </section>
      )}

      {showText && (
        <>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Font
            </h2>
            <Segmented
              label="Font"
              value={val("fontFamily", (e) => e.type === "text")}
              onChange={(v) => set({ fontFamily: v })}
              options={[
                { value: "hand", label: "Hand" },
                { value: "sans", label: "Sans" },
                { value: "mono", label: "Mono" },
              ]}
            />
          </section>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Size
            </h2>
            <Segmented
              label="Font size"
              value={val("fontSize", (e) => e.type === "text")}
              onChange={(v) => set({ fontSize: v })}
              options={FONT_SIZES.map((f) => ({
                value: f.value,
                label: f.label,
                title: `${f.label} (${f.value}px)`,
              }))}
            />
          </section>
        </>
      )}

      <section>
        <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
          Opacity{" "}
          <span>
            {val("opacity") ?? "mixed"}
            {val("opacity") === undefined ? "" : "%"}
          </span>
        </h2>
        <input
          className="w-full accent-(--accent)"
          type="range"
          min="10"
          max="100"
          step="5"
          aria-label="Opacity"
          value={val("opacity") ?? 100}
          onChange={(e) => set({ opacity: Number(e.target.value) }, "opacity")}
        />
      </section>

      {selected.length > 0 && (
        <>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Layers
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 hover:bg-(--surface-2)"
                title="Send to back (Ctrl+Shift+[)"
                aria-label="Send to back"
                onClick={() => board.reorderSelected("back")}
              >
                <SendToBack size={16} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 hover:bg-(--surface-2)"
                title="Send backward (Ctrl+[)"
                aria-label="Send backward"
                onClick={() => board.reorderSelected("backward")}
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 hover:bg-(--surface-2)"
                title="Bring forward (Ctrl+])"
                aria-label="Bring forward"
                onClick={() => board.reorderSelected("forward")}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 hover:bg-(--surface-2)"
                title="Bring to front (Ctrl+Shift+])"
                aria-label="Bring to front"
                onClick={() => board.reorderSelected("front")}
              >
                <BringToFront size={16} />
              </button>
            </div>
          </section>
          <section>
            <h2 className="m-0 mb-1.5 flex justify-between text-[12px] font-medium text-(--muted)">
              Actions
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 hover:bg-(--surface-2)"
                title="Duplicate (Ctrl+D)"
                aria-label="Duplicate"
                onClick={board.duplicate}
              >
                <Copy size={16} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-(--border) bg-transparent p-0 text-(--danger)] hover:bg-(--surface-2)]"
                title="Delete (Del)"
                aria-label="Delete"
                onClick={board.deleteSelected}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
