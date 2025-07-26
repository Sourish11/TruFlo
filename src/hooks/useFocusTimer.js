import { useState, useEffect, useRef } from 'react';

export function useFocusTimer(task) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  // Start the timer
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now() - (elapsedTime * 1000)); // Account for any previous elapsed time
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Stop the timer and calculate results
  const stopTimer = () => {
    setIsActive(false);
    
    if (!task) {
      return null;
    }

    const actualMinutes = Math.round(elapsedTime / 60);
    const expectedMinutes = task.estimatedMinutes || task.duration || 25;
    
    // Calculate efficiency (how close to expected time)
    const efficiency = Math.min(100, Math.max(0, 100 - Math.abs(actualMinutes - expectedMinutes) * 5));
    
    // Calculate XP based on task difficulty and efficiency
    const baseXP = task.xp || task.xpReward || 25;
    const efficiencyMultiplier = efficiency / 100;
    const earnedXP = Math.round(baseXP * efficiencyMultiplier);

    const result = {
      actualMinutes,
      expectedMinutes,
      efficiency,
      earnedXP,
      completed: true
    };

    // Reset timer
    setElapsedTime(0);
    setStartTime(null);

    return result;
  };

  // Reset the timer
  const resetTimer = () => {
    setIsActive(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  // Update elapsed time when timer is active
  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage if task has expected duration
  const getProgress = () => {
    if (!task || !task.estimatedMinutes) return 0;
    const expectedSeconds = task.estimatedMinutes * 60;
    return Math.min(100, (elapsedTime / expectedSeconds) * 100);
  };

  return {
    isActive,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    progress: getProgress(),
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  };
}