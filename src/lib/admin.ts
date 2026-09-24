import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type PendingTutor = {
    // Пользователь
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    user_created_at: string;
    consent_at: string | null;
    consent_ip: string | null;
    consent_version: string | null;

    // Профиль репетитора
    status: "pending" | "approved" | "rejected" | "hidden";
    headline: string | null;
    subjects: string[];
    hourly_rate: number | null;
    experience_years: number | null;
    education: string | null;
    profile_created_at: string;
};

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// ============================================================
// Константы
// ============================================================

const MAX_REJECTION_REASON = 1000;

// ============================================================
// Список репетиторов на модерации
// ============================================================

export async function getPendingTutors(): Promise<PendingTutor[]> {
    const [rows]: any = await pool.execute(
        `SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.middle_name,
            u.phone,
            u.avatar_url,
            u.bio,
            u.created_at AS user_created_at,
            u.consent_at,
            u.consent_ip,
            u.consent_version,
            t.status,
            t.headline,
            t.subjects,
            t.hourly_rate,
            t.experience_years,
            t.education,
            t.created_at AS profile_created_at
         FROM users u
         INNER JOIN tutor_profiles t ON t.user_id = u.id
         WHERE u.role = 'tutor' AND t.status = 'pending'
         ORDER BY t.created_at ASC`,
    );

    return rows.map(mapPendingTutor);
}

// ============================================================
// Одобрить репетитора
// ============================================================

export async function approveTutor(
    tutorId: number,
    adminId: number,
): Promise<AdminActionResult> {
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
        return { ok: false, error: "Некорректный ID" };
    }
    if (!Number.isInteger(adminId) || adminId <= 0) {
        return { ok: false, error: "Некорректный админ" };
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Проверяем статус с блокировкой строки
        const [rows]: any = await conn.execute(
            `SELECT status FROM tutor_profiles WHERE user_id = ? FOR UPDATE`,
            [tutorId],
        );

        if (rows.length === 0) {
            await conn.rollback();
            return { ok: false, error: "Профиль не найден" };
        }
        if (rows[0].status !== "pending") {
            await conn.rollback();
            return { ok: false, error: "Репетитор уже обработан" };
        }

        // Обновляем
        await conn.execute(
            `UPDATE tutor_profiles
             SET status = 'approved',
                 moderated_at = NOW(),
                 moderated_by = ?,
                 rejection_reason = NULL
             WHERE user_id = ?`,
            [adminId, tutorId],
        );

        // Пишем в audit_log
        await conn.execute(
            `INSERT INTO audit_log (admin_id, action, target_user_id, metadata)
             VALUES (?, 'approve_tutor', ?, NULL)`,
            [adminId, tutorId],
        );

        await conn.commit();
        return { ok: true };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

// ============================================================
// Отклонить репетитора
// ============================================================

export async function rejectTutor(
    tutorId: number,
    adminId: number,
    reason: string,
): Promise<AdminActionResult> {
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
        return { ok: false, error: "Некорректный ID" };
    }
    if (!Number.isInteger(adminId) || adminId <= 0) {
        return { ok: false, error: "Некорректный админ" };
    }

    const trimmed = String(reason ?? "").trim();
    if (!trimmed) {
        return { ok: false, error: "Укажите причину отклонения" };
    }
    if (trimmed.length > MAX_REJECTION_REASON) {
        return {
            ok: false,
            error: `Причина максимум ${MAX_REJECTION_REASON} символов`,
        };
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows]: any = await conn.execute(
            `SELECT status FROM tutor_profiles WHERE user_id = ? FOR UPDATE`,
            [tutorId],
        );

        if (rows.length === 0) {
            await conn.rollback();
            return { ok: false, error: "Профиль не найден" };
        }
        if (rows[0].status !== "pending") {
            await conn.rollback();
            return { ok: false, error: "Репетитор уже обработан" };
        }

        await conn.execute(
            `UPDATE tutor_profiles
             SET status = 'rejected',
                 moderated_at = NOW(),
                 moderated_by = ?,
                 rejection_reason = ?
             WHERE user_id = ?`,
            [adminId, trimmed, tutorId],
        );

        await conn.execute(
            `INSERT INTO audit_log (admin_id, action, target_user_id, metadata)
             VALUES (?, 'reject_tutor', ?, ?)`,
            [adminId, tutorId, JSON.stringify({ reason: trimmed })],
        );

        await conn.commit();
        return { ok: true };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

// ============================================================
// Хелпер
// ============================================================

function mapPendingTutor(r: any): PendingTutor {
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
        email: r.email,
        first_name: r.first_name ?? null,
        last_name: r.last_name ?? null,
        middle_name: r.middle_name ?? null,
        phone: r.phone ?? null,
        avatar_url: r.avatar_url ?? null,
        bio: r.bio ?? null,
        user_created_at: r.user_created_at,
        consent_at: r.consent_at ?? null,
        consent_ip: r.consent_ip ?? null,
        consent_version: r.consent_version ?? null,
        status: r.status,
        headline: r.headline ?? null,
        subjects,
        hourly_rate: r.hourly_rate != null ? Number(r.hourly_rate) : null,
        experience_years: r.experience_years ?? null,
        education: r.education ?? null,
        profile_created_at: r.profile_created_at,
    };
}
