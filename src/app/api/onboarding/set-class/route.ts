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

        await pool.execute(
            `INSERT INTO student_profiles (user_id, grade) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE grade = VALUES(grade)`,
            [session.userId, grade],
        );

        return NextResponse.json({ success: true, grade });
    } catch (error) {
        console.error("set-class error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
