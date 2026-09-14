import React, { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import ReadinessGauge from '@/components/charts/ReadinessGauge';
import { readinessService } from '@/services/readinessService';
import { useAuthContext } from '@/context/AuthContext';
import type { JobReadinessReport } from '@/types';

const fallback: JobReadinessReport = {
  readinessScore: 74,
  status: 'approaching',

  positiveContributors: [
    {
      label: 'Project understanding',
      impact: 12,
    },
    {
      label: 'HTML & CSS performance',
      impact: 10,
    },
    {
      label: 'Mock interview',
      impact: 8,
    },
  ],

  improvementFactors: [
    {
      label: 'Async JavaScript',
      impact: -9,
    },
    {
      label: 'React fundamentals',
      impact: -7,
    },
  ],

  recommendedNextSteps: [
    'Focus on Async JavaScript before progressing to advanced React concepts.',
    'Complete one more practical project to reinforce application skills.',
    'Practice technical interview questions on closures and promises.',
  ],
};

export default function JobReadiness() {
  const [report, setReport] =
    useState<JobReadinessReport>(fallback);

  // Get the REAL authenticated user
  const { user } = useAuthContext();

  useEffect(() => {
    // Wait until the authenticated user is available
    if (!user) {
      setReport(fallback);
      return;
    }

    readinessService
      .calculate(user.id)
      .then(setReport)
      .catch((error) => {
        console.error('Failed to load job readiness:', error);
        setReport(fallback);
      });
  }, [user]);

  const maxImpact = Math.max(
    ...report.positiveContributors.map((contributor) =>
      Math.abs(contributor.impact)
    ),

    ...report.improvementFactors.map((contributor) =>
      Math.abs(contributor.impact)
    ),

    1
  );

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-6">
      <Card className="text-center h-fit">
        <ReadinessGauge score={report.readinessScore} />
      </Card>

      <div className="flex flex-col gap-6">

        {/* Score Explanation */}
        <Card>
          <h3 className="font-serif text-lg mb-4">
            Why you received this score
          </h3>

          {/* Positive Contributors */}
          <div className="text-xs font-semibold text-sb-textSoft mb-2">
            Positive contributors
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {report.positiveContributors.map((contributor) => (
              <div
                key={contributor.label}
                className="grid grid-cols-[150px_1fr_36px] items-center gap-3 text-sm"
              >
                <span>
                  {contributor.label}
                </span>

                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sb-blue"
                    style={{
                      width: `${
                        (Math.abs(contributor.impact) / maxImpact) * 100
                      }%`,
                    }}
                  />
                </div>

                <span className="text-right font-medium">
                  +{contributor.impact}
                </span>
              </div>
            ))}
          </div>

          {/* Improvement Factors */}
          <div className="text-xs font-semibold text-sb-textSoft mb-2">
            Room to improve
          </div>

          <div className="flex flex-col gap-2">
            {report.improvementFactors.map((contributor) => (
              <div
                key={contributor.label}
                className="grid grid-cols-[150px_1fr_36px] items-center gap-3 text-sm"
              >
                <span>
                  {contributor.label}
                </span>

                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sb-coral"
                    style={{
                      width: `${
                        (Math.abs(contributor.impact) / maxImpact) * 100
                      }%`,
                    }}
                  />
                </div>

                <span className="text-right font-medium">
                  {contributor.impact}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Steps */}
        <Card>
          <h3 className="font-serif text-lg mb-4">
            Recommended next steps
          </h3>

          <ul className="flex flex-col gap-3">
            {report.recommendedNextSteps.map((step, index) => (
              <li
                key={index}
                className="text-sm flex gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-sb-gold/40 text-[#8a6a1f] text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                {step}
              </li>
            ))}
          </ul>
        </Card>

      </div>
    </div>
  );
}