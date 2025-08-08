import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/common/supabase/hooks/useAuth";
import { Button } from "@/primitives/button";
import { Text } from "@/primitives/text";

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const { error, clearError, refreshSession, signOut } = useAuth();
  const router = useRouter();

  // Ensure error is always a string
  const errorMessage =
    typeof error === "string" ? error : "An authentication error occurred";

  useEffect(() => {
    if (
      errorMessage.includes("Session expired") ||
      errorMessage.includes("Refresh Token")
    ) {
      // Auto-redirect to login after a short delay
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, router]);

  if (!error) {
    return <>{children}</>;
  }

  const handleRefresh = async () => {
    try {
      await refreshSession();
      clearError();
    } catch {
      // If refresh fails, redirect to login
      router.push("/auth/login");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <Text className="mb-4 font-semibold text-red-600">
            Authentication Error
          </Text>
          <Text className="mb-6 text-gray-600">{errorMessage}</Text>

          <div className="space-y-3">
            {!errorMessage.includes("Session expired") && (
              <Button onClick={handleRefresh} className="w-full" color="blue">
                Try Again
              </Button>
            )}

            <Button onClick={handleSignOut} className="w-full" outline>
              Sign In Again
            </Button>
          </div>

          {errorMessage.includes("Session expired") && (
            <Text className="mt-4 text-sm text-gray-500">
              Redirecting to login page...
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
