import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role: "student" | "institution" | "admin";
  subscriptionPlan: "free" | "premium" | "institution";
  subscriptionExpiry?: string | null;
  institutionId?: string | null;
  isEnabled: boolean;
  disabledReason?: string | null;
  disabledBy?: string | null;
  disabledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      
      // Clear all queries and redirect
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      queryClient.clear();
      window.location.href = "/";
    }
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
