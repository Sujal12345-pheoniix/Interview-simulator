"use client";

import React, { useEffect, useRef, useState } from "react";
import { Minimize, Maximize, Scan, Activity, Eye, AlertCircle } from "lucide-react";

export function CameraProctor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(true); // start minimized
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  const [attention, setAttention] = useState<"engaged" | "distracted" | "checking">("checking");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval>;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 320, height: 240 }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        // Simulate attention tracking
        setAttention("engaged");
        timer = setInterval(() => {
          setPts(Array.from({ length: 5 }, () => ({ x: 28 + Math.random() * 44, y: 18 + Math.random() * 52 })));
          setAttention(Math.random() > 0.15 ? "engaged" : "distracted");
        }, 1200);
      })
      .catch(() => setError("Camera access denied"));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      clearInterval(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/8 text-xs text-red-400">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Camera unavailable
      </div>
    );
  }

  // Minimized pill
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] bg-[#0e0e10] hover:bg-[#131315] transition-all text-xs text-gray-400 hover:text-gray-200"
        title="Expand proctoring view"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Eye className="w-3.5 h-3.5" />
        Proctoring active
        <Maximize className="w-3 h-3 ml-1 opacity-50" />
      </button>
    );
  }

  // Expanded view
  return (
    <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl shadow-black/40">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Face tracking overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner brackets */}
        <div className="absolute inset-[20%]">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 rounded-br-sm" />
        </div>
        {/* Tracking dots */}
        {pts.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.9)] transition-all duration-700"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
        {/* Scan line */}
        <div
          className="absolute left-0 right-0 h-px bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          style={{ animation: "scan-line 3s ease-in-out infinite" }}
        />
      </div>

      {/* Status badges */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1">
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium backdrop-blur-sm border ${
          attention === "engaged"
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400"
            : "bg-amber-950/80 border-amber-500/30 text-amber-400"
        }`}>
          <Activity className="w-2.5 h-2.5" />
          {attention === "engaged" ? "Engaged" : "Distracted"}
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/60 border border-white/10 text-indigo-400 backdrop-blur-sm">
          <Scan className="w-2.5 h-2.5" />
          Tracking
        </div>
      </div>

      {/* Minimize button */}
      <button
        onClick={() => setMinimized(true)}
        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/50 hover:bg-black/80 border border-white/10 text-gray-300 transition-colors"
      >
        <Minimize className="w-3 h-3" />
      </button>
    </div>
  );
}

export default CameraProctor;
