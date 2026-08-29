import React from 'react';
import clsx from 'clsx';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = true }) => {
  const normLevel = level?.toUpperCase() || 'LOW';

  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    CRITICAL: 'bg-red-600/20 text-red-300 border-red-500/40 animate-pulse',
  }[normLevel] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        styles
      )}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-emerald-400': normLevel === 'LOW',
          'bg-amber-400': normLevel === 'MEDIUM',
          'bg-rose-400': normLevel === 'HIGH',
          'bg-red-400': normLevel === 'CRITICAL',
        })}
      />
      {normLevel}
      {showScore && score !== undefined && <span className="opacity-75">({score})</span>}
    </span>
  );
};

export default RiskBadge;
