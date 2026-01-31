import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminService, { UserDetail } from "@/services/adminService";
import { UserRole } from "@/services/authService";
import { format } from "date-fns";
import {
  Book,
  Clock,
  Edit,
  Key,
  Loader2,
  Trash,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetail | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;

        setLoading(true);
        const userData = await AdminService.getUserById(Number(id));
        if (!userData || !userData.id) {
          setUser(null);
        } else {
          setUser(userData);
        }
        setLoading(false);
      } catch (err: Error | unknown) {
        console.error("Error fetching user:", err);
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load user data"
        );
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/users/edit/${id}`);
  };

  const handleChangePassword = () => {
    navigate(`/admin/users/password/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await AdminService.deleteUser(Number(id));
        navigate("/admin/users");
      } catch (err: Error | unknown) {
        console.error("Error deleting user:", err);
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to delete user"
        );
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case UserRole.USER:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">User Details</CardTitle>
              <CardDescription>
                View detailed information about this user
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleChangePassword}>
                <Key className="h-4 w-4 mr-2" />
                Password
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  User Information
                </h3>
                <div className="mt-2 border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      Email:
                    </span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      Role:
                    </span>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">
                      Status:
                    </span>
                    <Badge
                      variant={user.email_verified ? "default" : "destructive"}
                    >
                      {user.email_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Timestamps
                </h3>
                <div className="mt-2 border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Created:
                    </span>
                    <span>
                      {format(new Date(user.createdAt), "PPP 'at' p")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Updated:
                    </span>
                    <span>
                      {format(new Date(user.updatedAt), "PPP 'at' p")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                User's Books
              </h3>
              <div className="mt-2 border rounded-lg p-4">
                {user.books && user.books.length > 0 ? (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>ISBN</TableHead>
                          <TableHead>Year</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.books.map((book) => (
                          <TableRow key={book.id}>
                            <TableCell className="font-medium">
                              {book.title}
                            </TableCell>
                            <TableCell>{book.isbn || "N/A"}</TableCell>
                            <TableCell>
                              {book.publishYear || "Unknown"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Book className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No books in collection
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            Back to Users List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
