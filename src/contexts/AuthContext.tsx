
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: initializing");
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: initial session", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AuthProvider: auth state change", _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log("AuthProvider: signing out");
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("AuthProvider: error signing out", error);
      toast({
        title: "Error signing out",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("AuthProvider: signing in with Google");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error("AuthProvider: Google sign-in error details:", error);
        throw error;
      }
      
      console.log("AuthProvider: Google sign-in initiated successfully, data:", data);
      // The redirect happens automatically, so no need to manually navigate
    } catch (error: any) {
      console.error("AuthProvider: error signing in with Google", error);
      toast({
        title: "Error signing in with Google",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
