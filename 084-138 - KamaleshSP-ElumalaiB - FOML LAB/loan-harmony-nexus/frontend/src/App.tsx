
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoanProvider } from "@/contexts/LoanContext";


import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import FinancialData from "./pages/FinancialData";
import RoleSelection from "./pages/RoleSelection";
import LenderDashboard from "./pages/LenderDashboard";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoanApplication from "./pages/LoanApplication";
import LoanDetail from "./pages/LoanDetail";
import NotFound from "./pages/NotFound";
import Dashboard from "./components/Dashboard";
import UserManagement from "./pages/UserManagement";


const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.verified) {
    return <Navigate to="/verify" replace />;
  }
  
  // Remove financial data check since we'll collect it during loan application
  if (!user?.currentRole) {
    return <Navigate to="/role-selection" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LoanProvider>
          <>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify" element={<VerifyOTP />} />
                {/* Make financial data route protected and optional */}
                <Route path="/financial-data" element={
                  <ProtectedRoute>
                    <FinancialData />
                  </ProtectedRoute>
                } />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/lender" element={
                  <ProtectedRoute>
                    <LenderDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/borrower" element={
                  <ProtectedRoute>
                    <BorrowerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                {/* Add new user management route for admins */}
                <Route path="/user-management" element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                } />

                <Route path="/loan-application" element={
                  <ProtectedRoute>
                    <LoanApplication />
                  </ProtectedRoute>
                } />
                <Route path="/loan/:id" element={
                  <ProtectedRoute>
                    <LoanDetail />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </>
        </LoanProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
