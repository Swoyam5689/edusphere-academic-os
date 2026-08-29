import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, TrendingUp, AlertTriangle, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import { InstitutionalInsight } from '../../types/index.js';

export const InstitutionalInsights: React.FC = () => {
  const [insights, setInsights] = useState<InstitutionalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.getInstitutionalInsights();
        if (res.success) {
          setInsights(res.insights);
        }
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ATTENDANCE':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'WORKLOAD':
        return <TrendingUp className="w-5 h-5 text-rose-400" />;
      case 'RESOURCES':
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'PLACEMENT':
        return <Award className="w-5 h-5 text-emerald-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-400" /> Institutional Health Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic, database-derived diagnostic observations synthesized from real-time academic activity
          </p>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map(item => (
          <div
            key={item.id}
            className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
              item.type === 'CRITICAL'
                ? 'border-rose-500/30 bg-rose-950/10'
                : item.type === 'WARNING'
                ? 'border-amber-500/30 bg-amber-950/10'
                : item.type === 'POSITIVE'
                ? 'border-emerald-500/30 bg-emerald-950/10'
                : 'border-white/10'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800 border border-white/5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                    {item.category}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-800 text-white border border-slate-700">
                  {item.metric}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{item.headline}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status: Verified Database Signal</span>
              <span className="text-sky-400 font-semibold cursor-pointer hover:underline">
                View Drill-Down &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionalInsights;
