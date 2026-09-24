import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type TutorListItem = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    headline: string | null;
    subjects: string[];
    hourly_rate: number | null;
    experience_years: number | null;
};

export type TutorDetail = TutorListItem & {
    middle_name: string | null;
    education: string | null;
};

// ============================================================
// Константы
// ============================================================

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 12;

// ============================================================
// Функции
// ============================================================

// ----- Список одобренных репетиторов (пагинация) -----
export async function getApprovedTutors(
    page: number = 1,
    limit: number = DEFAULT_LIMIT,
): Promise<{
    tutors: TutorListItem[];
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
}> {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const [rows]: any = await pool.execute(
        `SELECT 
            u.id, u.first_name, u.last_name, u.avatar_url, u.bio,
            t.headline, t.subjects, t.hourly_rate, t.experience_years
         FROM users u
         INNER JOIN tutor_profiles t ON t.user_id = u.id
         WHERE u.role = 'tutor' AND t.status = 'approved'
         ORDER BY t.moderated_at DESC
         LIMIT ? OFFSET ?`,
        [safeLimit, offset],
    );

    const [countRows]: any = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM users u
         INNER JOIN tutor_profiles t ON t.user_id = u.id
         WHERE u.role = 'tutor' AND t.status = 'approved'`,
    );

    const total = countRows[0].total;

    return {
        tutors: rows.map(mapListItem),
        total,
        totalPages: Math.ceil(total / safeLimit),
        page: safePage,
        pageSize: safeLimit,
    };
}

// ----- Один одобренный репетитор по id -----
export async function getApprovedTutorById(
    id: number,
): Promise<TutorDetail | null> {
    if (!Number.isInteger(id) || id <= 0) return null;

    const [rows]: any = await pool.execute(
        `SELECT 
            u.id, u.first_name, u.last_name, u.middle_name, u.avatar_url, u.bio,
            t.headline, t.subjects, t.hourly_rate, t.experience_years, t.education
         FROM users u
         INNER JOIN tutor_profiles t ON t.user_id = u.id
         WHERE u.id = ? AND u.role = 'tutor' AND t.status = 'approved'
         LIMIT 1`,
        [id],
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
        ...mapListItem(r),
        middle_name: r.middle_name ?? null,
        education: r.education ?? null,
    };
}

// ============================================================
// Хелпер: строка БД → объект
// ============================================================

function mapListItem(r: any): TutorListItem {
    let subjects: string[] = [];
    if (r.subjects) {
        try {
            const parsed = JSON.parse(r.subjects);
            if (Array.isArray(parsed)) {
                subjects = parsed.filter((s) => typeof s === "string");
            }
        } catch {
            subjects = [];
        }
    }

    return {
        id: r.id,
        first_name: r.first_name ?? null,
        last_name: r.last_name ?? null,
        avatar_url: r.avatar_url ?? null,
        bio: r.bio ?? null,
        headline: r.headline ?? null,
        subjects,
        hourly_rate: r.hourly_rate != null ? Number(r.hourly_rate) : null,
        experience_years: r.experience_years ?? null,
    };
}
