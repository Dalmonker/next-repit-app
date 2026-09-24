import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (!session.role) {
        redirect("/onboarding/role");
    }

    return <SettingsClient email={session.email} role={session.role} />;
}
