
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { UserIcon, BriefcaseIcon } from "lucide-react";
import { useLoan } from "@/contexts/LoanContext";
import { useEffect, useCallback } from "react";

const RoleSelection = () => {
  const { setUserRole, isLoading, user } = useAuth();
  const { borrowerApplications } = useLoan();
  const navigate = useNavigate();

  const handleRoleSelection = useCallback((role: 'admin' | 'lender' | 'borrower') => {
    localStorage.setItem('role_switch', 'true');
    setUserRole(role);
    navigate("/dashboard");
  }, [setUserRole, navigate]);

  useEffect(() => {
    if (user?.email === "admin@example.com") {
      handleRoleSelection("admin");
    }
  }, [user, handleRoleSelection]);

  if (user?.email === "admin@example.com") {
    return null;
  }

  return (
    <Layout showBackButton backTo="/dashboard">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold">Choose Your Role</h1>
            <p className="text-gray-600 mt-2">
              Select whether you want to act as a lender or borrower for this session
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-2 hover:border-finance-secondary transition-colors cursor-pointer">
              <div className="p-6 bg-finance-light">
                <BriefcaseIcon className="w-16 h-16 text-finance-primary mx-auto" />
              </div>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Lender</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    View potential borrowers and their loan requests
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Evaluate borrower credit reliability
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Approve or reject loan applications
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    View past loan history
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-finance-secondary hover:bg-finance-primary"
                  onClick={() => handleRoleSelection("lender")}
                  disabled={isLoading}
                >
                  Continue as Lender
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-2 hover:border-finance-primary transition-colors cursor-pointer">
              <div className="p-6 bg-finance-light">
                <UserIcon className="w-16 h-16 text-finance-secondary mx-auto" />
              </div>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Borrower</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Browse available lenders and their terms
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    View lender reviews and ratings
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Submit loan applications
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Track your application status
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-finance-primary hover:bg-finance-secondary"
                  onClick={() => handleRoleSelection("borrower")}
                  disabled={isLoading}
                >
                  Continue as Borrower
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoleSelection;
