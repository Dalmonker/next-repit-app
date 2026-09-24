import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F5F4FF]">
            <Sidebar />
            <main className="flex-1 p-[40px]">{children}</main>
        </div>
    );
}
