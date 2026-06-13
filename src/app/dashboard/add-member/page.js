import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddMemberForm from "./add-member-form";
import { getDashboardData } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function AddMemberPage({ searchParams }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const initialData = await getDashboardData(searchParams?.messId);

  if (!initialData.activeMess) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <AddMemberForm activeMess={initialData.activeMess} />
    </main>
  );
}
