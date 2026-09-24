import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_GRADES = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "Дошкольник",
];

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        if (session.role !== "student") {
            return NextResponse.json(
                { error: "Только для учеников" },
                { status: 403 },
            );
        }

        const [rows]: any = await pool.execute(
            `SELECT grade FROM student_profiles WHERE user_id = ?`,
            [session.userId],
        );

        return NextResponse.json({
            grade: rows[0]?.grade ?? null,
        });
    } catch (error) {
        console.error("profile/student GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        if (session.role !== "student") {
            return NextResponse.json(
                { error: "Только для учеников" },
                { status: 403 },
            );
        }

        const body = await request.json();
        const grade = String(body.grade ?? "").trim();

        if (!VALID_GRADES.includes(grade)) {
            return NextResponse.json(
                { error: "Некорректный класс" },
                { status: 400 },
            );
        }

        // Проверяем, что профиль существует
        const [existing]: any = await pool.execute(
            `SELECT user_id FROM student_profiles WHERE user_id = ?`,
            [session.userId],
        );

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Профиль ученика не найден" },
                { status: 404 },
            );
        }

        await pool.execute(
            `UPDATE student_profiles SET grade = ? WHERE user_id = ?`,
            [grade, session.userId],
        );

        return NextResponse.json({ success: true, grade });
    } catch (error) {
        console.error("profile/student error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
