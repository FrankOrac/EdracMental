import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Login successful",
        });
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Edrac</CardTitle>
          <CardDescription>
            Welcome to Edrac - Your AI-powered learning platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick Demo Login:
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail("student@edrac.com")}
                className="text-xs"
              >
                Student Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail("jane.student@edrac.com")}
                className="text-xs"
              >
                Premium Student
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail("institution@edrac.com")}
                className="text-xs"
              >
                Institution
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmail("admin@edrac.com")}
                className="text-xs"
              >
                Admin
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full"
            >
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}