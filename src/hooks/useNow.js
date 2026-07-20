import { useEffect, useState } from "react";
import { nowMinutes } from "../utils/time";

/** Re-renders every 30s so "current task" / "time remaining" stay accurate. */
export function useNow() {
  const [minutes, setMinutes] = useState(() => nowMinutes());

  useEffect(() => {
    const id = setInterval(() => setMinutes(nowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);

  return minutes;
}
