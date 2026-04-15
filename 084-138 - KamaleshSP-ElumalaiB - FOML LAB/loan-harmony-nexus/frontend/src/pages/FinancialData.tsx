
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import Layout from "@/components/Layout";

const formSchema = z.object({
  annualIncome: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Annual income must be a positive number",
  }),
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "retired"]),
  employmentLength: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Employment length must be a non-negative number",
  }),
  creditScore: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 300 && Number(val) <= 850, {
    message: "Credit score must be between 300 and 850",
  }),
  existingDebts: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Existing debts must be a non-negative number",
  }),
  monthlyExpenses: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Monthly expenses must be a non-negative number",
  }),
});

const FinancialData = () => {
  const { submitFinancialData, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualIncome: "",
      employmentStatus: "employed",
      employmentLength: "",
      creditScore: "",
      existingDebts: "",
      monthlyExpenses: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      // Convert string values to numbers
      const financialData = {
        annualIncome: Number(values.annualIncome),
        employmentStatus: values.employmentStatus,
        employmentLength: Number(values.employmentLength),
        creditScore: Number(values.creditScore),
        existingDebts: Number(values.existingDebts),
        monthlyExpenses: Number(values.monthlyExpenses),
      };
      const success = await submitFinancialData(financialData);
      if (success) {
        navigate("/role-selection");
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to submit financial data");
        }
      }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                Please provide your financial details to help us match you with the right opportunities.
                All information is encrypted and secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="annualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Income ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="60000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your gross annual income before taxes
                        </FormDescription>
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
                              <SelectValue placeholder="Select your employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-employed</SelectItem>
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
                    name="employmentLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years at Current Employment</FormLabel>
                        <FormControl>
                          <Input placeholder="3" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of years at your current job
                        </FormDescription>
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
                          <Input placeholder="720" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your credit score (between 300-850)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="existingDebts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Debts ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="15000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Total of all current outstanding debts
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
                        <FormLabel>Monthly Expenses ($)</FormLabel>
                        <FormControl>
                          <Input placeholder="2500" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your average monthly expenses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-finance-secondary hover:bg-finance-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Financial Information"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FinancialData;
