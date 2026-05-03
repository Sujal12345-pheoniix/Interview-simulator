"use client";

import React from "react";
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartProps {
  data: Array<{ category: string; score: number }>;
}

export function RadarChart({ data }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: '#888', fontSize: 12 }} 
        />
        <PolarRadiusAxis 
          domain={[0, 10]} 
          tick={false} 
          axisLine={false} 
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1" // indigo-500
          fill="#6366f1"
          fillOpacity={0.4}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
          }}
          itemStyle={{ color: "#6366f1" }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
