"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, verifyOTPAndLogin } from "@/app/auth-actions";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [step, setStep] = useState(1); // 1 for phone input, 2 for OTP input

  // Password login state
  const [passwordForm, setPasswordForm] = useState({
    emailOrPhone: "",
    password: "",
    remember: false,
  });

  // OTP login state
  const [otpForm, setOtpForm] = useState({
    phone: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle password login
  const handlePasswordChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone is required";
    }

    if (!passwordForm.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePasswordForm()) {
      return;
    }

    setIsPending(true);

    try {
      const result = await loginUser({
        emailOrPhone: passwordForm.emailOrPhone,
        password: passwordForm.password,
      });

      if (result.ok) {
        setSuccess("Login successful!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // Handle OTP login - Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpForm.phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    if (!/^\d{10}$/.test(otpForm.phone.replace(/\D/g, ""))) {
      setErrors({ phone: "Phone must be 10 digits" });
      return;
    }

    setIsPending(true);

    try {
      // In a real app, this would send SMS
      // For now, we just proceed to OTP input
      setOtpSent(true);
      setStep(2);
      setErrors({});
      // Show debug OTP in development
      if (process.env.NODE_ENV === "development") {
        setSuccess("OTP sent! Check console for test OTP.");
      } else {
        setSuccess("OTP sent to your phone!");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  // Handle OTP login - Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpForm.otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsPending(true);

    try {
      const result = await verifyOTPAndLogin(otpForm.phone, otpForm.otp);

      if (result.ok) {
        setSuccess("OTP verified! Logging in...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(result.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleOTPChange = (e) => {
    const { name, value } = e.target;
    setOtpForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f4] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-950">Mess Manager</h1>
          <p className="text-sm text-slate-600 mt-2">Sign in to your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200">
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-md">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setStep(1);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition ${
                loginMethod === "password"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Email/Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp");
                setStep(1);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition ${
                loginMethod === "otp"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* Password Login Form */}
          {loginMethod === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Email or Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email or Phone
                </label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={passwordForm.emailOrPhone}
                  onChange={handlePasswordChange}
                  placeholder="your@email.com or 9876543210"
                  disabled={isPending}
                  className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                    errors.emailOrPhone
                      ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                      : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                  } text-sm disabled:bg-slate-100`}
                />
                {errors.emailOrPhone && (
                  <p className="text-xs text-rose-600 mt-1">{errors.emailOrPhone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  placeholder="Your password"
                  disabled={isPending}
                  className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                    errors.password
                      ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                      : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                  } text-sm disabled:bg-slate-100`}
                />
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={passwordForm.remember}
                  onChange={handlePasswordChange}
                  disabled={isPending}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-6 bg-teal-700 text-white font-semibold py-2.5 rounded-md hover:bg-teal-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {loginMethod === "otp" && (
            <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number (10 digits)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={otpForm.phone}
                      onChange={handleOTPChange}
                      placeholder="9876543210"
                      inputMode="tel"
                      disabled={isPending}
                      className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                        errors.phone
                          ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                          : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                      } text-sm disabled:bg-slate-100`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-6 bg-teal-700 text-white font-semibold py-2.5 rounded-md hover:bg-teal-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Enter OTP
                    </label>
                    <p className="text-xs text-slate-600 mb-3">
                      We sent a 6-digit code to {otpForm.phone}
                    </p>
                    <input
                      type="text"
                      name="otp"
                      value={otpForm.otp}
                      onChange={handleOTPChange}
                      placeholder="000000"
                      maxLength="6"
                      inputMode="numeric"
                      disabled={isPending}
                      className={`w-full px-3 py-2 rounded-md border outline-none transition text-center text-lg font-mono tracking-widest ${
                        errors.otp
                          ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                          : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                      } disabled:bg-slate-100`}
                    />
                    {errors.otp && (
                      <p className="text-xs text-rose-600 mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtpForm((prev) => ({ ...prev, otp: "" }));
                        setErrors({});
                      }}
                      disabled={isPending}
                      className="flex-1 bg-slate-200 text-slate-950 font-semibold py-2 rounded-md hover:bg-slate-300 transition disabled:bg-slate-100"
                    >
                      Change Phone
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 bg-teal-700 text-white font-semibold py-2 rounded-md hover:bg-teal-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                      {isPending ? "Verifying..." : "Verify & Login"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-teal-700 hover:underline font-semibold">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-3 text-center">
            <a href="#" className="text-sm text-teal-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Your login is secure and encrypted.
        </p>
      </div>
    </div>
  );
}
