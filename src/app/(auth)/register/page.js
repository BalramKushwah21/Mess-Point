"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/auth-actions";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business/Mess name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain lowercase letters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase letters";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsPending(true);

    try {
      const result = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        password: formData.password,
      });

      if (result.ok) {
        setSuccess(result.message);
        // Clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          businessName: "",
          password: "",
          confirmPassword: "",
          terms: false,
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f4] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-950">Mess Manager</h1>
          <p className="text-sm text-slate-600 mt-2">Start your free 14-day trial</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">{success}</p>
              <p className="text-xs text-emerald-700 mt-1">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-rose-50 border border-rose-200">
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={isPending}
                  className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                    errors.firstName
                      ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                      : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                  } text-sm disabled:bg-slate-100`}
                />
                {errors.firstName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={isPending}
                  className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                    errors.lastName
                      ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                      : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                  } text-sm disabled:bg-slate-100`}
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={isPending}
                className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                  errors.email
                    ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                } text-sm disabled:bg-slate-100`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number (10 digits)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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

            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mess / Hostel Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="My Hostel Mess"
                disabled={isPending}
                className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                  errors.businessName
                    ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                } text-sm disabled:bg-slate-100`}
              />
              {errors.businessName && (
                <p className="text-xs text-rose-600 mt-1">{errors.businessName}</p>
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
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase, lowercase, number"
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
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isPending}
                className={`w-full px-3 py-2 rounded-md border outline-none transition ${
                  errors.confirmPassword
                    ? "border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300"
                    : "border-slate-300 bg-white focus:ring-2 focus:ring-teal-300"
                } text-sm disabled:bg-slate-100`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
                disabled={isPending}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-700 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-teal-700 hover:underline font-semibold">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-teal-700 hover:underline font-semibold">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-rose-600">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-6 bg-teal-700 text-white font-semibold py-2.5 rounded-md hover:bg-teal-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isPending ? "Creating Account..." : "Create Free Account"}
            </button>

            {/* Already have account */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-700 hover:underline font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              🎉 Get 14 days of Pro features free! No credit card required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Your data is secure and encrypted. We never share your information.
        </p>
      </div>
    </div>
  );
}
