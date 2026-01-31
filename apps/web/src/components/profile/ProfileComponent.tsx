import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  changePassword,
  deleteAccount,
  resetAuthError,
  updateProfile,
} from "@/store/slices/authSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lock,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthGuard } from "../auth/guards/AuthGuard";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
});

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Account deletion schema
const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required to confirm account deletion"),
  confirmation: z
    .literal("DELETE MY ACCOUNT")
    .refine((val) => val === "DELETE MY ACCOUNT", {
      message: "Please type DELETE MY ACCOUNT to confirm",
    }),
});

// Infer TypeScript types from schemas
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export function ProfileComponent() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Reset auth errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Reset form values when user changes
  useEffect(() => {
    if (user) {
      profileForm.setValue("name", user.name);
    }
  }, [user, profileForm]);

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Delete account form
  const deleteForm = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: undefined,
    },
  });

  // Handle profile update
  const handleProfileUpdate = (data: ProfileFormValues) => {
    dispatch(updateProfile(data.name))
      .unwrap()
      .then(() => {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      });
  };

  // Handle password change
  const handlePasswordChange = (data: PasswordFormValues) => {
    dispatch(
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    )
      .unwrap()
      .then(() => {
        setPasswordSuccess(true);
        passwordForm.reset();
        setTimeout(() => setPasswordSuccess(false), 3000);
      });
  };

  // Handle account deletion
  const handleDeleteAccount = (data: DeleteAccountFormValues) => {
    dispatch(deleteAccount(data.password));
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger
              value="profile"
              className="flex items-center justify-center"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center justify-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="flex items-center justify-center"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <CardContent className="space-y-4">
                  {profileSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        Your profile has been updated successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && activeTab === "profile" && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                        aria-invalid={
                          profileForm.formState.errors.name ? "true" : "false"
                        }
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">
                        Email address cannot be changed as it's used for login.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && activeTab === "profile" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
                <CardContent className="space-y-4">
                  {passwordSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        Your password has been changed successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && activeTab === "security" && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                        aria-invalid={
                          passwordForm.formState.errors.currentPassword
                            ? "true"
                            : "false"
                        }
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register("newPassword")}
                        aria-invalid={
                          passwordForm.formState.errors.newPassword
                            ? "true"
                            : "false"
                        }
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                        aria-invalid={
                          passwordForm.formState.errors.confirmPassword
                            ? "true"
                            : "false"
                        }
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && activeTab === "security" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription className="text-red-600">
                  Actions here can't be undone. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
                <CardContent className="space-y-4">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600">
                      Deleting your account will permanently remove all your
                      data and cannot be undone.
                    </AlertDescription>
                  </Alert>

                  {error && activeTab === "danger" && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="delete-password">Your Password</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        {...deleteForm.register("password")}
                        aria-invalid={
                          deleteForm.formState.errors.password
                            ? "true"
                            : "false"
                        }
                      />
                      {deleteForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {deleteForm.formState.errors.password.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Please enter your password to confirm.
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="confirmation">
                        Type "DELETE MY ACCOUNT" to confirm
                      </Label>
                      <Input
                        id="confirmation"
                        placeholder="DELETE MY ACCOUNT"
                        {...deleteForm.register("confirmation")}
                        aria-invalid={
                          deleteForm.formState.errors.confirmation
                            ? "true"
                            : "false"
                        }
                      />
                      {deleteForm.formState.errors.confirmation && (
                        <p className="text-sm text-red-500 mt-1">
                          {deleteForm.formState.errors.confirmation.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading && activeTab === "danger" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
