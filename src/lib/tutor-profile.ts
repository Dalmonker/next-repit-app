import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type TutorProfileStatus =
    "draft" | "pending" | "approved" | "rejected" | "hidden";

export type TutorProfileData = {
    status: TutorProfileStatus;
    subjects: string[];
    hourly_rate: number | null;
    experience_years: number | null;
    education: string | null;
    rejection_reason: string | null;
};

export type TutorProfileUpsert = {
    subjects?: string[];
    hourly_rate?: number;
    experience_years?: number;
    education?: string;
};

// ============================================================
// Чтение профиля
// ============================================================

export async function getTutorProfile(
    userId: number,
): Promise<TutorProfileData | null> {
    const [rows]: any = await pool.execute(
        `SELECT status, subjects, hourly_rate, experience_years, education, rejection_reason
         FROM tutor_profiles WHERE user_id = ? LIMIT 1`,
        [userId],
    );

    if (rows.length === 0) return null;

    const r = rows[0];

    let subjects: string[] = [];
    if (r.subjects) {
        try {
            const parsed = JSON.parse(r.subjects);
            if (Array.isArray(parsed)) {
                subjects = parsed.filter((s: any) => typeof s === "string");
            }
        } catch {
            subjects = [];
        }
    }

    return {
        status: r.status,
        subjects,
        hourly_rate: r.hourly_rate != null ? Number(r.hourly_rate) : null,
        experience_years: r.experience_years ?? null,
        education: r.education ?? null,
        rejection_reason: r.rejection_reason ?? null,
    };
}

// ============================================================
// Создание/обновление профиля
// ============================================================

export async function upsertTutorProfile(
    userId: number,
    data: TutorProfileUpsert,
): Promise<void> {
    const subjectsJson = data.subjects ? JSON.stringify(data.subjects) : null;

    await pool.execute(
        `INSERT INTO tutor_profiles (user_id, subjects, hourly_rate, experience_years, education)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            subjects = COALESCE(VALUES(subjects), subjects),
            hourly_rate = COALESCE(VALUES(hourly_rate), hourly_rate),
            experience_years = COALESCE(VALUES(experience_years), experience_years),
            education = COALESCE(VALUES(education), education)`,
        [
            userId,
            subjectsJson,
            data.hourly_rate ?? null,
            data.experience_years ?? null,
            data.education ?? null,
        ],
    );
}

// ============================================================
// Отправка на проверку
// ============================================================

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitForReview(userId: number): Promise<SubmitResult> {
    const [rows]: any = await pool.execute(
        `SELECT status, subjects, hourly_rate, education
         FROM tutor_profiles WHERE user_id = ? LIMIT 1`,
        [userId],
    );

    if (rows.length === 0) {
        return { ok: false, error: "Профиль не найден" };
    }

    const profile = rows[0];

    if (profile.status === "pending") {
        return { ok: false, error: "Профиль уже на модерации" };
    }
    if (profile.status === "approved") {
        return { ok: false, error: "Профиль уже одобрен" };
    }
    if (profile.status === "hidden") {
        return { ok: false, error: "Профиль скрыт администратором" };
    }
    if (profile.status !== "draft" && profile.status !== "rejected") {
        return { ok: false, error: "Нельзя отправить в текущем статусе" };
    }

    let subjects: string[] = [];
    if (profile.subjects) {
        try {
            const parsed = JSON.parse(profile.subjects);
            if (Array.isArray(parsed)) subjects = parsed;
        } catch {
            subjects = [];
        }
    }

    if (subjects.length === 0) {
        return { ok: false, error: "Добавьте хотя бы один предмет" };
    }
    if (profile.hourly_rate == null || Number(profile.hourly_rate) <= 0) {
        return { ok: false, error: "Укажите цену за урок" };
    }
    if (!profile.education || !String(profile.education).trim()) {
        return { ok: false, error: "Заполните образование" };
    }

    const [result]: any = await pool.execute(
        `UPDATE tutor_profiles
         SET status = 'pending',
             rejection_reason = NULL,
             moderated_at = NULL,
             moderated_by = NULL
         WHERE user_id = ? AND status IN ('draft', 'rejected')`,
        [userId],
    );

    if (result.affectedRows === 0) {
        return { ok: false, error: "Не удалось отправить. Попробуйте ещё раз" };
    }

    return { ok: true };
}
