import { useEffect, useRef } from "react";
import { TOOLS } from "../../features/board/lib/constants.js";

export function useGlobalShortcuts(
  board,
  { isDialogOpen, onExport, onHelp, onToast },
) {
  const boardRef = useRef(board);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        if (target.tagName === "TEXTAREA" || target.isContentEditable) return;
        if (target.tagName === "INPUT" && e.key.startsWith("Arrow")) return;
      }
      if (isDialogOpen) return;

      const currentBoard = boardRef.current;
      const state = currentBoard.s;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key;
      const lower = key.toLowerCase();
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      if (mod) {
        switch (lower) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) currentBoard.redo();
            else currentBoard.undo();
            return;
          case "y":
            e.preventDefault();
            currentBoard.redo();
            return;
          case "c":
            if (state.selectedIds.length) {
              e.preventDefault();
              currentBoard.copy();
              onToast("Copied");
            }
            return;
          case "x":
            if (state.selectedIds.length) {
              e.preventDefault();
              currentBoard.cut();
            }
            return;
          case "v":
            if (state.clipboard.length) {
              e.preventDefault();
              currentBoard.paste();
            }
            return;
          case "d":
            e.preventDefault();
            currentBoard.duplicate();
            return;
          case "a":
            e.preventDefault();
            currentBoard.setTool("select");
            currentBoard.selectAll();
            return;
          case "e":
            if (e.shiftKey) {
              e.preventDefault();
              onExport();
            }
            return;
          case "'":
            e.preventDefault();
            currentBoard.toggleGrid();
            return;
          case "]":
          case "}":
            e.preventDefault();
            currentBoard.reorderSelected(e.shiftKey ? "front" : "forward");
            return;
          case "[":
          case "{":
            e.preventDefault();
            currentBoard.reorderSelected(e.shiftKey ? "back" : "backward");
            return;
          case "=":
          case "+":
            e.preventDefault();
            currentBoard.zoomAt(1.2, cx, cy);
            return;
          case "-":
            e.preventDefault();
            currentBoard.zoomAt(1 / 1.2, cx, cy);
            return;
          case "0":
            e.preventDefault();
            currentBoard.zoomTo(1, cx, cy);
            return;
          default:
            return;
        }
      }

      if (key === "Delete" || key === "Backspace") {
        if (state.selectedIds.length) {
          e.preventDefault();
          currentBoard.deleteSelected();
        }
        return;
      }
      if (key === "Escape") {
        currentBoard.select([]);
        currentBoard.setTool("select");
        return;
      }
      if (key === "Enter") {
        const only =
          state.selectedIds.length === 1
            ? state.elements.find((el) => el.id === state.selectedIds[0])
            : null;
        if (only?.type === "text") {
          e.preventDefault();
          currentBoard.editText(only);
        }
        return;
      }
      if (key.startsWith("Arrow") && state.selectedIds.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        currentBoard.nudge(
          key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0,
          key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0,
        );
        return;
      }
      if (key === "?") {
        onHelp();
        return;
      }
      if (e.shiftKey && e.code === "Digit1") {
        currentBoard.fitToContent(window.innerWidth, window.innerHeight);
        return;
      }
      if (e.altKey || e.shiftKey) return;
      if (lower === "q") {
        currentBoard.toggleLock();
        return;
      }
      const tool = TOOLS.find(
        (item) => item.key === lower || (item.num && item.num === key),
      );
      if (tool) currentBoard.setTool(tool.id);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDialogOpen, onExport, onHelp, onToast]);
}
