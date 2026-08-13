import { useEffect, useState } from "react";

export function useTaskFade(
  taskId: string,
  fadeEnabled: boolean,
  onFadeComplete?: (taskId: string) => void,
): boolean {
  const [fading, setFading] = useState(false);

  if (!fadeEnabled && fading) {
    setFading(false);
  }

  useEffect(() => {
    if (!fadeEnabled || !onFadeComplete) return;
    const hideAt = window.setTimeout(() => setFading(true), 4000);
    const removeAt = window.setTimeout(() => onFadeComplete(taskId), 4700);
    return () => {
      window.clearTimeout(hideAt);
      window.clearTimeout(removeAt);
    };
  }, [fadeEnabled, onFadeComplete, taskId]);

  return fading;
}