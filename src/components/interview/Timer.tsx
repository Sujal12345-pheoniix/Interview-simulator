"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  className?: string;
}

export function Timer({ initialSeconds, onTimeUp, className = "" }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onTimeUp]);

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const isUrgent = secondsLeft < 60;

  return (
    <div
      className={`flex items-center space-x-2 font-mono text-sm sm:text-base px-3 py-1.5 rounded-md border ${
        isUrgent
          ? "border-red-500/50 bg-red-500/10 text-red-500 animate-pulse"
          : "border-gray-800 bg-gray-900/50 text-gray-300"
      } ${className}`}
    >
      <Clock size={16} />
      <span>{formatTime(secondsLeft)}</span>
    </div>
  );
}
