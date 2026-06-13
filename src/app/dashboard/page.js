import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "../dashboard";
import { getDashboardData } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const initialData = await getDashboardData(resolvedSearchParams?.messId);

  return <Dashboard initialData={initialData} />;
}
