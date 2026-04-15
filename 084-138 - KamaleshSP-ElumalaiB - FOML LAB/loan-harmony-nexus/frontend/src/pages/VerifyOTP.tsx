import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verifyOTP: contextVerify } = useAuth();
  const email = location.state?.email || user?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Send OTP function
  const sendOtp = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setIsSent(true);
      setResendCountdown(30); // 30 seconds cooldown
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  }, [email]);

  useEffect(() => {
    sendOtp();
  }, [sendOtp]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }


    setIsLoading(true);
    try {
       // Since the custom implementation allows passing custom email:
       const success = await contextVerify(otp, email);
       if (success) {
          navigate("/financial-data");
       } else {
          setError("Verification failed");
       }
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  };

  return (
    <Layout showBackButton backTo="/login">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Account</CardTitle>
              <CardDescription>
                We've sent a verification code to your email: <b>{email}</b>. Enter it below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter the OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1"
                      maxLength={6}
                    />
                  </div>
                </div>
              </form>
              <div className="mt-4 text-sm text-gray-600">
                {!isSent ? (
                  "Sending OTP..."
                ) : resendCountdown > 0 ? (
                  <p>Resend OTP in {Math.floor(resendCountdown / 60)}:{(resendCountdown % 60).toString().padStart(2, '0')} minutes</p>
                ) : (
                  <Button
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="bg-finance-secondary hover:bg-finance-primary"
                  >
                    Resend OTP
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-finance-secondary hover:bg-finance-primary"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
