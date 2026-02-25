import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdminService, { User } from '@/services/adminService';
import { UserRole } from '@/services/authService';
import { format } from 'date-fns';
import {
  Edit,
  Eye,
  Key,
  MoreHorizontal,
  Plus,
  Trash,
  Users,
  UserX,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: number) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  const handleView = (userId: number) => {
    navigate(`/admin/users/view/${userId}`);
  };

  const handleDelete = async (userId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.',
      )
    ) {
      try {
        await AdminService.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user. Please try again.');
      }
    }
  };

  const handleChangePassword = (userId: number) => {
    navigate(`/admin/users/password/${userId}`);
  };

  const handleAddUser = () => {
    navigate('/admin/users/create');
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      [UserRole.ADMIN]:
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      [UserRole.USER]:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
    return (
      <Badge variant="outline" className={roleStyles[role] || 'bg-gray-100'}>
        {role}
      </Badge>
    );
  };

  const columns: DataTableColumn<User>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-gray-500 dark:text-gray-400',
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {user.name}
          </span>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      cell: (user) => (
        <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      cell: (user) => getRoleBadge(user.role),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'email_verified',
      cell: (user) => (
        <Badge
          variant={user.email_verified ? 'default' : 'secondary'}
          className={
            user.email_verified
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
          }
        >
          {user.email_verified ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (user) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {format(new Date(user.createdAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      sortable: false,
      searchable: false,
      cell: (user) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleView(user.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(user.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangePassword(user.id)}>
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(user.id)}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Users Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage system users and their roles
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-0" />
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            searchPlaceholder="Search users by name or email..."
            emptyMessage="No users found"
            emptyIcon={
              <UserX className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
            }
            getRowId={(user) => user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
