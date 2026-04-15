
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowRight, Shield, Zap, LineChart } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Connecting <span className="text-finance-secondary">Lenders</span> and <span className="text-finance-primary">Borrowers</span> Effortlessly
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Our platform streamlines the loan management process, making it simpler and more transparent for both lenders and borrowers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-finance-secondary hover:bg-finance-primary"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!isAuthenticated && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden md:block rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1673&q=80" 
                alt="Loan Management" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-finance-light flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-600">
                Create your account with a secure verification process to ensure safety of all parties involved.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-finance-light flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Matching</h3>
              <p className="text-gray-600">
                Our system quickly matches borrowers with the most suitable lenders based on loan requirements.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-finance-light flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze credit data to determine reliability and optimize loan terms.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 my-10 bg-finance-light rounded-xl">
          <div className="text-center max-w-3xl mx-auto px-6 py-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Loan Process?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of users who are already benefiting from our streamlined loan management system.
            </p>
            <Button 
              size="lg" 
              className="bg-finance-secondary hover:bg-finance-primary"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
