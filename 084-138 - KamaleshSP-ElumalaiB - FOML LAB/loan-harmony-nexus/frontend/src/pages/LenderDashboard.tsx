
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoan, LoanApplication } from "@/contexts/LoanContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Search, Filter, AlertCircle } from "lucide-react";
import LoanCard from "@/components/LoanCard";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type FilterState = {
  statuses: string[];
  minAmount: number;
  maxAmount: number;
  minCreditScore: number;
};

const LenderDashboard = () => {
  const { user } = useAuth();
  const { lenderApplications, predictCreditReliability } = useLoan();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    statuses: ["pending"],
    minAmount: 0,
    maxAmount: 1000000,
    minCreditScore: 0,
  });
  
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [activeTab, setActiveTab] = useState("available");

  // Stats
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    totalLoanAmount: 0,
  });

  // Apply filters and search
  useEffect(() => {
    let result = [...lenderApplications];
    
    // Filter by status
    if (filters.statuses.length > 0 && activeTab !== "my-loans") {
      result = result.filter(loan => filters.statuses.includes(loan.status));
    }
    
    // Filter by amount
    result = result.filter(
      loan => loan.amount >= filters.minAmount && loan.amount <= filters.maxAmount
    );
    
    // Filter by credit score
    result = result.filter(loan => loan.creditScore >= filters.minCreditScore);
    
    // Filter by search query (borrower name, loan purpose)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        loan =>
          loan.borrowerName.toLowerCase().includes(query) ||
          loan.purpose.toLowerCase().includes(query)
      );
    }
    
    // Filter by active tab
    if (activeTab === "available") {
      result = result.filter(loan => !loan.lenderId);
    } else if (activeTab === "my-loans") {
      result = result.filter(loan => loan.lenderId === user?.id);
    }
    
    setFilteredLoans(result);
  }, [lenderApplications, filters, searchQuery, activeTab, user?.id]);

  // Calculate stats
  useEffect(() => {
    const myLoans = lenderApplications.filter(loan => loan.lenderId === user?.id);
    
    setStats({
      totalLoans: myLoans.length,
      pendingLoans: myLoans.filter(loan => loan.status === "pending").length,
      approvedLoans: myLoans.filter(loan => loan.status === "approved").length,
      totalLoanAmount: myLoans.reduce((sum, loan) => sum + loan.amount, 0),
    });
  }, [lenderApplications, user?.id]);

  // Determine reliability class
  const getReliabilityClass = (score: number) => {
    if (score >= 750) return "bg-green-100 text-green-800";
    if (score >= 650) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lender Dashboard</h1>
          <p className="text-gray-600">
            Manage your loan portfolio and discover new lending opportunities.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Amount Lent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalLoanAmount)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} className="mb-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="available">Available Loans</TabsTrigger>
            <TabsTrigger value="my-loans">My Loans</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search loans..."
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
                  </div>
                  <Separator />
                  <div className="p-2">
                    <h4 className="font-medium mb-1">Min Credit Score</h4>
                    <div className="grid grid-cols-3 gap-1">
                      {[600, 700, 750].map(score => (
                        <Button
                          key={score}
                          variant={filters.minCreditScore === score ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setFilters(prev => ({ ...prev, minCreditScore: score }))}
                        >
                          {score}+
                        </Button>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <TabsContent value="available">
            {filteredLoans.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No available loans</h3>
                <p className="text-gray-500 mt-1">
                  There are no loan applications matching your criteria at the moment.
                </p>
                <Button 
                  className="bg-finance-secondary hover:bg-finance-primary mt-4"
                  onClick={() => {
                    setActiveTab("my-loans");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  View My Approved Loans
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLoans.map((loan) => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      actionLabel="View Application"
                      onAction={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button 
                    className="bg-finance-secondary hover:bg-finance-primary flex items-center gap-2 group"
                    onClick={() => {
                      setActiveTab("my-loans");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    View My Approved Loans
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-loans">
            {filteredLoans.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No loans found</h3>
                <p className="text-gray-500 mt-1">
                  You haven't approved any loan applications yet.
                </p>
                <Button 
                  className="bg-finance-secondary hover:bg-finance-primary mt-4"
                  onClick={() => {
                    setActiveTab("available");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Browse Available Loans
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
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
                <div className="flex justify-center pt-4">
                    <Button 
                      className="bg-finance-secondary hover:bg-finance-primary flex items-center gap-2 group"
                      onClick={() => {
                        setActiveTab("available");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Browse More Available Loans
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LenderDashboard;
