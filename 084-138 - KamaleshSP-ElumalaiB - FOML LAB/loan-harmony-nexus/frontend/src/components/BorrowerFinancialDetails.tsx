
import { useState } from "react";
import { useLoan } from "@/contexts/LoanContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialDetails {
  monthlyIncome?: number | string;
  employmentStatus?: string;
  yearsEmployed?: number | string;
  creditScore?: number | string;
  existingLoanAmount?: number | string;
  existingLoanPeriod?: number | string;
  monthlyExpenses?: number | string;
}

interface BorrowerFinancialDetailsProps {
  loanId: string;
  existingData: FinancialDetails;
}

const BorrowerFinancialDetails = ({ loanId, existingData }: BorrowerFinancialDetailsProps) => {
  const { updateBorrowerFinancialDetails } = useLoan();
  const [formData, setFormData] = useState({
    monthlyIncome: existingData?.monthlyIncome || "",
    employmentStatus: existingData?.employmentStatus || "",
    yearsEmployed: existingData?.yearsEmployed || "",
    creditScore: existingData?.creditScore || "",
    existingLoanAmount: existingData?.existingLoanAmount || "",
    existingLoanPeriod: existingData?.existingLoanPeriod || "",
    monthlyExpenses: existingData?.monthlyExpenses || ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employmentStatus' ? value : Number(value) || value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateBorrowerFinancialDetails(loanId, {
        monthlyIncome: Number(formData.monthlyIncome) || undefined,
        employmentStatus: formData.employmentStatus || undefined,
        yearsEmployed: Number(formData.yearsEmployed) || undefined,
        creditScore: Number(formData.creditScore) || undefined,
        existingLoanAmount: Number(formData.existingLoanAmount) || undefined,
        existingLoanPeriod: Number(formData.existingLoanPeriod) || undefined,
        monthlyExpenses: Number(formData.monthlyExpenses) || undefined
      });
    } catch (error) {
      console.error("Error updating financial details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If all fields are completed, don't show the form
  const allFieldsCompleted = 
  formData.monthlyIncome !== "" &&
  formData.employmentStatus !== "" &&
  formData.yearsEmployed !== "" &&
  formData.creditScore !== "" &&
  formData.existingLoanAmount !== "" &&
  formData.existingLoanPeriod !== "" &&
  formData.monthlyExpenses !== "";
  
  if (existingData?.monthlyIncome && existingData?.employmentStatus && existingData?.yearsEmployed) {
    return null; // If details are already provided, don't show the form
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                placeholder="e.g. 5000"
                value={formData.monthlyIncome}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select 
                value={formData.employmentStatus} 
                onValueChange={(value) => handleSelectChange('employmentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsEmployed">Years at Current Job</Label>
              <Input
                id="yearsEmployed"
                name="yearsEmployed"
                type="number"
                placeholder="e.g. 3"
                value={formData.yearsEmployed}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                name="creditScore"
                type="number"
                placeholder="e.g. 750"
                value={formData.creditScore}
                onChange={handleChange}
                required
                min="300"
                max="850"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="existingLoanAmount">Existing Loans Amount ($)</Label>
              <Input
                id="existingLoanAmount"
                name="existingLoanAmount"
                type="number"
                placeholder="e.g. 10000 (0 if none)"
                value={formData.existingLoanAmount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="existingLoanPeriod">Existing Loans Period (months)</Label>
              <Input
                id="existingLoanPeriod"
                name="existingLoanPeriod"
                type="number"
                placeholder="e.g. 36 (0 if none)"
                value={formData.existingLoanPeriod}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
              <Input
                id="monthlyExpenses"
                name="monthlyExpenses"
                type="number"
                placeholder="e.g. 2000"
                value={formData.monthlyExpenses}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-finance-secondary hover:bg-finance-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Financial Information"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BorrowerFinancialDetails;
