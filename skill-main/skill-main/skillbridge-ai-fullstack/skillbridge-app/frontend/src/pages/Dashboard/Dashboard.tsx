import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import CompetencyRadar from '@/components/charts/CompetencyRadar';
import type { TopicScore } from '@/types';

const topicScores: TopicScore[] = [
  { topicId: 'html', topicName: 'HTML', score: 90, level: 'strong' },
  { topicId: 'css', topicName: 'CSS', score: 82, level: 'strong' },
  { topicId: 'javascript', topicName: 'JavaScript', score: 62, level: 'developing' },
  { topicId: 'react', topicName: 'React', score: 45, level: 'needs_focus' },
];

const metrics = [
  { label: 'Overall competency', value: '72%', accent: '#75BDE0' },
  { label: 'Learning progress', value: '8 / 12 topics', accent: '#F8D49B' },
  { label: 'Projects completed', value: '3', accent: '#F8BC9B' },
  { label: 'Areas to improve', value: '2 priority topics', accent: '#F89B9B' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="font-serif text-2xl mb-1">Good morning 👋</h2>
      <p className="text-sb-textSoft mb-8">Here's how your career journey is progressing today.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} style={{ borderTop: `4px solid ${m.accent}` }}>
            <div className="text-xs text-sb-textSoft mb-2">{m.label}</div>
            <div className="font-serif text-2xl">{m.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 mb-6">
        <Card>
          <h3 className="font-serif text-lg mb-4">Skill profile</h3>
          <CompetencyRadar data={topicScores} />
        </Card>
        <Card className="flex flex-col">
          <h3 className="font-serif text-lg mb-3">🤖 SkillBridge AI insight</h3>
          <p className="text-sm text-sb-textSoft mb-6 flex-1">
            Your JavaScript fundamentals are progressing well, but asynchronous programming needs
            more practical experience before your next project.
          </p>
          <Button onClick={() => navigate('/roadmap')}>View recommendation →</Button>
        </Card>
      </div>

      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold mb-1">Next recommended action</h3>
          <p className="text-sm text-sb-textSoft">Continue Async JavaScript, then retry your project challenge.</p>
        </div>
        <Button onClick={() => navigate('/roadmap')}>Continue journey →</Button>
      </Card>
    </div>
  );
}
