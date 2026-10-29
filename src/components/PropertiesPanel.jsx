import { BringToFront, ChevronDown, ChevronUp, Copy, SendToBack, Trash2 } from 'lucide-react';
import { BACKGROUND_COLORS, FONT_SIZES, STROKE_COLORS } from '../lib/constants.js';

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className="seg"
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
  const custom = value !== undefined && value !== 'transparent' && !colors.includes(value);
  return (
    <div className="swatches" role="group" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`swatch${c === 'transparent' ? ' swatch-none' : ''}`}
          style={c === 'transparent' ? undefined : { background: c }}
          aria-pressed={value === c}
          aria-label={c === 'transparent' ? `${label}: none` : `${label}: ${c}`}
          title={c === 'transparent' ? 'None' : c}
          onClick={() => onChange(c)}
        />
      ))}
      <label
        className={`swatch swatch-custom${custom ? ' is-custom' : ''}`}
        style={custom ? { background: value } : undefined}
        title="Custom colour"
      >
        <input
          type="color"
          aria-label={`${label}: custom colour`}
          value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#1e1e1e'}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

const bar = (h, dash) => (
  <span
    className="stroke-bar"
    style={{ height: h, borderTopStyle: dash ?? 'solid', borderTopWidth: h, background: dash ? 'transparent' : undefined }}
  />
);

export default function PropertiesPanel({ board }) {
  const { tool, selectedIds, elements, style } = board.s;
  const selected = elements.filter((el) => selectedIds.includes(el.id));
  const drawingTool = ['rectangle', 'diamond', 'ellipse', 'arrow', 'line', 'freedraw', 'text'].includes(tool);
  if (!selected.length && !drawingTool) return null;

  const types = new Set(selected.length ? selected.map((e) => e.type) : [tool]);
  const hasType = (...list) => list.some((t) => types.has(t));
  const isShape = (e) => e.type === 'rectangle' || e.type === 'diamond' || e.type === 'ellipse';

  // The value shared by the selection (undefined when mixed), or the default style.
  const val = (key, pred = () => true) => {
    if (!selected.length) return style[key];
    const pool = selected.filter(pred);
    if (!pool.length) return style[key];
    return pool.every((e) => e[key] === pool[0][key]) ? pool[0][key] : undefined;
  };

  const set = (patch, key) => board.applyStyle(patch, key);
  const showBackground = hasType('rectangle', 'diamond', 'ellipse');
  const showStroke = !(types.size === 1 && types.has('text'));
  const showRoughness = hasType('rectangle', 'diamond', 'ellipse', 'line', 'arrow');
  const showText = hasType('text');
  const bg = val('backgroundColor', isShape);

  return (
    <aside className="panel" aria-label="Properties">
      <section>
        <h2>{showText && !showStroke ? 'Text colour' : 'Stroke'}</h2>
        <Swatches label="Stroke" colors={STROKE_COLORS} value={val('strokeColor')} onChange={(c) => set({ strokeColor: c }, 'strokeColor')} />
      </section>

      {showBackground && (
        <section>
          <h2>Background</h2>
          <Swatches label="Background" colors={BACKGROUND_COLORS} value={bg} onChange={(c) => set({ backgroundColor: c }, 'backgroundColor')} />
          {bg !== 'transparent' && (
            <Segmented
              label="Fill"
              value={val('fillStyle', isShape)}
              onChange={(v) => set({ fillStyle: v })}
              options={[
                { value: 'hachure', label: 'Hatch', title: 'Hatch fill' },
                { value: 'cross-hatch', label: 'Cross', title: 'Cross-hatch fill' },
                { value: 'solid', label: 'Solid', title: 'Solid fill' },
              ]}
            />
          )}
        </section>
      )}

      {showStroke && (
        <>
          <section>
            <h2>Stroke width</h2>
            <Segmented
              label="Stroke width"
              value={val('strokeWidth')}
              onChange={(v) => set({ strokeWidth: v })}
              options={[
                { value: 1, title: 'Thin', content: bar(1) },
                { value: 2, title: 'Regular', content: bar(2) },
                { value: 4, title: 'Bold', content: bar(4) },
              ]}
            />
          </section>
          <section>
            <h2>Stroke style</h2>
            <Segmented
              label="Stroke style"
              value={val('strokeStyle')}
              onChange={(v) => set({ strokeStyle: v })}
              options={[
                { value: 'solid', title: 'Solid', content: bar(2) },
                { value: 'dashed', title: 'Dashed', content: bar(2, 'dashed') },
                { value: 'dotted', title: 'Dotted', content: bar(2, 'dotted') },
              ]}
            />
          </section>
        </>
      )}

      {showRoughness && (
        <section>
          <h2>Sloppiness</h2>
          <Segmented
            label="Sloppiness"
            value={val('roughness', (e) => e.type !== 'text' && e.type !== 'freedraw')}
            onChange={(v) => set({ roughness: v })}
            options={[
              { value: 0, label: 'Clean', title: 'Architect: clean lines' },
              { value: 1, label: 'Loose', title: 'Artist: slightly loose' },
              { value: 2, label: 'Wild', title: 'Cartoonist: very loose' },
            ]}
          />
        </section>
      )}

      {showText && (
        <>
          <section>
            <h2>Font</h2>
            <Segmented
              label="Font"
              value={val('fontFamily', (e) => e.type === 'text')}
              onChange={(v) => set({ fontFamily: v })}
              options={[
                { value: 'hand', label: 'Hand' },
                { value: 'sans', label: 'Sans' },
                { value: 'mono', label: 'Mono' },
              ]}
            />
          </section>
          <section>
            <h2>Size</h2>
            <Segmented
              label="Font size"
              value={val('fontSize', (e) => e.type === 'text')}
              onChange={(v) => set({ fontSize: v })}
              options={FONT_SIZES.map((f) => ({ value: f.value, label: f.label, title: `${f.label} (${f.value}px)` }))}
            />
          </section>
        </>
      )}

      <section>
        <h2>
          Opacity <span className="muted">{val('opacity') ?? 'mixed'}{val('opacity') === undefined ? '' : '%'}</span>
        </h2>
        <input
          className="range"
          type="range"
          min="10"
          max="100"
          step="5"
          aria-label="Opacity"
          value={val('opacity') ?? 100}
          onChange={(e) => set({ opacity: Number(e.target.value) }, 'opacity')}
        />
      </section>

      {selected.length > 0 && (
        <>
          <section>
            <h2>Layers</h2>
            <div className="btn-row">
              <button type="button" className="icon-btn" title="Send to back (Ctrl+Shift+[)" aria-label="Send to back" onClick={() => board.reorderSelected('back')}>
                <SendToBack size={16} />
              </button>
              <button type="button" className="icon-btn" title="Send backward (Ctrl+[)" aria-label="Send backward" onClick={() => board.reorderSelected('backward')}>
                <ChevronDown size={16} />
              </button>
              <button type="button" className="icon-btn" title="Bring forward (Ctrl+])" aria-label="Bring forward" onClick={() => board.reorderSelected('forward')}>
                <ChevronUp size={16} />
              </button>
              <button type="button" className="icon-btn" title="Bring to front (Ctrl+Shift+])" aria-label="Bring to front" onClick={() => board.reorderSelected('front')}>
                <BringToFront size={16} />
              </button>
            </div>
          </section>
          <section>
            <h2>Actions</h2>
            <div className="btn-row">
              <button type="button" className="icon-btn" title="Duplicate (Ctrl+D)" aria-label="Duplicate" onClick={board.duplicate}>
                <Copy size={16} />
              </button>
              <button type="button" className="icon-btn danger" title="Delete (Del)" aria-label="Delete" onClick={board.deleteSelected}>
                <Trash2 size={16} />
              </button>
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
