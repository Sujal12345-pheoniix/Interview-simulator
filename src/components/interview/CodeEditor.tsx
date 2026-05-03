"use client";

import React from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  height?: string;
}

export function CodeEditor({
  language,
  code,
  onChange,
  height = "400px",
}: CodeEditorProps) {
  return (
    <div className="rounded-md overflow-hidden border border-gray-800">
      <MonacoEditor
        height={height}
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
