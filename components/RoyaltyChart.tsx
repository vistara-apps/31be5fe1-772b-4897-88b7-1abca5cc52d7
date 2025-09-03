'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface RoyaltyChartProps {
  data: Array<{
    month: string;
    earnings: number;
  }>;
  variant?: 'bar' | 'line';
}

export function RoyaltyChart({ data, variant = 'bar' }: RoyaltyChartProps) {
  if (variant === 'line') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#ffffff80', fontSize: 12 }}
          />
          <YAxis hide />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#ffffff80', fontSize: 12 }}
        />
        <YAxis hide />
        <Bar 
          dataKey="earnings" 
          fill="url(#barGradient)" 
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
