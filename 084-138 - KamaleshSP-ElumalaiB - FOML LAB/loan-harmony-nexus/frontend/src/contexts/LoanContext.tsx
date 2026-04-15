import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export interface LoanApplication {
  id: string;
  borrowerId: string;
  borrowerName: string;
  lenderId?: string;
  lenderName?: string;
  amount: number;
  purpose: string;
  term: number;
  interestRate?: number;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'completed';
  creditScore: number;
  propertyDetails?: {
    address: string;
    value: number;
    type: string;
  };
  documents: string[];
  createdAt: string;
  updatedAt: string;
  monthlyPayment?: number;
  paidMonths?: number;
  // Additional borrower financial details
  monthlyIncome?: number;
  employmentStatus?: string;
  yearsEmployed?: number;
  existingLoanAmount?: number;
  existingLoanPeriod?: number;
  monthlyExpenses?: number;
}

export interface LoanOffer {
  id: string;
  lenderId: string;
  lenderName: string;
  loanApplicationId: string;
  interestRate: number;
  term: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  fromUserId: string;
  toUserId: string;
}

interface LoanContextType {
  borrowerApplications: LoanApplication[];
  lenderApplications: LoanApplication[];
  loanOffers: LoanOffer[];
  payments: PaymentRecord[];
  createLoanApplication: (application: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'monthlyPayment' | 'paidMonths'>) => Promise<void>;
  createLoanOffer: (offer: Omit<LoanOffer, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateLoanApplication: (id: string, updates: Partial<LoanApplication>) => Promise<void>;
  updateLoanOffer: (id: string, updates: Partial<LoanOffer>) => Promise<void>;
  getLoanApplication: (id: string) => LoanApplication | undefined;
  getLoanOffer: (id: string) => LoanOffer | undefined;
  cancelLoanApplication: (id: string) => Promise<void>;
  predictCreditReliability: (borrowerId: string) => Promise<{ isReliable: boolean; score: number; }>;
  makePayment: (loanId: string, amount: number) => Promise<void>;
  getMonthlyPaymentAmount: (loanId: string) => number;
  updateBorrowerFinancialDetails: (loanId: string, details: Partial<LoanApplication>) => Promise<void>;
  getExistingLoansCalculations: (borrowerId: string) => { existingLoanAmount: number, existingLoanPeriod: number };
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [borrowerApplications, setBorrowerApplications] = useState<LoanApplication[]>([]);
  const [lenderApplications, setLenderApplications] = useState<LoanApplication[]>([]);
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Load existing loan data from localStorage
  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    const storedOffers = JSON.parse(localStorage.getItem('loanOffers') || '[]');
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    if (user) {
      // Check if we're switching roles
      const isRoleSwitch = localStorage.getItem('role_switch') === 'true';
      if (isRoleSwitch) {
        localStorage.removeItem('role_switch');
      }
      
      // Filter applications based on user role
      if (user.currentRole === 'borrower') {
        // As a borrower, only show applications created by this user
        setBorrowerApplications(storedApplications.filter((app: LoanApplication) => app.borrowerId === user.id));
        setLenderApplications([]);
      } else if (user.currentRole === 'lender') {
        // As a lender, show all applications EXCEPT those where this user is the borrower or the application is canceled
        setLenderApplications(storedApplications.filter((app: LoanApplication) => 
          app.borrowerId !== user.id && app.status !== 'canceled' // Filter out loans where the user is the borrower or the loan is canceled
        ));
        setBorrowerApplications([]);
      } else {
        // Admin sees all applications
        setBorrowerApplications(storedApplications);
        setLenderApplications(storedApplications);
      }
      
      // Filter offers based on user role
      setLoanOffers(storedOffers.filter((offer: LoanOffer) => 
        user.currentRole === 'lender' ? offer.lenderId === user.id : 
        user.currentRole === 'borrower' ? 
          borrowerApplications.some(app => app.id === offer.loanApplicationId) :
          true // Admin sees all offers
      ));

      // Filter payments based on user role
      setPayments(storedPayments.filter((payment: PaymentRecord) => 
        payment.fromUserId === user.id || payment.toUserId === user.id
      ));
    } else {
      setBorrowerApplications([]);
      setLenderApplications([]);
      setLoanOffers([]);
      setPayments([]);
    }
  }, [user, user?.currentRole]);

  const createLoanApplication = async (application: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'monthlyPayment' | 'paidMonths'>) => {
    if (!user) return;
    
    // Create a new loan application
    const newApplication: LoanApplication = {
      ...application,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sync with MongoDB backend
    try {
      await fetch("http://localhost:5000/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newApplication.id,
          borrowerId: newApplication.borrowerId,
          borrowerName: newApplication.borrowerName,
          amount: newApplication.amount,
          loanAmount: newApplication.amount,
          purpose: newApplication.purpose,
          loanType: newApplication.purpose,
          term: newApplication.term,
          durationMonths: newApplication.term,
          interestRate: newApplication.interestRate || 5,
          status: newApplication.status,
          creditScore: newApplication.creditScore,
          monthlyIncome: newApplication.monthlyIncome,
          employmentStatus: newApplication.employmentStatus,
          yearsEmployed: newApplication.yearsEmployed,
          existingLoanAmount: newApplication.existingLoanAmount,
          existingLoanPeriod: newApplication.existingLoanPeriod,
          monthlyExpenses: newApplication.monthlyExpenses,
          propertyDetails: newApplication.propertyDetails,
          paidMonths: 0
        }),
      });
    } catch (error) {
      console.error("Failed to sync loan to backend database:", error);
    }
    
    // Save to mock database
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    localStorage.setItem('loanApplications', JSON.stringify([...storedApplications, newApplication]));
    
    // Update local state
    if (user.currentRole === 'borrower') {
      setBorrowerApplications(prev => [...prev, newApplication]);
    } else {
      setLenderApplications(prev => [...prev, newApplication]);
    }
    
    toast({
      title: "Loan application created",
      description: `Application #${newApplication.id.slice(0, 6)} has been submitted`,
    });
  };

  const createLoanOffer = async (offer: Omit<LoanOffer, 'id' | 'createdAt' | 'status'>) => {
    if (!user || user.currentRole !== 'lender') return;
    
    // Create a new loan offer
    const newOffer: LoanOffer = {
      ...offer,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Save to mock database
    const storedOffers = JSON.parse(localStorage.getItem('loanOffers') || '[]');
    localStorage.setItem('loanOffers', JSON.stringify([...storedOffers, newOffer]));
    
    // Update local state
    setLoanOffers(prev => [...prev, newOffer]);
    
    toast({
      title: "Loan offer created",
      description: `Offer #${newOffer.id.slice(0, 6)} has been sent to the borrower`,
    });
  };

  const updateLoanApplication = async (id: string, updates: Partial<LoanApplication>) => {
    // Update loan application in mock database
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    const updatedApplications = storedApplications.map((app: LoanApplication) => 
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    );
    localStorage.setItem('loanApplications', JSON.stringify(updatedApplications));
    
    // Update local state
    if (user?.currentRole === 'borrower') {
      setBorrowerApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
      ));
    } else {
      setLenderApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
      ));
    }
    
    // Sync update to backend
    try {
      await fetch(`http://localhost:5000/api/loans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to sync loan update to backend database:", error);
    }

    toast({
      title: "Loan application updated",
      description: `Application #${id.slice(0, 6)} has been updated`,
    });
  };

  const updateLoanOffer = async (id: string, updates: Partial<LoanOffer>) => {
    // Update loan offer in mock database
    const storedOffers = JSON.parse(localStorage.getItem('loanOffers') || '[]');
    const updatedOffers = storedOffers.map((offer: LoanOffer) => 
      offer.id === id ? { ...offer, ...updates } : offer
    );
    localStorage.setItem('loanOffers', JSON.stringify(updatedOffers));
    
    // Update local state
    setLoanOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, ...updates } : offer
    ));
    
    toast({
      title: "Loan offer updated",
      description: `Offer #${id.slice(0, 6)} has been updated`,
    });
  };

  // Modified getLoanApplication to properly hide/show loans based on user role
  const getLoanApplication = (id: string): LoanApplication | undefined => {
    // First check in stored applications
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    let foundApp = storedApplications.find((app: LoanApplication) => app.id === id);
    
    if (!foundApp) return undefined;
    
    // Hide the loan if user is the borrower but is in lender mode
    if (user?.currentRole === 'lender' && foundApp.borrowerId === user.id) {
      return undefined;
    }
    
    return foundApp;
  };

  const getLoanOffer = (id: string): LoanOffer | undefined => {
    // First check local state
    const found = loanOffers.find(offer => offer.id === id);
    if (found) return found;
    
    // If not found, check in the mock database
    const storedOffers = JSON.parse(localStorage.getItem('loanOffers') || '[]');
    return storedOffers.find((offer: LoanOffer) => offer.id === id);
  };

  const cancelLoanApplication = async (id: string) => {
    // Update loan application status to canceled
    await updateLoanApplication(id, { status: 'canceled' });
    
    // Delete all related loan offers
    const relatedOffers = loanOffers.filter(offer => offer.loanApplicationId === id);
    const storedOffers = JSON.parse(localStorage.getItem('loanOffers') || '[]');
    const updatedOffers = storedOffers.filter((offer: LoanOffer) => offer.loanApplicationId !== id);
    localStorage.setItem('loanOffers', JSON.stringify(updatedOffers));
    
    // Update local state
    setLoanOffers(prev => prev.filter(offer => offer.loanApplicationId !== id));
    
    toast({
      title: "Loan application canceled",
      description: `Application #${id.slice(0, 6)} and all related offers have been canceled`,
    });
  };

  const predictCreditReliability = async (borrowerId: string): Promise<{ isReliable: boolean; score: number; }> => {
    // Mock credit prediction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get user financial data
    const financialData = JSON.parse(localStorage.getItem(`financial-${borrowerId}`) || '{}');
    
    // Simple algorithm for demo: higher income and credit score means more reliable
    const income = financialData.annualIncome || 0;
    const creditScore = financialData.creditScore || 0;
    
    // Calculate a reliability score (0-100)
    const score = Math.min(100, (income / 100000) * 40 + (creditScore / 850) * 60);
    
    // Consider reliable if score > 60
    const isReliable = score > 60;
    
    return { isReliable, score };
  };

  // Calculate monthly payment amount for a loan
  const getMonthlyPaymentAmount = (loanId: string): number => {
    const loan = getLoanApplication(loanId);
    if (!loan || !loan.interestRate) return 0;
    
    // Simple monthly payment formula: P = (A * r * (1 + r)^n) / ((1 + r)^n - 1)
    // Where A is loan amount, r is monthly interest rate, n is number of months
    const principal = loan.amount;
    const monthlyRate = (loan.interestRate / 100) / 12;
    const numberOfPayments = loan.term;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  };

  // Make a payment for a loan
  const makePayment = async (loanId: string, amount: number) => {
    if (!user) return;
    
    const loan = getLoanApplication(loanId);
    if (!loan) throw new Error("Loan not found");
    
    const payment: PaymentRecord = {
      id: Math.random().toString(36).substring(2, 11),
      loanId,
      amount,
      date: new Date().toISOString(),
      fromUserId: user.currentRole === 'borrower' ? user.id : loan.lenderId || '',
      toUserId: user.currentRole === 'lender' ? user.id : loan.borrowerId || ''
    };
    
    // Save payment to mock database
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    localStorage.setItem('payments', JSON.stringify([...storedPayments, payment]));
    
    // Update local state
    setPayments(prev => [...prev, payment]);
    
    // Update loan with paid months
    const paidMonths = (loan.paidMonths || 0) + 1;
    await updateLoanApplication(loanId, { paidMonths });
    
    // Show toast notification
    toast({
      title: "Payment successful",
      description: `You've successfully paid ${amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`
    });
    
    // Show toast notification to both parties
    sonnerToast.success("Payment Transferred", {
      description: `${amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} payment has been processed for loan #${loanId.slice(0, 6)}`,
      position: "top-center"
    });
  };

  // New function to update borrower financial details
  const updateBorrowerFinancialDetails = async (loanId: string, details: Partial<LoanApplication>) => {
    // Update loan application in mock database
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    const updatedApplications = storedApplications.map((app: LoanApplication) => 
      app.id === loanId ? { ...app, ...details, updatedAt: new Date().toISOString() } : app
    );
    localStorage.setItem('loanApplications', JSON.stringify(updatedApplications));
    
    // Update local state
    if (user?.currentRole === 'borrower') {
      setBorrowerApplications(prev => prev.map(app => 
        app.id === loanId ? { ...app, ...details, updatedAt: new Date().toISOString() } : app
      ));
    } else {
      setLenderApplications(prev => prev.map(app => 
        app.id === loanId ? { ...app, ...details, updatedAt: new Date().toISOString() } : app
      ));
    }
    
    toast({
      title: "Financial details updated",
      description: `Your financial information has been saved successfully`,
    });
  };

  // Calculate existing loans for auto-fill
  const getExistingLoansCalculations = (borrowerId: string) => {
    const storedApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
    const activeLoans = storedApplications.filter((app: LoanApplication) => 
      app.borrowerId === borrowerId && app.status === 'approved'
    );
    
    let totalAmount = 0;
    let maxRemainingPeriod = 0;
    
    activeLoans.forEach((loan: LoanApplication) => {
      totalAmount += loan.amount;
      
      const remainingTerm = loan.term - (loan.paidMonths || 0);
      if (remainingTerm > maxRemainingPeriod) {
        maxRemainingPeriod = remainingTerm;
      }
    });
    
    return {
      existingLoanAmount: totalAmount,
      existingLoanPeriod: maxRemainingPeriod
    };
  };

  const value = {
    borrowerApplications,
    lenderApplications,
    loanOffers,
    payments,
    createLoanApplication,
    createLoanOffer,
    updateLoanApplication,
    updateLoanOffer,
    getLoanApplication,
    getLoanOffer,
    cancelLoanApplication,
    predictCreditReliability,
    makePayment,
    getMonthlyPaymentAmount,
    updateBorrowerFinancialDetails,
    getExistingLoansCalculations
  };

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};
