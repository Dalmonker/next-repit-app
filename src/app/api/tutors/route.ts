import { NextResponse } from "next/server";
import pool from "@/lib/db";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const requestedLimit =
            Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE;
        const limit = Math.min(Math.max(1, requestedLimit), MAX_PAGE_SIZE);
        const offset = (page - 1) * limit;

        const [rows]: any = await pool.execute(
            `SELECT 
                u.id, u.first_name, u.last_name, u.avatar_url, u.bio,
                t.headline, t.subjects, t.hourly_rate, t.experience_years
             FROM users u
             INNER JOIN tutor_profiles t ON t.user_id = u.id
             WHERE u.role = 'tutor' AND t.status = 'approved'
             ORDER BY t.moderated_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
        );

        const [countRows]: any = await pool.execute(
            `SELECT COUNT(*) as total
             FROM users u
             INNER JOIN tutor_profiles t ON t.user_id = u.id
             WHERE u.role = 'tutor' AND t.status = 'approved'`,
        );
        const total = countRows[0].total;

        const tutors = rows.map((r: any) => ({
            id: r.id,
            first_name: r.first_name,
            last_name: r.last_name,
            avatar_url: r.avatar_url,
            bio: r.bio,
            headline: r.headline,
            subjects: r.subjects ? JSON.parse(r.subjects) : [],
            hourly_rate: r.hourly_rate ? Number(r.hourly_rate) : null,
            experience_years: r.experience_years,
        }));

        return NextResponse.json({
            tutors,
            page,
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("tutors GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
