import BottomBar from "./BottomBar.jsx";
import Canvas from "./Canvas.jsx";
import PropertiesPanel from "./PropertiesPanel.jsx";
import TextEditor from "./TextEditor.jsx";
import Toolbar from "./Toolbar.jsx";
import TopBar from "./TopBar.jsx";

export default function BoardWorkspace({ board, onExport, onHelp, onToast }) {
  const { elements, editing } = board.s;

  return (
    <main className="fixed inset-0">
      <Canvas board={board} />
      <TextEditor board={board} />

      <TopBar
        board={board}
        onExport={onExport}
        onHelp={onHelp}
        onToast={onToast}
      />
      <Toolbar board={board} />
      <PropertiesPanel board={board} />
      <BottomBar board={board} />

      {elements.length === 0 && !editing && (
        <div className="pointer-events-none absolute left-1/2 top-[46%] max-w-85 -translate-x-1/2 -translate-y-1/2 text-center text-(--muted)">
          <h1 className="mb-1.5 mt-0 font-(family-name:--font-display) text-[22px] font-bold text-(--text) opacity-[0.85]">
            Your board is empty
          </h1>
          <p className="m-0 text-[14px]">
            Pick a shape from the toolbar and drag on the canvas. Hold Space and
            drag to pan. Press ? for shortcuts.
          </p>
        </div>
      )}
    </main>
  );
}
