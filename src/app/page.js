import Dashboard from "@/app/dashboard";
import { getDashboardData } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const dashboardData = await getDashboardData(params?.messId);

  return <Dashboard initialData={dashboardData} />;
}
