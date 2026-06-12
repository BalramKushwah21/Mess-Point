import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingPage from "@/app/(landing)/page";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Check if user is logged in
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // If logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // Otherwise show landing page
  return <LandingPage />;
}
