import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession, createSession, setSessionCookie } from "@/lib/auth";

const VALID_ROLES = ["tutor", "parent", "student"] as const;

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
        const role = String(body.role ?? "");

        if (!VALID_ROLES.includes(role as any)) {
            return NextResponse.json(
                { error: "Некорректная роль" },
                { status: 400 },
            );
        }

        // Сохраняем роль
        await pool.execute(`UPDATE users SET role = ? WHERE id = ?`, [
            role,
            session.userId,
        ]);

        // Обновляем JWT с новой ролью
        const newToken = await createSession({
            userId: session.userId,
            email: session.email,
            role: role as any,
        });
        await setSessionCookie(newToken);

        return NextResponse.json({ success: true, role });
    } catch (error) {
        console.error("set-role error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
