import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLoan } from "@/contexts/LoanContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, CreditCard, DollarSign, User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import MonthlyPayment from "@/components/MonthlyPayment";
import BorrowerFinancialDetails from "@/components/BorrowerFinancialDetails";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Loan {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'completed';
  createdAt: string;
  updatedAt: string;
  purpose: string;
  amount: number;
  term: number;
  creditScore: number;
  interestRate?: number;
  lenderId?: string;
  lenderName?: string;
  borrowerId: string;
  borrowerName: string;
  propertyDetails?: {
    address: string;
    type: string;
    value: number;
  };
  documents: string[];
  monthlyIncome?: number;
  employmentStatus?: string;
  yearsEmployed?: number;
  monthlyExpenses?: number;
  existingLoanAmount?: number;
  existingLoanPeriod?: number;
}

// Utility function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// LoanDetail Component
const LoanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getLoanApplication, updateLoanApplication, cancelLoanApplication } = useLoan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ML Evaluation State
  const [mlResults, setMlResults] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [mlInputs, setMlInputs] = useState({
    Rent_Payment_History: 'Good',
    Utility_Bill_Payments: 'Good',
    Spending_Patterns: 'Consistent',
    BNPL_Payment_History: 'N/A',
    Gig_Economy_Income: 'No',
    Behavioral_Data: 'Neutral',
    Current_Loans: 'No',
    Sources_of_Income: 'Primary',
    Debt_to_Income_Ratio: 0.30
  });

  useEffect(() => {
    if (loan) {
      // Auto-calculate Debt to Income Ratio
      let dti = 0;
      if (loan.monthlyIncome && loan.monthlyExpenses) {
        dti = parseFloat((loan.monthlyExpenses / loan.monthlyIncome).toFixed(2));
      }

      // Auto-calculate Current Loans from history
      let currentLoansStatus = 'No';
      if (loan.borrowerId) {
        const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
        const activeLoansCount = storedApplications.filter((app: any) => 
          app.borrowerId === loan.borrowerId && app.status === 'approved'
        ).length;
        
        if (activeLoansCount === 1) currentLoansStatus = 'Yes';
        if (activeLoansCount > 1) currentLoansStatus = 'Multiple';
      }

      setMlInputs(prev => ({ 
        ...prev, 
        Debt_to_Income_Ratio: dti > 0 ? dti : prev.Debt_to_Income_Ratio,
        Current_Loans: currentLoansStatus
      }));
    }
  }, [loan]);

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const borrowerUser = storedUsers.find((u: any) => u.id === loan.borrowerId);

      // Default string mapping functions
      const mapEmploymentStatus = (s: string) => {
        if (!s) return 'Salaried';
        s = s.toLowerCase();
        if (s.includes('self')) return 'Self-Employed';
        if (s.includes('unemployed')) return 'Unemployed';
        if (s.includes('retired')) return 'Retired';
        return 'Salaried';
      };

      const mapProperty = (s: string) => {
        if (!s) return 'Rented';
        if (s === 'residential') return 'Owned';
        if (s === 'commercial') return 'Commercial_Owned';
        return 'Rented';
      };

      // Best effort purpose mapping
      const purposeKeywords = ['Home', 'Education', 'Business', 'Personal', 'Vehicle', 'Medical', 'Travel', 'Debt_Consolidation', 'Wedding'];
      let matchedPurpose = 'Personal';
      for (const kw of purposeKeywords) {
        if (loan.purpose.toLowerCase().includes(kw.toLowerCase())) {
          matchedPurpose = kw; break;
        }
      }

      const payload = {
        Gender: borrowerUser?.gender === 'Select' ? 'Male' : borrowerUser?.gender || "Male",
        Marital_Status: borrowerUser?.maritalStatus === 'Select' ? 'Single' : borrowerUser?.maritalStatus || "Single",
        Number_of_Dependents: borrowerUser ? parseInt(borrowerUser.dependents || "0", 10) : 0,
        Monthly_Income: loan.monthlyIncome || 30000,
        Sources_of_Income: mlInputs.Sources_of_Income,
        Current_Loans: mlInputs.Current_Loans,
        Debt_to_Income_Ratio: mlInputs.Debt_to_Income_Ratio,
        Property_Ownership: mapProperty(loan.propertyDetails?.type),
        Employment_Status: mapEmploymentStatus(loan.employmentStatus),
        Job_Tenure_Work_Experience: loan.yearsEmployed || 2,
        Credit_Score: loan.creditScore || 650,
        Loan_Amount_Requested: loan.amount,
        Loan_Purpose: matchedPurpose,
        Desired_Loan_Tenure: loan.term,
        Rent_Payment_History: mlInputs.Rent_Payment_History,
        Utility_Bill_Payments: mlInputs.Utility_Bill_Payments,
        Spending_Patterns: mlInputs.Spending_Patterns,
        BNPL_Payment_History: mlInputs.BNPL_Payment_History,
        Gig_Economy_Income: mlInputs.Gig_Economy_Income,
        Behavioral_Data: mlInputs.Behavioral_Data,
        Date_of_Birth: borrowerUser?.dob || "1990-01-01"
      };

      const response = await fetch("http://localhost:5000/api/predict-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      setMlResults(result);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (id) {
      const loanData = getLoanApplication(id);
      setLoan(loanData);
      setIsLoading(false);
    }
  }, [id, getLoanApplication]);

  if (isLoading) {
    return (
      <Layout showBackButton>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!loan) {
    return (
      <Layout showBackButton>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loan Not Found</h2>
            <p className="text-gray-600 mb-6">The loan you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isUserLender = user?.currentRole === 'lender';
  const isUserBorrower = user?.currentRole === 'borrower';
  const isLoanPending = loan.status === 'pending';

  const handleApprove = async () => {
    const interestRate = 5 + Math.random() * 7; // Random between 5% and 12%
    await updateLoanApplication(loan.id, { 
      status: 'approved', 
      lenderId: user?.id, 
      lenderName: user?.name || user?.email?.split('@')[0] || 'Unknown Lender',
      interestRate: parseFloat(interestRate.toFixed(2))
    });
    setLoan({
      ...loan,
      status: 'approved',
      lenderId: user?.id,
      lenderName: user?.name || user?.email?.split('@')[0] || 'Unknown Lender',
      interestRate: parseFloat(interestRate.toFixed(2))
    });
  };

  const handleReject = async () => {
    await updateLoanApplication(loan.id, { status: 'rejected' });
    setLoan({ ...loan, status: 'rejected' });
  };

  const handleCancel = async () => {
    await cancelLoanApplication(loan.id);
    navigate("/dashboard");
  };

  const getLoanStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate total repayment amount
  const calculateTotalRepayment = () => {
    if (!loan.interestRate) return loan.amount;
    const monthlyPayment = (loan.amount * (loan.interestRate / 100 / 12) * Math.pow(1 + loan.interestRate / 100 / 12, loan.term)) / 
                         (Math.pow(1 + loan.interestRate / 100 / 12, loan.term) - 1);
    return monthlyPayment * loan.term;
  };

  // Calculate final payment date
  const calculateFinalPaymentDate = () => {
    const updatedDate = new Date(loan.updatedAt);
    // Add loan term months to the updated date
    updatedDate.setMonth(updatedDate.getMonth() + loan.term);
    return formatDate(updatedDate.toISOString());
  };

  return (
    <Layout showBackButton>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Loan Application</h1>
                {getLoanStatusBadge(loan.status)}
              </div>
              <p className="text-gray-600">
                Application #{loan.id.substring(0, 8)} • Created on {formatDate(loan.createdAt)}
              </p>
            </div>
            
            {/* Conditional actions based on user role and loan status */}
            {isUserLender && isLoanPending && (
              <div className="flex gap-3">
                <Button 
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
            
            {isUserBorrower && isLoanPending && (
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Application
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Purpose</p>
                      <p className="font-medium">{loan.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loan Amount</p>
                      <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Term</p>
                      <p className="font-medium">{loan.term} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Credit Score</p>
                      <p className="font-medium">{loan.creditScore}</p>
                    </div>
                    {loan.status === 'approved' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="font-medium">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Repayment</p>
                          <p className="font-medium">
                            ₹{calculateTotalRepayment().toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ML Risk Evaluation Card */}
              {isUserLender && isLoanPending && (
                <Card className="border-indigo-600 overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b pb-4">
                    <CardTitle className="flex justify-between items-center text-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                        ML Risk Evaluation
                      </div>
                      {mlResults && (
                        <Badge variant="outline" className={
                          mlResults.decision === "APPROVE" ? "bg-green-100 text-green-800" : 
                          mlResults.decision === "REVIEW" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800"
                        }>
                          {mlResults.decision}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {!mlResults ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Please provide any missing qualitative details to evaluate this application with our AI Models.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Rent Payment History</label>
                            <Select value={mlInputs.Rent_Payment_History} onValueChange={(v) => setMlInputs({...mlInputs, Rent_Payment_History: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Average">Average</SelectItem>
                                <SelectItem value="Poor">Poor</SelectItem>
                                <SelectItem value="N/A">N/A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Utility Bill Payments</label>
                            <Select value={mlInputs.Utility_Bill_Payments} onValueChange={(v) => setMlInputs({...mlInputs, Utility_Bill_Payments: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Average">Average</SelectItem>
                                <SelectItem value="Poor">Poor</SelectItem>
                                <SelectItem value="N/A">N/A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Spending Patterns</label>
                            <Select value={mlInputs.Spending_Patterns} onValueChange={(v) => setMlInputs({...mlInputs, Spending_Patterns: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Consistent">Consistent</SelectItem>
                                <SelectItem value="Erratic">Erratic</SelectItem>
                                <SelectItem value="Impulsive">Impulsive</SelectItem>
                                <SelectItem value="Cautious">Cautious</SelectItem>
                                <SelectItem value="Aggressive">Aggressive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Behavioral Data</label>
                            <Select value={mlInputs.Behavioral_Data} onValueChange={(v) => setMlInputs({...mlInputs, Behavioral_Data: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Positive">Positive</SelectItem>
                                <SelectItem value="Neutral">Neutral</SelectItem>
                                <SelectItem value="Negative">Negative</SelectItem>
                                <SelectItem value="Very_Positive">Very Positive</SelectItem>
                                <SelectItem value="Very_Negative">Very Negative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Debt to Income Ratio</label>
                            <Input 
                              type="number" step="0.01" 
                              value={mlInputs.Debt_to_Income_Ratio} 
                              readOnly
                              className="bg-gray-50 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Gig Economy Income</label>
                            <Select value={mlInputs.Gig_Economy_Income} onValueChange={(v) => setMlInputs({...mlInputs, Gig_Economy_Income: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Current Loans</label>
                            <Select value={mlInputs.Current_Loans} disabled>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="Multiple">Multiple</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Sources of Income</label>
                            <Select value={mlInputs.Sources_of_Income} onValueChange={(v) => setMlInputs({...mlInputs, Sources_of_Income: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Primary">Primary</SelectItem>
                                <SelectItem value="Secondary">Secondary</SelectItem>
                                <SelectItem value="Multiple">Multiple</SelectItem>
                                <SelectItem value="Pension">Pension</SelectItem>
                                <SelectItem value="Investments">Investments</SelectItem>
                                <SelectItem value="Rental_Income">Rental Income</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button 
                          onClick={handleRunEvaluation} 
                          disabled={isEvaluating}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2 text-white"
                        >
                          {isEvaluating ? "Analyzing..." : "Run ML Evaluation"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { name: "CatBoost (Pri)", data: mlResults.model_outputs?.catboost || { probability: 0 } },
                            { name: "XGBoost", data: mlResults.model_outputs?.xgboost || { probability: 0 }  },
                            { name: "Random Forest", data: mlResults.model_outputs?.random_forest || { probability: 0 }  },
                            { name: "Logistic Reg", data: mlResults.model_outputs?.logistic_regression || { probability: 0 }  },
                          ].map((model, idx) => (
                            <div key={idx} className="border rounded-md p-3 text-center bg-white shadow-sm">
                              <p className="text-xs font-semibold text-gray-500 mb-1">{model.name}</p>
                              <p className="text-lg font-bold">{(model.data.probability * 100).toFixed(1)}%</p>
                              <p className="text-[10px] uppercase text-gray-400">Approval Prob</p>
                              <Progress value={model.data.probability * 100} className="h-1.5 mt-2" />
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setMlResults(null)}>
                          Re-evaluate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Show BorrowerFinancialDetails component for borrowers with pending loans */}
              {isUserBorrower && isLoanPending && (
                <BorrowerFinancialDetails loanId={loan.id} existingData={loan} />
              )}

              {loan.propertyDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{loan.propertyDetails.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-medium">{loan.propertyDetails.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Value</p>
                        <p className="font-medium">₹{loan.propertyDetails.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial details - now visible to all roles */}
              {(loan.monthlyIncome || loan.employmentStatus) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Borrower Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loan.monthlyIncome && (
                        <div>
                          <p className="text-sm text-gray-500">Monthly Income</p>
                          <p className="font-medium">₹{loan.monthlyIncome.toLocaleString()}</p>
                        </div>
                      )}
                      {loan.employmentStatus && (
                        <div>
                          <p className="text-sm text-gray-500">Employment Status</p>
                          <p className="font-medium">{loan.employmentStatus}</p>
                        </div>
                      )}
                      {loan.yearsEmployed && (
                        <div>
                          <p className="text-sm text-gray-500">Years at Current Job</p>
                          <p className="font-medium">{loan.yearsEmployed} years</p>
                        </div>
                      )}
                      {loan.monthlyExpenses && (
                        <div>
                          <p className="text-sm text-gray-500">Monthly Expenses</p>
                          <p className="font-medium">₹{loan.monthlyExpenses.toLocaleString()}</p>
                        </div>
                      )}
                      {(loan.existingLoanAmount !== undefined && loan.existingLoanAmount !== null) && (
                        <div>
                          <p className="text-sm text-gray-500">Existing Loan Amount</p>
                          <p className="font-medium">₹{loan.existingLoanAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {(loan.existingLoanPeriod !== undefined && loan.existingLoanPeriod !== null) && (
                        <div>
                          <p className="text-sm text-gray-500">Existing Loan Period</p>
                          <p className="font-medium">{loan.existingLoanPeriod} months</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents section */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {loan.documents && loan.documents.length > 0 ? (
                    <ul className="space-y-2">
                      {loan.documents.map((doc: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">•</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No documents attached</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Borrower</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-3 mr-4">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{loan.borrowerName}</p>
                      <p className="text-sm text-gray-500">Borrower</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loan.lenderId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Lender</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-3 mr-4">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{loan.lenderName}</p>
                        <p className="text-sm text-gray-500">Lender</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Monthly payment component - visible for both borrower and lender */}
              {loan.status === 'approved' && (
                <MonthlyPayment loan={loan} />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="bg-green-500 rounded-full h-3 w-3"></div>
                      <div className="bg-gray-200 flex-grow w-0.5 my-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">Application Created</p>
                      <p className="text-sm text-gray-500">{formatDate(loan.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`rounded-full h-3 w-3 ${
                        loan.status === 'pending' ? 'bg-yellow-500' :
                        loan.status === 'approved' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      {loan.status !== 'pending' && (
                        <div className="bg-gray-200 flex-grow w-0.5 my-1"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {loan.status === 'pending' ? 'Pending Review' :
                         loan.status === 'approved' ? 'Application Approved' :
                         loan.status === 'rejected' ? 'Application Rejected' :
                         'Application Canceled'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {loan.status === 'pending' ? 'In progress' : formatDate(loan.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {loan.status === 'approved' && (
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="bg-gray-300 rounded-full h-3 w-3"></div>
                      </div>
                      <div>
                        <p className="font-medium">Final Payment Due</p>
                        <p className="text-sm text-gray-500">{calculateFinalPaymentDate()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanDetail;
