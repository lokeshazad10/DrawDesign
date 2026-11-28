import { useCallback, useEffect, useState } from "react";
import BoardWorkspace from "../features/board/components/BoardWorkspace.jsx";
import ExportDialog from "../features/export/ExportDialog.jsx";
import HelpDialog from "../features/help/HelpDialog.jsx";
import { Toast } from "../shared/ui/Toast.jsx";
import { useToast } from "../shared/hooks/useToast.js";
import { useLoadBoardFonts } from "./hooks/useLoadBoardFonts.js";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts.js";
import { useSyncTheme } from "./hooks/useSyncTheme.js";
import { useBoard } from "../features/board/model/useBoard.js";

const boardBodyClasses = [
  "overflow-hidden",
  "overscroll-none",
  "bg-(--bg)",
  "text-(--text)",
  "font-(family-name:--font-ui)",
  "text-[13px]",
  "leading-[1.4]",
];

export default function App() {
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, showToast] = useToast();
  const board = useBoard({ onError: showToast });
  const { theme } = board.s;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Free Online Whiteboard & Diagram Maker | DrawDesign";
    document.body.classList.add(...boardBodyClasses);
    return () => {
      document.title = previousTitle;
      document.body.classList.remove(...boardBodyClasses);
    };
  }, []);

  const openExport = useCallback(() => setExportOpen(true), []);
  const openHelp = useCallback(() => setHelpOpen(true), []);

  useSyncTheme(theme);
  useLoadBoardFonts(board.remeasureText);
  useGlobalShortcuts(board, {
    isDialogOpen: exportOpen || helpOpen,
    onExport: openExport,
    onHelp: openHelp,
    onToast: showToast,
  });

  return (
    <>
      <BoardWorkspace
        board={board}
        onExport={openExport}
        onHelp={openHelp}
        onToast={showToast}
      />
      {exportOpen && (
        <ExportDialog
          board={board}
          onClose={() => setExportOpen(false)}
          onToast={showToast}
        />
      )}
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
      <Toast message={toast} />
    </>
  );
}
