import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ParentDashboard() {
    const session = await getSession();

    if (!session || session.role !== "parent") {
        redirect("/dashboard");
    }

    return (
        <>
            <h1 className="font-days text-[32px] text-black mb-[24px]">
                Главная
            </h1>
            <p className="text-darkGray">Кабинет родителя. {session.email}</p>
        </>
    );
}
