import { useState, useRef, useCallback } from "react";

export function useFocusTimer(task) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    if (!task) return;

    startTimeRef.current = performance.now();
    setIsActive(true);
    setTimeElapsed(0);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (performance.now() - startTimeRef.current) / 1000,
        );
        setTimeElapsed(elapsed);
      }
    }, 1000);
  }, [task]);

  const stopTimer = useCallback(() => {
    if (!isActive || !startTimeRef.current || !task) return null;

    const actualMs = performance.now() - startTimeRef.current;
    const expectedMs = task.estimatedMinutes * 60 * 1000;

    // Calculate XP: full XP if completed within expected time,
    // partial XP if it took longer (but minimum 50% XP)
    const timeRatio = Math.min(1, expectedMs / actualMs);
    const earnedXp = Math.max(
      Math.floor(task.xp * 0.5),
      Math.floor(task.xp * timeRatio),
    );

    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const result = {
      actualMs,
      actualMinutes: Math.floor(actualMs / 60000),
      expectedMinutes: task.estimatedMinutes,
      earnedXp,
      efficiency: timeRatio,
      task: task,
    };

    startTimeRef.current = null;
    setTimeElapsed(0);

    return result;
  }, [isActive, task]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setTimeElapsed(0);
    startTimeRef.current = null;
  }, []);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    isActive,
    timeElapsed,
    formattedTime: formatTime(timeElapsed),
    startTimer,
    stopTimer,
    pauseTimer,
    resetTimer,
    progress: task
      ? Math.min(100, (timeElapsed / (task.estimatedMinutes * 60)) * 100)
      : 0,
  };
}
