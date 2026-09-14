import React from 'react';

export default function Card({
  className = '', children, style,
}: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={`bg-sb-surface border border-sb-border rounded-card shadow-card p-6 ${className}`} style={style}>
      {children}
    </div>
  );
}
