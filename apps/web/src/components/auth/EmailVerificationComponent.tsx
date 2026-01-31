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
import AuthService from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetAuthError, verifyEmail } from "@/store/slices/authSlice";
import { AlertCircle, CheckCircle, Loader2, MailIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function EmailVerificationComponent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Add a fallback empty object with default values to prevent destructuring errors in tests
  const {
    isLoading = false,
    error = null,
    emailVerified = false,
  } = useAppSelector(
    (state) =>
      state?.auth || { isLoading: false, error: null, emailVerified: false }
  );

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [email, setEmail] = useState("");
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    // Reset auth errors when component unmounts
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  useEffect(() => {
    const token = searchParams.get("token");

    // If there's a token in the URL, try to verify it
    if (token) {
      setVerificationAttempted(true);
      dispatch(verifyEmail(token));
    }
  }, [searchParams, dispatch]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendError("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendError("");

    try {
      await AuthService.resendVerification(email);
      setResendSuccess(true);
      setResendError("");
    } catch (error: unknown) {
      setResendError(
        error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to resend verification email"
      );
      setResendSuccess(false);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Only show success state when verification was both attempted and successful
  const isVerificationSuccessful =
    verificationAttempted && emailVerified && !error;

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <Card className="w-[400px] max-w-[90%]">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {isVerificationSuccessful
              ? "Your email has been verified successfully!"
              : "Verify your email address to complete registration"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && isVerificationSuccessful && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Your email has been verified successfully! You can now log in to
                your account.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && error && (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error ||
                  "Verification failed. The token may be invalid or expired."}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !verificationAttempted && (
            <>
              <div className="text-center mb-6">
                <MailIcon className="mx-auto h-12 w-12 text-primary mb-4" />
                <p className="mb-4">
                  We've sent a verification link to your email address. Please
                  check your inbox and click the link to verify your email.
                </p>
                <p className="text-sm text-gray-500">
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Didn't receive the email?</h3>
                {resendSuccess ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Verification email has been resent. Please check your
                      inbox.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      {resendError && (
                        <p className="text-red-500 text-sm mt-1">
                          {resendError}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      variant="outline"
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {isVerificationSuccessful && (
            <Button onClick={handleLogin} className="w-full">
              Continue to Login
            </Button>
          )}
          {error && (
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
