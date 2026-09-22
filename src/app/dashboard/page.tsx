import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (!session.role) {
        redirect("/onboarding/role");
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-violet px-[30px]">
            <div className="w-full max-w-[560px] bg-white rounded-[24px] p-[40px] shadow-xl text-center">
                <h1 className="font-days text-[32px] text-black mb-[16px]">
                    Добро пожаловать!
                </h1>
                <p className="text-darkGray mb-[8px]">{session.email}</p>
                <p className="text-darkGray mb-[24px]">
                    Ваша роль: <b className="text-black">{session.role}</b>
                </p>
                <LogoutButton />
            </div>
        </main>
    );
}
