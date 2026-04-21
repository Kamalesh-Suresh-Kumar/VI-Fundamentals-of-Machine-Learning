
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoan } from "@/contexts/LoanContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  // Financial Details
  monthlyIncome: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Monthly income must be a positive number",
  }),
  employmentStatus: z.string().min(1, "Employment status is required"),
  yearsEmployed: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Years employed must be a positive number",
  }),
  creditScore: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 300 && num <= 850;
  }, {
    message: "Credit score must be between 300 and 850",
  }),
  existingLoanAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Existing loan amount must be a non-negative number",
  }),
  existingLoanPeriod: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Existing loan period must be a non-negative number",
  }),
  monthlyExpenses: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Monthly expenses must be a non-negative number",
  }),
  
  // Loan Application Details
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 5000 && num <= 10000000;
  }, {
    message: "Loan amount must be between ₹5,000 and ₹1,00,00,000",
  }),
  purpose: z.string().min(5, "Loan purpose is required"),
  term: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Loan term must be a positive number of months",
  }),
  propertyAddress: z.string().min(5, "Property address is required"),
  propertyValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Property value must be a positive number",
  }),
  propertyType: z.string().min(1, "Property type is required"),
  additionalDetails: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

const LoanApplication = () => {
  const { user } = useAuth();
  const { createLoanApplication, getExistingLoansCalculations } = useLoan();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Financial Details
      monthlyIncome: "",
      employmentStatus: "salaried",
      yearsEmployed: "",
      creditScore: "",
      existingLoanAmount: "0",
      existingLoanPeriod: "0",
      monthlyExpenses: "",
      
      // Loan Application
      amount: "",
      purpose: "education",
      term: "12",
      propertyAddress: "",
      propertyValue: "",
      propertyType: "owned",
      additionalDetails: "",
      agreeToTerms: false,
    },
  });

  useEffect(() => {
    if (user?.id) {
      const existingLoans = getExistingLoansCalculations(user.id);
      form.setValue("existingLoanAmount", existingLoans.existingLoanAmount.toString());
      form.setValue("existingLoanPeriod", existingLoans.existingLoanPeriod.toString());
    }
  }, [user?.id, form, getExistingLoansCalculations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create the loan application with financial data included
      await createLoanApplication({
        borrowerId: user.id,
        borrowerName: user.name,
        amount: Number(values.amount),
        purpose: values.purpose,
        term: Number(values.term),
        creditScore: Number(values.creditScore),
        monthlyIncome: Number(values.monthlyIncome),
        employmentStatus: values.employmentStatus,
        yearsEmployed: Number(values.yearsEmployed),
        existingLoanAmount: Number(values.existingLoanAmount),
        existingLoanPeriod: Number(values.existingLoanPeriod),
        monthlyExpenses: Number(values.monthlyExpenses),
        propertyDetails: {
          address: values.propertyAddress,
          value: Number(values.propertyValue),
          type: values.propertyType,
        },
        documents: [], // No actual documents in this demo
      });
      
      toast({
        title: "Loan Application Submitted",
        description: "Your loan application has been submitted successfully.",
      });
      
      navigate("/borrower");
    } catch (error) {
      console.error("Error creating loan application:", error);
      toast({
        title: "Error",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">New Loan Application</h1>
            <p className="text-gray-600">
              Fill out the form below to apply for a new loan.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loan Application Form</CardTitle>
              <CardDescription>
                Please provide accurate information to help lenders evaluate your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Financial Details Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="monthlyIncome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Income (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="5000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employmentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="salaried">Salaried</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="self-employed">Self-Employed</SelectItem>
                                <SelectItem value="government">Government</SelectItem>
                                <SelectItem value="unemployed">Unemployed</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="yearsEmployed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years at Current Job</FormLabel>
                            <FormControl>
                              <Input placeholder="3" type="number" min="0" step="0.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="creditScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credit Score</FormLabel>
                            <FormControl>
                              <Input placeholder="720" type="number" min="300" max="850" {...field} />
                            </FormControl>
                            <FormDescription>
                              Score between 300-850
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="existingLoanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Existing Loan Amount (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="0" type="number" min="0" {...field} disabled={true} className="bg-gray-50" />
                            </FormControl>
                            <FormDescription>
                              Auto-calculated from your current active loans.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="existingLoanPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Existing Loan Period (months)</FormLabel>
                            <FormControl>
                              <Input placeholder="0" type="number" min="0" {...field} disabled={true} className="bg-gray-50" />
                            </FormControl>
                            <FormDescription>
                              Auto-calculated from your current active loans.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="monthlyExpenses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Expenses (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="2000" type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Loan Details Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Loan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Amount (₹)</FormLabel>
                            <div className="space-y-4 pt-2">
                              <FormControl>
                                <Input 
                                  placeholder="25000" 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <Slider
                                value={[Number(field.value) || 0]}
                                min={5000}
                                max={1000000}
                                step={5000}
                                onValueChange={(val) => field.onChange(val[0].toString())}
                                className="py-4"
                              />
                              <div className="flex flex-wrap gap-2">
                                {[10000, 50000, 100000, 500000, 1000000].map((amt) => (
                                  <Button
                                    key={amt}
                                    type="button"
                                    variant={Number(field.value) === amt ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => field.onChange(amt.toString())}
                                  >
                                    {formatCurrency(amt)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <FormDescription>
                              Select or enter an amount between ₹5,000 and ₹1,00,00,000
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="term"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Term (months)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select loan term" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12">12 months (1 year)</SelectItem>
                                <SelectItem value="24">24 months (2 years)</SelectItem>
                                <SelectItem value="36">36 months (3 years)</SelectItem>
                                <SelectItem value="48">48 months (4 years)</SelectItem>
                                <SelectItem value="60">60 months (5 years)</SelectItem>
                                <SelectItem value="120">120 months (10 years)</SelectItem>
                                <SelectItem value="180">180 months (15 years)</SelectItem>
                                <SelectItem value="240">240 months (20 years)</SelectItem>
                                <SelectItem value="360">360 months (30 years)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The duration of the loan repayment
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Loan Purpose</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="vehicle">Vehicle</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="debt-consolidation">Debt_Consolidation</SelectItem>
                              <SelectItem value="wedding">Wedding</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the purpose of the loan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Property Information Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Property Information</h3>
                    <FormField
                      control={form.control}
                      name="propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="propertyValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Property Value (₹)</FormLabel>
                            <FormControl>
                              <Input placeholder="250000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="owned">Owned</SelectItem>
                                <SelectItem value="rented">Rented</SelectItem>
                                <SelectItem value="joint-ownership">Joint_Ownership</SelectItem>
                                <SelectItem value="commercial-owned">Commercial_Owned</SelectItem>
                                <SelectItem value="commercial-rented">Commercial_Rented</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Details Section */}
                  <FormField
                    control={form.control}
                    name="additionalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Details (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any other information that might help your application"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Terms and Conditions
                          </FormLabel>
                          <FormDescription>
                            I agree to the terms of service and privacy policy. I confirm that all information provided is accurate to the best of my knowledge.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/borrower")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-finance-secondary hover:bg-finance-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LoanApplication;
