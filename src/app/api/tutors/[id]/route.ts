import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const tutorId = Number(id);

        if (!Number.isInteger(tutorId) || tutorId <= 0) {
            return NextResponse.json(
                { error: "Некорректный ID" },
                { status: 400 },
            );
        }

        const [rows]: any = await pool.execute(
            `SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.middle_name,
                u.avatar_url,
                u.bio,
                t.headline,
                t.subjects,
                t.hourly_rate,
                t.experience_years,
                t.education
             FROM users u
             INNER JOIN tutor_profiles t ON t.user_id = u.id
             WHERE u.id = ? AND u.role = 'tutor' AND t.status = 'approved'
             LIMIT 1`,
            [tutorId],
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Репетитор не найден" },
                { status: 404 },
            );
        }

        const r = rows[0];

        const tutor = {
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            middle_name: r.middle_name,
            avatar_url: r.avatar_url,
            bio: r.bio,
            headline: r.headline,
            subjects: r.subjects ? JSON.parse(r.subjects) : [],
            hourly_rate: r.hourly_rate ? Number(r.hourly_rate) : null,
            experience_years: r.experience_years,
            education: r.education,
        };

        return NextResponse.json({ tutor });
    } catch (error) {
        console.error("tutor GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
