import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/");
  }

  return <DashboardClient />;
} 