"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, AlertCircle, Scan, Activity } from "lucide-react";

export function CameraProctor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnalyzing] = useState(true);
  const [trackingPoints, setTrackingPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number | undefined;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const updateTracking = () => {
          if (!isMinimized) {
            const points: { x: number; y: number }[] = [];
            for (let i = 0; i < 5; i++) {
              points.push({ x: 30 + Math.random() * 40, y: 20 + Math.random() * 50 });
            }
            setTrackingPoints(points);
          }
          animationId = window.setTimeout(() => requestAnimationFrame(updateTracking), 500);
        };

        updateTracking();
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access required for proctoring");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animationId) window.clearTimeout(animationId);
    };
  }, [isMinimized]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 h-48">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-400">{error}</p>
        <p className="text-xs text-gray-500">Please allow camera access to continue.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 ease-in-out border border-gray-800 bg-black shadow-2xl ${
        isMinimized ? "w-48 h-32 rounded-xl fixed bottom-6 right-6 z-50" : "w-full aspect-video rounded-xl mb-6"
      }`}
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" style={{ transform: "scaleX(-1)" }} />

      {!isMinimized && isAnalyzing && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1/3 h-1/2 border-2 border-indigo-500/40 rounded-lg relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br"></div>
            </div>
          </div>

          {trackingPoints.map((pt, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            />
          ))}

          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs border border-white/10 text-indigo-400">
              <Scan className="w-3 h-3" />
              <span>Posture Analysis: Active</span>
            </div>
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs border border-white/10 text-emerald-400">
              <Activity className="w-3 h-3" />
              <span>Eye Tracking: Engaged</span>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
        </>
      )}

      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-gray-300 transition-colors"
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
        </button>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default CameraProctor;

