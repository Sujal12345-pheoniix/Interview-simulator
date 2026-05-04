"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  currentText: string;
}

export function VoiceRecorder({ onTranscriptChange, currentText }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const currentTextRef = useRef(currentText);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const isRecordingRef = useRef(isRecording);

  // Keep refs updated
  useEffect(() => {
    currentTextRef.current = currentText;
    onTranscriptChangeRef.current = onTranscriptChange;
    isRecordingRef.current = isRecording;
  }, [currentText, onTranscriptChange, isRecording]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript) {
        // Append to existing text using refs to avoid dependency cycle
        const current = currentTextRef.current;
        const newText = current ? current + " " + finalTranscript.trim() : finalTranscript.trim();
        onTranscriptChangeRef.current(newText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setError(`Error: ${event.error}`);
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be recording
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started errors
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Run only once on mount

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setError("");
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        onClick={toggleRecording}
        variant={isRecording ? "destructive" : "outline"}
        className={`flex items-center gap-2 transition-all ${
          isRecording ? "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
        }`}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Answer with Voice
          </>
        )}
      </Button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Listening...
        </div>
      )}
      
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
