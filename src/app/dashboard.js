"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createMess,
  deleteMember,
  loadMess,
  renewMember as renewMemberAction,
  saveOwnerNumber,
} from "@/app/actions";

const todayValue = () => new Date().toISOString().slice(0, 10);

const addDays = (dateValue, days) => {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
};

const daysBetween = (fromValue, toValue) => {
  const from = new Date(`${fromValue}T00:00:00`);
  const to = new Date(`${toValue}T00:00:00`);
  return Math.ceil((to - from) / 86400000);
};

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));

const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

const openWhatsApp = (phone, message) => {
  const normalized = normalizeWhatsAppNumber(phone);

  if (!normalized) {
    return;
  }

  window.open(
    `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer",
  );
};

const getMemberStatus = (member, today) => {
  if (!member.paymentDate) {
    return {
      expiryDate: "Not paid",
      daysLeft: -1,
      label: "Not paid",
      tone: "bg-rose-100 text-rose-700 ring-rose-200",
      row: "border-rose-200 bg-rose-50/70",
    };
  }

  const expiryDate = addDays(member.paymentDate, member.durationDays);
  const daysLeft = daysBetween(today, expiryDate);

  if (daysLeft < 0) {
    return {
      expiryDate,
      daysLeft,
      label: "Expired",
      tone: "bg-rose-100 text-rose-700 ring-rose-200",
      row: "border-rose-200 bg-rose-50/70",
    };
  }

  if (daysLeft <= 3) {
    return {
      expiryDate,
      daysLeft,
      label: "Expiring",
      tone: "bg-amber-100 text-amber-800 ring-amber-200",
      row: "border-amber-200 bg-amber-50/70",
    };
  }

  return {
    expiryDate,
    daysLeft,
    label: "Active",
    tone: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    row: "border-slate-200 bg-white",
  };
};

export default function Dashboard({ initialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [messes, setMesses] = useState(initialData.messes);
  const [activeMess, setActiveMess] = useState(initialData.activeMess);
  const [members, setMembers] = useState(initialData.members);
  const [ownerNumber, setOwnerNumberState] = useState(initialData.ownerNumber);
  const [newMessName, setNewMessName] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const today = todayValue();
  const activeMessId = activeMess?.id;

  const applyDashboardData = (data) => {
    setMesses(data.messes);
    setActiveMess(data.activeMess);
    setMembers(data.members);
    setOwnerNumberState(data.ownerNumber);
  };

  const runDashboardMutation = (mutation) => {
    startTransition(async () => {
      try {
        const result = await mutation();

        if (result?.data) {
          applyDashboardData(result.data);
          router.replace(`/?messId=${encodeURIComponent(result.data.activeMess.id)}`, {
            scroll: false,
          });
        }

        if (result?.message) {
          setNotice(result.message);
        }

        router.refresh();
      } catch {
        setNotice("Could not save the change. Please try again.");
      }
    });
  };

  const persistOwnerNumber = (value) => {
    startTransition(async () => {
      try {
        const result = await saveOwnerNumber(activeMessId, value);

        if (result?.ownerNumber !== undefined) {
          setOwnerNumberState(result.ownerNumber);
        }
      } catch {
        setNotice("Could not save your WhatsApp number.");
      }
    });
  };

  const switchMess = (messId) => {
    runDashboardMutation(() => loadMess(messId));
  };

  const handleCreateMess = (event) => {
    event.preventDefault();

    runDashboardMutation(async () => {
      const result = await createMess({ name: newMessName });

      if (result?.ok) {
        setNewMessName("");
        setFilter("all");
        setQuery("");
      }

      return result;
    });
  };

  const enrichedMembers = useMemo(
    () =>
      members
        .map((member) => ({
          ...member,
          status: getMemberStatus(member, today),
        }))
        .sort((a, b) => a.status.daysLeft - b.status.daysLeft),
    [members, today],
  );

  const expiredMembers = enrichedMembers.filter(
    (member) => member.status.label === "Expired",
  );

  const expiringMembers = enrichedMembers.filter(
    (member) => member.status.label === "Expiring",
  );

  const activeMembers = enrichedMembers.filter(
    (member) => member.status.label === "Active",
  );

  const monthlyCollection = enrichedMembers.reduce(
    (total, member) => total + Number(member.amount || 0),
    0,
  );

  const filteredMembers = enrichedMembers.filter((member) => {
    const matchesFilter =
      filter === "all" ||
      member.status.label.toLowerCase() === filter ||
      (filter === "due" && member.status.label !== "Active");

    const searchText = `${member.name} ${member.mobile} ${member.plan}`.toLowerCase();
    return matchesFilter && searchText.includes(query.toLowerCase());
  });

  const ownerAlertMessage = expiredMembers.length
    ? `Expired mess memberships:\n${expiredMembers
        .map(
          (member, index) =>
            `${index + 1}. ${member.name} - ${member.mobile} - expired on ${formatDate(
              member.status.expiryDate,
            )}`,
        )
        .join("\n")}`
    : "No expired mess memberships today.";

  const removeMember = (memberId) => {
    runDashboardMutation(() => deleteMember(activeMessId, memberId));
  };

  const renewMember = (memberId) => {
    runDashboardMutation(() => renewMemberAction(activeMessId, memberId));
  };

  const reminderMessage = (member) =>
    `Hello ${member.name}, your mess membership ${
      member.status.label === "Expired"
        ? `expired on ${formatDate(member.status.expiryDate)}`
        : member.status.label === "Not paid"
        ? `has not been paid yet`
        : `will expire on ${formatDate(member.status.expiryDate)}`
    }. Please renew your payment to continue meal service.`;

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/mess-hero.png"
          alt="Organized mess kitchen and meal service counter"
          fill
          priority
          className="absolute inset-0 -z-20 object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950 via-slate-950/82 to-slate-900/20" />
        <div className="mx-auto flex min-h-115 max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
                Mess Manager
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-5xl">
                {activeMess?.name || "Mess dashboard"}
              </h1>
              <p className="mt-3 max-w-xl text-sm font-medium text-slate-200">
                Manage memberships, payments, and WhatsApp alerts for this mess.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:min-w-90">
              <div className="rounded-md bg-white/10 p-3 backdrop-blur">
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
                  Active mess
                </label>
                <select
                  value={activeMessId}
                  onChange={(event) => switchMess(event.target.value)}
                  disabled={isPending}
                  className="mt-2 min-h-11 w-full rounded-md border border-white/20 bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-teal-300 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  {messes.map((mess) => (
                    <option key={mess.id} value={mess.id}>
                      {mess.name}
                    </option>
                  ))}
                </select>
              </div>
              <form
                onSubmit={handleCreateMess}
                className="flex gap-2 rounded-md bg-white/10 p-2 backdrop-blur"
              >
                <input
                  value={newMessName}
                  onChange={(event) => setNewMessName(event.target.value)}
                  placeholder="New mess name"
                  className="min-h-10 min-w-0 flex-1 rounded border border-white/20 bg-white px-3 text-sm font-semibold text-slate-950 outline-none ring-teal-300 transition placeholder:text-slate-400 focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-10 rounded bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Create
                </button>
              </form>
              <div className="flex items-center gap-2 rounded-md bg-white/10 p-1 backdrop-blur">
                {["all", "due", "expired"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`min-h-10 flex-1 rounded px-4 text-sm font-semibold capitalize transition ${
                      filter === item
                        ? "bg-white text-slate-950"
                        : "text-white hover:bg-white/15"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="grid gap-5 pb-2 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-base leading-7 text-slate-100 sm:text-lg">
                Add customers with mobile numbers, track registration and
                payment dates, see expiry alerts, and send ready-made WhatsApp
                messages for each mess from one website.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Members" value={enrichedMembers.length} />
              <Metric label="Expired" value={expiredMembers.length} />
              <Metric label="Expiring" value={expiringMembers.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[380px_1fr] lg:px-10">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                  New customer
                </p>
                <h2 className="text-xl font-bold">Add member</h2>
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Click the button below to register a new customer and add them to this mess.
            </p>

            <a
              href="/dashboard/add-member"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              Register new customer
            </a>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
              Owner alert
            </p>
            <h2 className="mt-1 text-xl font-bold">Expired list to WhatsApp</h2>
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Your WhatsApp number
            </label>
            <input
              value={ownerNumber}
              onChange={(event) => setOwnerNumberState(event.target.value)}
              onBlur={(event) => persistOwnerNumber(event.target.value)}
              placeholder="Your mobile number"
              inputMode="tel"
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-teal-600 transition focus:ring-2"
            />
            <button
              type="button"
              onClick={() => {
                persistOwnerNumber(ownerNumber);
                openWhatsApp(ownerNumber, ownerAlertMessage);
              }}
              disabled={!normalizeWhatsAppNumber(ownerNumber)}
              className="mt-4 min-h-11 w-full rounded-md bg-rose-700 px-4 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Send expired list
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Active" value={activeMembers.length} tone="teal" />
            <SummaryCard
              label="Need attention"
              value={expiredMembers.length + expiringMembers.length}
              tone="amber"
            />
            <SummaryCard
              label="Monthly collection"
              value={`Rs. ${monthlyCollection.toLocaleString("en-IN")}`}
              tone="slate"
            />
            <SummaryCard
              label="Renew today"
              value={expiredMembers.length}
              tone="rose"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                  Customer register
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Payments and expiry alerts
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, number, plan"
                  className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-teal-600 transition focus:ring-2 sm:w-64"
                />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none ring-teal-600 transition focus:ring-2"
                >
                  <option value="all">All members</option>
                  <option value="active">Active</option>
                  <option value="due">Expired or expiring</option>
                  <option value="expired">Expired</option>
                  <option value="expiring">Expiring</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredMembers.length ? (
                filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    pending={isPending}
                    onRenew={() => renewMember(member.id)}
                    onDelete={() => removeMember(member.id)}
                    onWhatsApp={() =>
                      openWhatsApp(member.mobile, reminderMessage(member))
                    }
                  />
                ))
              ) : (
                <div className="p-8 text-center text-sm font-medium text-slate-500">
                  No members match this view.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-100">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const tones = {
    teal: "border-teal-200 bg-teal-50 text-teal-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return (
    <div className={`rounded-lg border p-5 ${tones[tone]}`}>
      <p className="text-sm font-bold uppercase tracking-[0.14em] opacity-80">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function MemberRow({ member, pending, onRenew, onDelete, onWhatsApp }) {
  return (
    <article className={`grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto] ${member.status.row}`}>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-black">{member.name}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${member.status.tone}`}
          >
            {member.status.label}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          {member.mobile} | {member.plan}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Registered {formatDate(member.registrationDate)} | Paid{" "}
          {member.paymentDate ? formatDate(member.paymentDate) : "Not paid"} | Rs.{" "}
          {Number(member.amount || 0).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Expiry" value={formatDate(member.status.expiryDate)} />
        <Info
          label="Days"
          value={
            member.status.daysLeft < 0
              ? `${Math.abs(member.status.daysLeft)} overdue`
              : `${member.status.daysLeft} left`
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onWhatsApp}
          className="min-h-10 rounded-md bg-emerald-700 px-3 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={onRenew}
          disabled={pending}
          className="min-h-10 rounded-md bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Renew
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-h-16 rounded-md border border-slate-200 bg-white/80 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
