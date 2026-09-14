import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import type { TopicScore } from '@/types';

export default function CompetencyRadar({ data }: { data: TopicScore[] }) {
  const chartData = data.map((d) => ({ topic: d.topicName, score: d.score }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData} outerRadius="75%">
        <PolarGrid stroke="#E9E9E9" />
        <PolarAngleAxis dataKey="topic" tick={{ fontSize: 12, fill: '#6B7280' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} />
        <Radar name="Competency" dataKey="score" stroke="#75BDE0" fill="#75BDE0" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
