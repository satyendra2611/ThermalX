import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { levelColor } from '@/utils/colors';
import { roadmapService } from '@/services/roadmapService';
import { useAuthContext } from '@/context/AuthContext';
import type { Roadmap as RoadmapType, RoadmapNode } from '@/types';

const fallbackNodes: RoadmapNode[] = [
  {
    topicId: 'html',
    topicName: 'HTML',
    status: 'completed',
    competencyLevel: 'strong',
  },
  {
    topicId: 'css',
    topicName: 'CSS',
    status: 'completed',
    competencyLevel: 'strong',
  },
  {
    topicId: 'javascript',
    topicName: 'JavaScript',
    status: 'current',
    competencyLevel: 'developing',
  },
  {
    topicId: 'async-js',
    topicName: 'Async JavaScript',
    status: 'priority',
    competencyLevel: 'needs_focus',
  },
  {
    topicId: 'js-project',
    topicName: 'JavaScript Project',
    status: 'upcoming',
    competencyLevel: 'developing',
  },
  {
    topicId: 'react',
    topicName: 'React',
    status: 'locked',
    competencyLevel: 'locked',
  },
];

const statusLabel: Record<RoadmapNode['status'], string> = {
  completed: 'Completed / Strong',
  current: 'Current learning focus',
  priority: 'Priority improvement',
  upcoming: 'Practical application',
  locked: 'Upcoming',
};

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);

  const navigate = useNavigate();

  // Get the REAL authenticated user
  const { user } = useAuthContext();

  useEffect(() => {
    // Wait until authentication is available
    if (!user) {
      setRoadmap(null);
      return;
    }

    roadmapService
      .get(user.id)
      .then(setRoadmap)
      .catch(() =>
        setRoadmap({
          userId: user.id,
          domainId: 'web-development',
          nodes: fallbackNodes,
          updatedAt: new Date().toISOString(),
        })
      );
  }, [user]);

  const nodes = roadmap?.nodes ?? fallbackNodes;

  return (
    <div className="max-w-2xl">
      <p className="text-sb-textSoft mb-8">
        Your roadmap adapts every time you complete an assessment, a project,
        or an interview — it is never a fixed course list.
      </p>

      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-sb-border" />

        <div className="flex flex-col gap-6">
          {nodes.map((node) => (
            <div
              key={node.topicId}
              className="relative flex items-start gap-4"
            >
              <div
                className="absolute -left-6 w-5 h-5 rounded-full border-2 border-white shadow"
                style={{
                  backgroundColor:
                    node.status === 'locked'
                      ? '#D1D5DB'
                      : levelColor(node.competencyLevel),
                }}
              />

              <Card
                className={`flex-1 ${
                  node.status === 'locked' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {node.topicName}
                  </h4>

                  {node.status === 'current' && (
                    <Button
                      className="!px-3 !py-1.5 !text-xs"
                      onClick={() => navigate('/projects')}
                    >
                      Continue
                    </Button>
                  )}
                </div>

                <p className="text-xs text-sb-textSoft mt-1">
                  {statusLabel[node.status]}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}