import React from 'react';
import clsx from 'clsx';

interface WorkloadBadgeProps {
  status: 'LIGHT' | 'BALANCED' | 'HEAVY' | 'OVERLOADED' | string;
  score?: number;
  showScore?: boolean;
}

export const WorkloadBadge: React.FC<WorkloadBadgeProps> = ({ status, score, showScore = true }) => {
  const normStatus = status?.toUpperCase() || 'BALANCED';

  const styles = {
    LIGHT: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    BALANCED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    HEAVY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    OVERLOADED: 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold',
  }[normStatus] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        styles
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-sky-400': normStatus === 'LIGHT',
          'bg-emerald-400': normStatus === 'BALANCED',
          'bg-amber-400': normStatus === 'HEAVY',
          'bg-rose-400': normStatus === 'OVERLOADED',
        })}
      />
      {normStatus}
      {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
    </span>
  );
};

export default WorkloadBadge;
