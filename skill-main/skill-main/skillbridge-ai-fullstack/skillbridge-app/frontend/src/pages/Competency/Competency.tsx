import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import CompetencyRadar from '@/components/charts/CompetencyRadar';
import TopicBarChart from '@/components/charts/TopicBarChart';
import { assessmentService } from '@/services/assessmentService';
import { useAuthContext } from '@/context/AuthContext';
import type { AssessmentResult } from '@/types';

const fallback: AssessmentResult = {
  overallScore: 72,
  topicScores: [
    {
      topicId: 'html',
      topicName: 'HTML',
      score: 90,
      level: 'strong',
    },
    {
      topicId: 'css',
      topicName: 'CSS',
      score: 82,
      level: 'strong',
    },
    {
      topicId: 'javascript',
      topicName: 'JavaScript',
      score: 62,
      level: 'developing',
    },
    {
      topicId: 'react',
      topicName: 'React',
      score: 45,
      level: 'needs_focus',
    },
  ],
  aiSummary:
    'Your fundamentals in HTML and CSS are strong. JavaScript is developing well, but asynchronous concepts and React need focused attention before you move to advanced project work.',
};

export default function Competency() {
  const [result, setResult] =
    useState<AssessmentResult>(fallback);

  const navigate = useNavigate();

  // Get the REAL authenticated user
  const { user } = useAuthContext();

  useEffect(() => {
    // Don't call the backend until authentication is available
    if (!user) {
      setResult(fallback);
      return;
    }

    assessmentService
      .getResult(user.id)
      .then(setResult)
      .catch(() => setResult(fallback));
  }, [user]);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Card className="md:col-span-1 text-center">
          <div className="text-xs text-sb-textSoft mb-2">
            Overall competency
          </div>

          <div className="font-serif text-5xl mb-2">
            {result.overallScore}%
          </div>

          <p className="text-sm text-sb-textSoft">
            {result.aiSummary}
          </p>
        </Card>

        <Card className="md:col-span-2">
          <CompetencyRadar data={result.topicScores} />
        </Card>
      </div>

      <Card className="mb-8">
        <h3 className="font-serif text-lg mb-4">
          Topic-level breakdown
        </h3>

        <TopicBarChart data={result.topicScores} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {result.topicScores.map((topic) => (
            <div
              key={topic.topicId}
              className="flex items-center justify-between border border-sb-border rounded-xl px-3 py-2"
            >
              <span className="text-sm font-medium">
                {topic.topicName}
              </span>

              <Badge level={topic.level} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => navigate('/roadmap')}>
          View my roadmap →
        </Button>

        <Button variant="ghost">
          View detailed analysis
        </Button>
      </div>
    </div>
  );
}