import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookIcon,
  LineChart,
  MessageSquare,
  Settings,
  TrendingUp,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { AdminModuleCard, StatsCard } from './StatsCard';
import AdminService from '@/services/adminService';

interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalAuthors: number;
  totalReviews: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalAuthors: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [users, books, authors, reviews] = await Promise.all([
          AdminService.getAllUsers(),
          AdminService.getAllBooks(),
          AdminService.getAllAuthors(),
          AdminService.getAllReviews(),
        ]);

        setStats({
          totalUsers: users.length,
          totalBooks: books.length,
          totalAuthors: authors.length,
          totalReviews: reviews.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: <UsersIcon className="h-7 w-7" />,
      link: '/admin/users',
      color: 'blue' as const,
      stats: { label: 'Total Users', value: stats.totalUsers },
    },
    {
      title: 'Book Management',
      description: 'Add, edit, and delete books in the catalog',
      icon: <BookIcon className="h-7 w-7" />,
      link: '/admin/books',
      color: 'green' as const,
      stats: { label: 'Total Books', value: stats.totalBooks },
    },
    {
      title: 'Author Management',
      description: 'Manage author profiles and their works',
      icon: <UserIcon className="h-7 w-7" />,
      link: '/admin/authors',
      color: 'purple' as const,
      stats: { label: 'Total Authors', value: stats.totalAuthors },
    },
    {
      title: 'Review Moderation',
      description: 'Moderate book reviews and ratings',
      icon: <MessageSquare className="h-7 w-7" />,
      link: '/admin/reviews',
      color: 'amber' as const,
      stats: { label: 'Total Reviews', value: stats.totalReviews },
    },
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      icon: <Settings className="h-7 w-7" />,
      link: '/admin/settings',
      color: 'gray' as const,
    },
    {
      title: 'Analytics',
      description: 'View usage statistics and reports',
      icon: <LineChart className="h-7 w-7" />,
      link: '/admin/analytics',
      color: 'indigo' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your library system
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={loading ? '...' : stats.totalUsers}
          icon={UsersIcon}
          trend={{ value: 12, label: 'vs last month' }}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatsCard
          title="Total Books"
          value={loading ? '...' : stats.totalBooks}
          icon={BookIcon}
          trend={{ value: 8, label: 'vs last month' }}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatsCard
          title="Total Authors"
          value={loading ? '...' : stats.totalAuthors}
          icon={UserIcon}
          trend={{ value: 5, label: 'vs last month' }}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatsCard
          title="Total Reviews"
          value={loading ? '...' : stats.totalReviews}
          icon={TrendingUp}
          trend={{ value: 23, label: 'vs last month' }}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Link key={index} to={module.link}>
              <AdminModuleCard
                title={module.title}
                description={module.description}
                icon={module.icon}
                href={module.link}
                color={module.color}
                stats={module.stats}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
