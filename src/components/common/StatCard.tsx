import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'blue',
  badge,
  onClick,
  className,
}) => {
  const variantStyles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const iconBgStyles = {
    blue: 'bg-blue-500/15 text-blue-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    rose: 'bg-rose-500/15 text-rose-400',
    purple: 'bg-purple-500/15 text-purple-400',
    cyan: 'bg-cyan-500/15 text-cyan-400',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-200',
        onClick
          ? 'cursor-pointer hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.98] group'
          : 'hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        <div
          className={clsx(
            'p-2.5 rounded-lg border border-white/5 transition-transform duration-200',
            onClick && 'group-hover:scale-110',
            iconBgStyles[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white group-hover:text-sky-200 transition-colors">
          {value}
        </span>
        {badge && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={clsx(
                  'font-semibold px-1.5 py-0.5 rounded',
                  trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{subtitle}</span>}
          </div>
          {onClick && (
            <span className="text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold">
              View →
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
