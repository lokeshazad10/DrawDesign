export function Toast({ message }) {
  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-[10px] bg-(--text) px-3.5 py-2.25 font-medium text-(--bg) transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none max-[720px]:bottom-30 ${
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
