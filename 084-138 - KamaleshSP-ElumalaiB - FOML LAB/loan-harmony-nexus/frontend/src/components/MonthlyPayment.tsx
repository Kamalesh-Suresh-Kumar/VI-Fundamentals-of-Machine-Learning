
import { useState } from "react";
import { useLoan, LoanApplication } from "@/contexts/LoanContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Check, IndianRupee } from "lucide-react";

interface MonthlyPaymentProps {
  loan: LoanApplication;
}

const MonthlyPayment = ({ loan }: MonthlyPaymentProps) => {
  const { makePayment, getMonthlyPaymentAmount } = useLoan();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Calculate monthly payment
  const monthlyPaymentAmount = getMonthlyPaymentAmount(loan.id);
  
  // Calculate total payment amount
  const calculateTotalPaymentAmount = () => {
    if (!loan.interestRate) return loan.amount;
    const monthlyPayment = monthlyPaymentAmount;
    return monthlyPayment * loan.term;
  };

  const totalAmount = calculateTotalPaymentAmount();
  const paidAmount = ((loan.paidMonths || 0) * monthlyPaymentAmount);
  const remainingAmount = totalAmount - paidAmount;

  const handlePayNow = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      await makePayment(loan.id, monthlyPaymentAmount);
      setIsPaymentComplete(true);
      setTimeout(() => {
        setIsDialogOpen(false);
        setIsPaymentComplete(false);
      }, 2000);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // If loan is not approved or doesn't have interest rate, don't show payment option
  if (loan.status !== 'approved' || !loan.interestRate) {
    return null;
  }



  // Calculate payment progress
  const paidMonths = loan.paidMonths || 0;
  const progressPercent = (paidMonths / loan.term) * 100;

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Repayment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Amount:</span>
            <span className="font-semibold">
              {monthlyPaymentAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold">
              {totalAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-semibold text-green-600">
              {paidAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Remaining Amount:</span>
            <span className="font-semibold text-amber-600">
              {remainingAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payments Made:</span>
            <span className="font-semibold">
              {paidMonths} of {loan.term} months
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-finance-primary h-2.5 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </CardContent>
        {user?.currentRole === 'borrower' && user?.id === loan.borrowerId && (
          <CardFooter>
            <Button 
              onClick={handlePayNow} 
              className="w-full bg-finance-secondary hover:bg-finance-primary"
              disabled={isProcessing || paidMonths >= loan.term}
            >
              <IndianRupee className="mr-2 h-4 w-4" />
              {paidMonths >= loan.term ? "All Payments Complete" : "Pay Now"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPaymentComplete ? "Payment Complete" : "Confirm Monthly Payment"}
            </DialogTitle>
            <DialogDescription>
              {isPaymentComplete
                ? "Your payment has been processed successfully."
                : "Please review the payment details before proceeding."}
            </DialogDescription>
          </DialogHeader>
          
          {!isPaymentComplete ? (
            <>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-lg">
                    {monthlyPaymentAmount.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Payment for:</span>
                  <span>Month {(loan.paidMonths || 0) + 1} of {loan.term}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Loan ID:</span>
                  <span className="font-mono text-sm">#{loan.id.slice(0, 8)}</span>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmPayment}
                  className="bg-finance-secondary hover:bg-finance-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-center text-lg font-medium">
                Payment Transferred
              </p>
              <p className="text-center text-gray-500 mt-1">
                The payment has been processed successfully.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyPayment;
