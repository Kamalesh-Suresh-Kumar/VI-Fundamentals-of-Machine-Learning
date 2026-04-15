
import React from "react";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  centered?: boolean;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backTo?: string; // Optional specific route to go back to
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true,
  centered = false,
  showBackButton = false,
  backButtonLabel = "Back",
  backTo
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1); // Go back one step in history
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <Header />}
      
      {showBackButton && (
        <div className="container mx-auto px-4 pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-1 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {backButtonLabel}
          </Button>
        </div>
      )}
      
      <main className={`flex-1 ${centered && !user ? 'flex items-center justify-center' : ''}`}>
        {children}
      </main>
      
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} LoanHarmony. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
