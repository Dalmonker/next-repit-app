import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    redirect("/dashboard");
}
