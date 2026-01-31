import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookIcon,
  BookOpen,
  LineChart,
  Settings,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const adminModules = [
    {
      title: "User Management",
      description: "Manage system users, roles, and permissions",
      icon: <UsersIcon className="h-8 w-8" />,
      link: "/admin/users",
      color: "bg-blue-50 hover:bg-blue-100 text-blue-600",
    },
    {
      title: "Book Management",
      description: "Add, edit, and delete books in the catalog",
      icon: <BookIcon className="h-8 w-8" />,
      link: "/books",
      color: "bg-green-50 hover:bg-green-100 text-green-600",
    },
    {
      title: "Author Management",
      description: "Manage author information and book relationships",
      icon: <UserIcon className="h-8 w-8" />,
      link: "/authors",
      color: "bg-purple-50 hover:bg-purple-100 text-purple-600",
    },
    {
      title: "Review Management",
      description: "Moderate book reviews and ratings",
      icon: <BookOpen className="h-8 w-8" />,
      link: "/admin/reviews",
      color: "bg-amber-50 hover:bg-amber-100 text-amber-600",
    },
    {
      title: "System Settings",
      description: "Configure application settings",
      icon: <Settings className="h-8 w-8" />,
      link: "/admin/settings",
      color: "bg-gray-50 hover:bg-gray-100 text-gray-600",
    },
    {
      title: "Analytics",
      description: "View usage statistics and reports",
      icon: <LineChart className="h-8 w-8" />,
      link: "/admin/analytics",
      color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => (
          <Link key={index} to={module.link}>
            <Card className={`cursor-pointer transition-all ${module.color}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {module.title}
                  <div className="rounded-full p-2 bg-white/80">
                    {module.icon}
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-700">
                  {module.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
