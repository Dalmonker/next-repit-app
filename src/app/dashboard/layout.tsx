import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { getSession } from "@/lib/auth";
import { getUserForSidebar } from "@/lib/users";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const user = await getUserForSidebar(session.userId);

    return (
        <div className="px-[30px] pt-[30px] flex bg-whiteDashboard gap-[30px]">
            <Sidebar
                avatarUrl={user?.avatar_url ?? null}
                firstName={user?.first_name ?? ""}
                role={session.role}
            />
            <main className="flex-1 pb-[30px]">{children}</main>
        </div>
    );
}
