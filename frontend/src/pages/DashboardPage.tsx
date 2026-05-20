import React from 'react';
import { Users, TrendingUp, Target, XCircle } from 'lucide-react';
import { useLeadStats } from '../hooks/useLeads';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/ui/Spinner';
import { LeadStatus, LeadSource } from '../types';
import { STATUS_COLORS, SOURCE_COLORS } from '../utils';
import { Badge } from '../components/ui/Badge';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useLeadStats();

  const getStatusCount = (status: LeadStatus) =>
    stats?.statusStats.find((s) => s._id === status)?.count ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Good day, {user?.name.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with your leads today.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats?.total ?? 0}
          icon={<Users className="w-6 h-6 text-brand-600" />}
          color="bg-brand-50 dark:bg-brand-900/30"
        />
        <StatCard
          title="Qualified"
          value={getStatusCount('Qualified')}
          icon={<Target className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/30"
          description="Ready to convert"
        />
        <StatCard
          title="Contacted"
          value={getStatusCount('Contacted')}
          icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/30"
          description="In progress"
        />
        <StatCard
          title="Lost"
          value={getStatusCount('Lost')}
          icon={<XCircle className="w-6 h-6 text-red-500" />}
          color="bg-red-50 dark:bg-red-900/30"
          description="Needs review"
        />
      </div>

      {/* Status + Source breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((status) => {
              const count = getStatusCount(status);
              const total = stats?.total ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={STATUS_COLORS[status]}>{status}</Badge>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {(['Website', 'Instagram', 'Referral'] as LeadSource[]).map((source) => {
              const count = stats?.sourceStats.find((s) => s._id === source)?.count ?? 0;
              const total = stats?.total ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={SOURCE_COLORS[source]}>{source}</Badge>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
