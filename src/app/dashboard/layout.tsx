import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="px-[30px] pt-[30px] flex bg-whiteDashboard gap-[30px]">
            <Sidebar />
            <main className="flex-1">{children}</main>
        </div>
    );
}
