import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, createSession, setSessionCookie } from "@/lib/auth";

const VALID_ROLES = ["tutor", "parent", "student"] as const;

type Role = (typeof VALID_ROLES)[number];

// Куда редиректить после выбора роли
const REDIRECT_BY_ROLE: Record<Role, string> = {
    student: "/onboarding/student",
    tutor: "/onboarding/tutor",
    parent: "/onboarding/parent",
};

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const role = String(body.role ?? "") as Role;

        if (!VALID_ROLES.includes(role)) {
            return NextResponse.json(
                { error: "Некорректная роль" },
                { status: 400 },
            );
        }

        // 1. Сохраняем роль в users
        await pool.execute(`UPDATE users SET role = ? WHERE id = ?`, [
            role,
            session.userId,
        ]);

        // 2. Если ученик — создаём профиль (если ещё нет)
        if (role === "student") {
            await pool.execute(
                `INSERT INTO student_profiles (user_id, grade) 
                 VALUES (?, NULL) 
                 ON DUPLICATE KEY UPDATE user_id = user_id`,
                [session.userId],
            );
        }

        // 3. Обновляем JWT с новой ролью
        const newToken = await createSession({
            userId: session.userId,
            email: session.email,
            role,
        });
        await setSessionCookie(newToken);

        // 4. Возвращаем роль + куда редиректить
        return NextResponse.json({
            success: true,
            role,
            redirectTo: REDIRECT_BY_ROLE[role],
        });
    } catch (error) {
        console.error("set-role error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
