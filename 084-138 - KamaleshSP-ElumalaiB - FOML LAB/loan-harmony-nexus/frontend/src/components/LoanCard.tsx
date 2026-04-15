
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LoanApplication, useLoan } from "@/contexts/LoanContext";
import { useNavigate } from "react-router-dom";

interface LoanCardProps {
  loan: LoanApplication;
  actionLabel?: string;
  onAction?: () => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ 
  loan, 
  actionLabel = "View Details",
  onAction
}) => {
  const navigate = useNavigate();
  const { getMonthlyPaymentAmount } = useLoan();
  
  const monthlyPaymentAmount = getMonthlyPaymentAmount(loan.id);
  const totalAmount = loan.interestRate ? monthlyPaymentAmount * loan.term : loan.amount;
  const paidAmount = ((loan.paidMonths || 0) * monthlyPaymentAmount);
  const remainingAmount = totalAmount - paidAmount;
  const progressPercent = loan.term > 0 ? ((loan.paidMonths || 0) / loan.term) * 100 : 0;
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800"
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(`/loan/${loan.id}`);
    }
  };
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{formatCurrency(loan.amount)} Loan</CardTitle>
            <CardDescription>
              {loan.purpose} • {loan.term} months
            </CardDescription>
          </div>
          <Badge className={statusColors[loan.status]}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Credit Score</span>
              <span className="font-medium">{loan.creditScore}</span>
            </div>
            <Progress value={loan.creditScore / 8.5} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Borrower</p>
              <p className="font-medium">{loan.borrowerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Lender</p>
              <p className="font-medium">{loan.lenderName || "Not assigned"}</p>
            </div>
          </div>
          
          {loan.propertyDetails && (
            <div>
              <p className="text-gray-500 text-sm">Property</p>
              <p className="text-sm truncate">{loan.propertyDetails.address}</p>
              <p className="text-sm">{formatCurrency(loan.propertyDetails.value)} • {loan.propertyDetails.type}</p>
            </div>
          )}

          {loan.status === 'approved' && loan.interestRate && (
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Timeline ({loan.paidMonths || 0}/{loan.term} months)</span>
                <span className="font-medium text-green-600">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 mb-2" />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Paid</p>
                  <p className="font-medium text-green-600">{formatCurrency(paidAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p className="font-medium text-amber-600">{formatCurrency(remainingAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={handleAction} className="w-full">
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanCard;
