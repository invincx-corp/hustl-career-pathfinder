import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, Mail, Lock, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const AuthModal = () => {
  const { user, signIn, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [signInData, setSignInData] = useState({ email: "", password: "" });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn(signInData);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.user) {
        toast.success("Successfully signed in!");
        setIsOpen(false);
        setSignInData({ email: "", password: "" });
        // For existing users, always go to dashboard after login
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };



  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Successfully signed out!");
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Button disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Welcome, {user.full_name || user.email}
        </span>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Welcome to Nexa</DialogTitle>
        <DialogDescription className="sr-only">
          Your AI-powered career guidance platform
        </DialogDescription>
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle>Welcome to Nexa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your AI-powered career guidance platform
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="text-right">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm p-0 h-auto"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/forgot-password');
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Ready to start your journey?</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your account with our comprehensive signup form
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/signup');
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Go to Sign Up
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
