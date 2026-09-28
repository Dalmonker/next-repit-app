import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        const userId = session.userId;

        // Физическое удаление. FK ON DELETE CASCADE почистит:
        // - tutor_profiles
        // - student_profiles
        // - parent_profiles
        // - invitations (где student_id или tutor_id = userId)
        // - tutor_students (где tutor_id или student_id = userId)
        const [result]: any = await pool.execute(
            `DELETE FROM users WHERE id = ?`,
            [userId],
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: "Пользователь не найден" },
                { status: 404 },
            );
        }

        // Очистить cookie
        await clearSessionCookie();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("profile delete error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
