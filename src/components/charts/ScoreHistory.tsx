"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreHistoryProps {
  data: Array<{ date: string; score: number }>;
}

export function ScoreHistory({ data }: ScoreHistoryProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          domain={[0, 10]} 
          stroke="#888" 
          tick={{ fill: '#888', fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
          }}
          itemStyle={{ color: "#10b981" }} // emerald-500
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
