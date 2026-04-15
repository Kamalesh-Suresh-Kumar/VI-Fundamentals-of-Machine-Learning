import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// --- Types ---
export type UserRole = 'admin' | 'lender' | 'borrower' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  financialDataCollected: boolean;
  currentRole: UserRole;
  dob: string;
  gender: "Select" | "Male" | "Female";
  maritalStatus: "Select" | "Single" | "Married";
  dependents: string;
}

interface StoredUser extends User {
  password: string;
}

type FinancialData = Record<string, unknown>;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    gender: "Select" | "Male" | "Female";
    maritalStatus: "Select" | "Single" | "Married";
    dependents: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  submitFinancialData: (financialData: FinancialData) => Promise<boolean>;
}

// --- Context Setup ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- AuthProvider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock admin check since it had hardcoded logic in Login.tsx
      if (email === "admin@loanharmony.com" && password === "Admin@2005") {
         setUser({
           id: "admin", name: "Admin", email, phone: "", verified: true, financialDataCollected: true, currentRole: "admin", dob: "", gender: "Male", maritalStatus: "Single", dependents: "0"
         } as User);
         toast({ title: "Login successful", description: "Welcome back, Admin!" });
         return;
      }
      
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      // Map MongoDB's isVerified to frontend's verified and _id to id
      const mappedUser = { 
        ...data.user, 
        id: data.user._id || data.user.id, 
        verified: data.user.isVerified || data.user.verified || false 
      };
      
      setUser(mappedUser);
      toast({ title: "Login successful", description: "Welcome back!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Login failed", description: message, variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signup = async ({
  name,
  email,
  phone,
  dob,
  gender,
  maritalStatus,
  dependents,
  password,
}: {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: "Select" | "Male" | "Female";
  maritalStatus: "Select" | "Single" | "Married";
  dependents: string;
  password: string;
}): Promise<void> => {
  setIsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.some((u) => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: StoredUser = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      email,
      phone,
      verified: false,
      financialDataCollected: false,
      currentRole: null,
      password,
      dob,
      gender,
      maritalStatus,
      dependents,
    };

    localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    toast({ title: "Account created", description: "Please verify your account" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast({ title: "Signup failed", description: message, variant: "destructive" });
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = (): void => {
    setUser(null);
    toast({ title: "Logged out", description: "You have been logged out successfully" });
  };

  const setUserRole = (role: UserRole): void => {
    if (!user) return;

    const updatedUser: User = { ...user, currentRole: role };
    setUser(updatedUser);

    const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map((u) =>
      u.id === user.id ? { ...u, currentRole: role } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    toast({ title: "Role selected", description: `You are now in ${role} mode` });
  };

  const verifyOTP = async (otp: string, customEmail?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const emailToVerify = customEmail || user?.email;
      if (!emailToVerify) throw new Error("No email found for verification");

      const response = await fetch("http://localhost:5000/api/verify-otp", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email: emailToVerify, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid OTP");

      if (user) {
         const updatedUser: User = { ...user, verified: true };
         setUser(updatedUser);
      }
      
      toast({ title: "Verification successful", description: "Your account has been verified" });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Verification failed", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitFinancialData = async (financialData: FinancialData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!user) return false;

      const updatedUser: User = { ...user, financialDataCollected: true };
      setUser(updatedUser);

      const storedUsers: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = storedUsers.map((u) =>
        u.id === user.id ? { ...u, financialDataCollected: true, financialData } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem(`financial-${user.id}`, JSON.stringify(financialData));

      toast({ title: "Financial data submitted", description: "Your financial information has been saved" });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    setUserRole,
    verifyOTP,
    submitFinancialData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
