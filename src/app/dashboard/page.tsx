import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRoot() {
    const session = await getSession();

    if (!session) redirect("/login");
    if (!session.role) redirect("/onboarding/role");

    if (session.role === "student") redirect("/dashboard/student");
    if (session.role === "tutor") redirect("/dashboard/tutor");
    if (session.role === "parent") redirect("/dashboard/parent");
}
