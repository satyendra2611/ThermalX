import React from 'react';
import { levelColor, levelLabel } from '@/utils/colors';

export default function Badge({ level }: { level: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${levelColor(level)}22`, color: levelColor(level) }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelColor(level) }} />
      {levelLabel(level)}
    </span>
  );
}
