import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, LucideIcon, Minus } from 'lucide-react';
import { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <ArrowUp className="h-3 w-3" />;
    if (trend.value < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (trend.value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <Card
      className={cn(
        'border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden',
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {(description || trend) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-medium',
                      getTrendColor(),
                    )}
                  >
                    {getTrendIcon()}
                    {Math.abs(trend.value)}%
                  </span>
                )}
                {description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </span>
                )}
                {trend && !description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl',
              iconBgColor,
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface AdminModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo' | 'gray';
  stats?: {
    label: string;
    value: string | number;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
    hover: 'hover:border-blue-200 dark:hover:border-blue-800',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    hover: 'hover:border-emerald-200 dark:hover:border-emerald-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
    hover: 'hover:border-purple-200 dark:hover:border-purple-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
    hover: 'hover:border-amber-200 dark:hover:border-amber-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-900/30',
    hover: 'hover:border-red-200 dark:hover:border-red-800',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/30',
    hover: 'hover:border-indigo-200 dark:hover:border-indigo-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-100 dark:border-gray-800',
    hover: 'hover:border-gray-200 dark:hover:border-gray-700',
  },
};

export function AdminModuleCard({
  title,
  description,
  icon,
  color,
  stats,
}: AdminModuleCardProps) {
  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        colors.border,
        colors.hover,
        'bg-white dark:bg-gray-900',
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50',
          colors.bg,
        )}
      />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
              colors.iconBg,
            )}
          >
            <span className={colors.text}>{icon}</span>
          </div>
          {stats && (
            <div className="text-right">
              <p className={cn('text-2xl font-bold', colors.text)}>
                {stats.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stats.label}
              </p>
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              colors.iconBg,
            )}
          >
            <svg
              className={cn('w-4 h-4', colors.text)}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
