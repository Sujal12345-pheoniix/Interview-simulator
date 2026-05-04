"use client";

import { useEffect, useState } from "react";

type Point = {
  x: number;
  y: number;
};

export default function CameraProctor() {
  const [trackingPoints, setTrackingPoints] = useState<Point[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let animationId: any;

    const updateTracking = () => {
      const newPoints: Point[] = [];

      // Simulated tracking points
      for (let i = 0; i < 12; i++) {
        newPoints.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }

      setTrackingPoints(newPoints);

      animationId = setTimeout(() => {
        requestAnimationFrame(updateTracking);
      }, 1000);
    };

    updateTracking();

    return () => {
      clearTimeout(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden border border-white/10">
      
      {/* Tracking Points */}
      {!isMinimized &&
        trackingPoints.map((pt, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full transition-all duration-300"
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
            }}
          />
        ))}

      {/* Status HUD */}
      {!isMinimized && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white">
            Posture Analysis: Active
          </div>
          <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white">
            Eye Tracking: Engaged
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-2 py-1 text-xs bg-black/60 hover:bg-black/80 text-white rounded border border-white/10 transition"
        >
          {isMinimized ? "Expand" : "Minimize"}
        </button>
      </div>

      {/* Scan Line Animation */}
      {!isMinimized && (
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 animate-scan" />
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        .animate-scan {
          position: absolute;
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
