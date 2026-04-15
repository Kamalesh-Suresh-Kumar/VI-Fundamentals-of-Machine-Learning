
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoan } from "@/contexts/LoanContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import Layout from "@/components/Layout";
import LoanCard from "@/components/LoanCard";
import { Shield, Users, ChartPie } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { lenderApplications, borrowerApplications } = useLoan();
  const navigate = useNavigate();
  
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalAmount: 0,
  });
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.currentRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Calculate loan statistics
  useEffect(() => {
    const allLoans = [...lenderApplications, ...borrowerApplications];
    
    // Remove duplicates based on loan ID
    const uniqueLoans = allLoans.filter((loan, index, self) =>
      index === self.findIndex((l) => l.id === loan.id)
    );
    
    const stats = {
      totalLoans: uniqueLoans.length,
      pendingLoans: uniqueLoans.filter(loan => loan.status === 'pending').length,
      approvedLoans: uniqueLoans.filter(loan => loan.status === 'approved').length,
      rejectedLoans: uniqueLoans.filter(loan => loan.status === 'rejected').length,
      totalAmount: uniqueLoans.reduce((sum, loan) => sum + loan.amount, 0),
    };
    
    setLoanStats(stats);
  }, [lenderApplications, borrowerApplications]);
  
  // Get real loan data for charts
  const getPieChartData = () => {
    return [
      { name: 'Pending', value: loanStats.pendingLoans, color: '#FFCA28' },
      { name: 'Approved', value: loanStats.approvedLoans, color: '#66BB6A' },
      { name: 'Rejected', value: loanStats.rejectedLoans, color: '#EF5350' },
    ].filter(item => item.value > 0);
  };

  // Get loan purpose distribution data
  const getBarChartData = () => {
    const allLoans = [...lenderApplications, ...borrowerApplications];
    const uniqueLoans = allLoans.filter((loan, index, self) =>
      index === self.findIndex((l) => l.id === loan.id)
    );

    // Group loans by purpose and sum amounts
    const purposeMap = new Map();
    uniqueLoans.forEach(loan => {
      const purpose = loan.purpose || 'Other';
      if (purposeMap.has(purpose)) {
        purposeMap.set(purpose, purposeMap.get(purpose) + loan.amount);
      } else {
        purposeMap.set(purpose, loan.amount);
      }
    });

    // Convert map to array of objects
    return Array.from(purposeMap, ([name, amount]) => ({ name, amount }));
  };

  // Generate time series data based on loan creation dates
  const getTimeSeriesData = () => {
    const allLoans = [...lenderApplications, ...borrowerApplications];
    const uniqueLoans = allLoans.filter((loan, index, self) =>
      index === self.findIndex((l) => l.id === loan.id)
    );

    // Group by month
    const monthlyData = new Map();
    uniqueLoans.forEach(loan => {
      const date = new Date(loan.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          name: monthName,
          amount: monthlyData.get(monthKey).amount + loan.amount
        });
      } else {
        monthlyData.set(monthKey, { name: monthName, amount: loan.amount });
      }
    });

    // Convert to array and sort by month
    return Array.from(monthlyData.values());
  };
  
  // Data for charts
  const pieData = getPieChartData();
  const barData = getBarChartData();
  const timeData = getTimeSeriesData();
  
  // Check if there is any loan activity
  const hasLoanActivity = pieData.length > 0;
  
  // Format currency
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex mt-4 sm:mt-0 gap-2">
            <Button asChild className="bg-finance-secondary hover:bg-finance-primary">
              <Link to="/user-management">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Loans</CardDescription>
              <CardTitle className="text-2xl">{loanStats.totalLoans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                All loan applications on platform
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-2xl">{loanStats.pendingLoans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Loans awaiting approval
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved Loans</CardDescription>
              <CardTitle className="text-2xl">{loanStats.approvedLoans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Successfully approved loans
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(loanStats.totalAmount)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Combined value of all loans
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Status Distribution</CardTitle>
              <CardDescription>Breakdown of current loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {hasLoanActivity ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} loans`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <ChartPie className="h-16 w-16 mb-2 opacity-30" />
                    <p>No loan activity to display</p>
                    <p className="text-sm mt-1">No real-time loan applications available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Loan Amount by Time</CardTitle>
              <CardDescription>Total value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {hasLoanActivity && timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        name="Loan Amount" 
                        stroke="#6C63FF" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <ChartPie className="h-16 w-16 mb-2 opacity-30" />
                    <p>No loan activity to display</p>
                    <p className="text-sm mt-1">No real-time loan application data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Loan Management */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Loans</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lenderApplications.length > 0 ? (
                lenderApplications.map((loan) => (
                  <LoanCard 
                    key={loan.id}
                    loan={loan}
                    onAction={() => navigate(`/loan/${loan.id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No real-time loan applications found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lenderApplications.filter(loan => loan.status === 'pending').length > 0 ? (
                lenderApplications
                  .filter(loan => loan.status === 'pending')
                  .map((loan) => (
                    <LoanCard 
                      key={loan.id}
                      loan={loan}
                      onAction={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No real-time pending loan applications</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lenderApplications.filter(loan => loan.status === 'approved').length > 0 ? (
                lenderApplications
                  .filter(loan => loan.status === 'approved')
                  .map((loan) => (
                    <LoanCard 
                      key={loan.id}
                      loan={loan}
                      onAction={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No real-time approved loan applications</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lenderApplications.filter(loan => loan.status === 'rejected').length > 0 ? (
                lenderApplications
                  .filter(loan => loan.status === 'rejected')
                  .map((loan) => (
                    <LoanCard 
                      key={loan.id}
                      loan={loan}
                      onAction={() => navigate(`/loan/${loan.id}`)}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No real-time rejected loan applications</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
