import React from 'react';
import Button from './Button';

export default function EmptyState({
  title, description, actionLabel, onAction,
}: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="text-center py-16 px-6">
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      <p className="text-sb-textSoft text-sm max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
