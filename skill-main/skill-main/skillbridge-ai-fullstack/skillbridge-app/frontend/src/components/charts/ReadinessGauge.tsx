import React from 'react';
import { readinessStatus } from '@/utils/colors';

export default function ReadinessGauge({ score }: { score: number }) {
  const r = 82;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="text-center">
      <div className="relative w-[190px] h-[190px] mx-auto mb-4">
        <svg width="190" height="190" viewBox="0 0 190 190" className="-rotate-90">
          <circle cx="95" cy="95" r={r} stroke="#F0F0F0" strokeWidth={14} fill="none" />
          <circle
            cx="95" cy="95" r={r} stroke="#75BDE0" strokeWidth={14} fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.16,.84,.32,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-4xl">{score}</span>
          <span className="text-xs text-sb-textSoft">out of 100</span>
        </div>
      </div>
      <div className="text-sm font-semibold text-[#4E9FC9]">{readinessStatus(score)}</div>
    </div>
  );
}
