import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(duration = 2400) {
  const [message, setMessage] = useState("");
  const timer = useRef(0);

  const showToast = useCallback(
    (nextMessage) => {
      setMessage(nextMessage);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(""), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [message, showToast];
}
