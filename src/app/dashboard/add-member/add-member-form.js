"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createMember } from "@/app/actions";

const todayValue = () => new Date().toISOString().slice(0, 10);

const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

const emptyForm = {
  name: "",
  mobile: "",
  registrationDate: todayValue(),
  paymentDate: "",
  paymentNotPaid: false,
  durationDays: "30",
  amount: "",
  remainingAmount: "",
  mealsPerDay: "2",
  plan: "Monthly meals",
};

export default function AddMemberForm({ activeMess }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const mobile = normalizeWhatsAppNumber(form.mobile);

    if (!form.name.trim() || !mobile) {
      setNotice("Add member name and mobile number.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createMember(activeMess.id, form);

        if (result?.ok) {
          setNotice("Member added successfully!");
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 500);
        } else {
          setNotice(result?.message || "Could not add member. Please try again.");
        }
      } catch {
        setNotice("Could not add member. Please try again.");
      }
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-100"
          aria-label="Go back"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Add new member
          </p>
          <h1 className="text-3xl font-bold">Register a customer</h1>
          <p className="mt-2 text-sm text-slate-600">
            Adding member to <span className="font-semibold">{activeMess.name}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="grid gap-6">
          <Field
            label="Customer name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
          <Field
            label="Mobile number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="10 digit number"
            inputMode="tel"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Registration date"
              name="registrationDate"
              type="date"
              value={form.registrationDate}
              onChange={handleChange}
            />
            <div>
              <Field
                label="Payment date"
                name="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={handleChange}
                disabled={form.paymentNotPaid}
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.paymentNotPaid}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      paymentNotPaid: event.target.checked,
                      paymentDate: event.target.checked ? "" : current.paymentDate || todayValue(),
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Not paid
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field
              label="Days"
              name="durationDays"
              type="number"
              min="1"
              value={form.durationDays}
              onChange={handleChange}
            />
            <Field
              label="Amount"
              name="amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={handleChange}
              placeholder="Rs."
            />
            <Field
              label="Remaining amount"
              name="remainingAmount"
              type="number"
              min="0"
              value={form.remainingAmount}
              onChange={handleChange}
              placeholder="Rs."
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700">Meals per day</label>
              <select
                name="mealsPerDay"
                value={form.mealsPerDay}
                onChange={handleChange}
                className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-teal-600 transition focus:ring-2"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field
            label="Plan"
            name="plan"
            value={form.plan}
            onChange={handleChange}
            placeholder="Monthly meals"
          />
        </div>

        {notice ? (
          <p className={`mt-6 rounded-md px-4 py-3 text-sm font-medium ${
            notice.includes("successfully")
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}>
            {notice}
          </p>
        ) : null}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            disabled={isPending}
            className="flex-1 rounded-md border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isPending ? "Saving..." : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {props.required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <input
        {...props}
        className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-teal-600 transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}
