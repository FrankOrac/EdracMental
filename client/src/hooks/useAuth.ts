import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
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
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
