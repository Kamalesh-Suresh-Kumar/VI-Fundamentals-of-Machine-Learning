
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoan, LoanApplication } from "@/contexts/LoanContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, Search, Filter, AlertCircle } from "lucide-react";
import LoanCard from "@/components/LoanCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

type FilterState = {
  statuses: string[];
};

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const { borrowerApplications } = useLoan();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    statuses: ["pending", "approved"],
  });
  
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    totalLoanAmount: 0,
    totalApprovedAmount: 0,
  });

  // Apply filters and search
  useEffect(() => {
    let result = [...borrowerApplications];
    
    // Filter by status
    if (filters.statuses.length > 0) {
      result = result.filter(loan => filters.statuses.includes(loan.status));
    }
    
    // Filter by search query (purpose)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        loan => loan.purpose.toLowerCase().includes(query)
      );
    }
    
    setFilteredLoans(result);
  }, [borrowerApplications, filters, searchQuery]);

  // Calculate stats
  useEffect(() => {
    const activeLoans = borrowerApplications.filter(loan => loan.status !== 'canceled');
    setStats({
      totalLoans: activeLoans.length,
      pendingLoans: activeLoans.filter(loan => loan.status === "pending").length,
      approvedLoans: activeLoans.filter(loan => loan.status === "approved").length,
      totalLoanAmount: activeLoans.reduce((sum, loan) => sum + loan.amount, 0),
      totalApprovedAmount: activeLoans
        .filter(loan => loan.status === "approved")
        .reduce((sum, loan) => sum + loan.amount, 0),
    });
  }, [borrowerApplications]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Borrower Dashboard</h1>
            <p className="text-gray-600">
              Manage your loan applications and track their status.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/loan-application")} 
            className="bg-finance-secondary hover:bg-finance-primary"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Loan Application
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Approved Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalApprovedAmount)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Loan Application Summary</CardTitle>
            <CardDescription>
              Overview of your current loan applications and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-sm text-gray-500">{stats.pendingLoans} of {stats.totalLoans}</span>
                </div>
                <Progress value={(stats.pendingLoans / Math.max(stats.totalLoans, 1)) * 100} className="h-2 bg-gray-200" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Approved</span>
                  <span className="text-sm text-gray-500">{stats.approvedLoans} of {stats.totalLoans}</span>
                </div>
                <Progress value={(stats.approvedLoans / Math.max(stats.totalLoans, 1)) * 100} className="h-2 bg-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search applications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2">
                  <h4 className="font-medium mb-1">Status</h4>
                  <DropdownMenuCheckboxItem
                    checked={filters.statuses.includes("pending")}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        statuses: checked
                          ? [...prev.statuses, "pending"]
                          : prev.statuses.filter(s => s !== "pending")
                      }));
                    }}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.statuses.includes("approved")}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        statuses: checked
                          ? [...prev.statuses, "approved"]
                          : prev.statuses.filter(s => s !== "approved")
                      }));
                    }}
                  >
                    Approved
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.statuses.includes("rejected")}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        statuses: checked
                          ? [...prev.statuses, "rejected"]
                          : prev.statuses.filter(s => s !== "rejected")
                      }));
                    }}
                  >
                    Rejected
                  </DropdownMenuCheckboxItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {filteredLoans.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No loan applications</h3>
            <p className="text-gray-500 mt-1">
              You haven't created any loan applications yet.
            </p>
            <Button 
              onClick={() => navigate("/loan-application")} 
              className="mt-4 bg-finance-secondary hover:bg-finance-primary"
            >
              Create New Application
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                actionLabel="View Details"
                onAction={() => navigate(`/loan/${loan.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BorrowerDashboard;
