import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import GradeModal from "../GradeModal";

export default async function StudentDashboard() {
    const session = await getSession();

    if (!session || session.role !== "student") {
        redirect("/dashboard");
    }

    const [rows]: any = await pool.execute(
        `SELECT grade FROM student_profiles WHERE user_id = ?`,
        [session.userId],
    );
    const grade = rows[0]?.grade ?? null;

    return (
        <>
            <h1 className="font-days text-[32px] text-black mb-[24px]">
                Главная
            </h1>
            <p className="text-darkGray">Добро пожаловать, {session.email}</p>

            {grade && (
                <p className="text-darkGray mt-[8px]">
                    Класс: <b className="text-black">{grade}</b>
                </p>
            )}

            {!grade && <GradeModal />}
        </>
    );
}
