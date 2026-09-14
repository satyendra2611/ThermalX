import React from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { TopicScore } from '@/types';
import { levelColor } from '@/utils/colors';

export default function TopicBarChart({ data }: { data: TopicScore[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="topicName" width={90} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
        <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={levelColor(entry.level)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
