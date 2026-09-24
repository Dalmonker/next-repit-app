import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type CreateInvitationResult =
    { ok: true; invitationId: number } | { ok: false; error: string };

export type TutorInvitationItem = {
    id: number;
    student_id: number;
    student_first_name: string | null;
    student_last_name: string | null;
    student_avatar_url: string | null;
    message: string | null;
    created_at: string;
};

export type TutorStudentItem = {
    id: number;
    student_id: number;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    started_at: string;
};

export type InvitationActionResult =
    { ok: true } | { ok: false; error: string };

export type AcceptInvitationResult =
    | {
          ok: true;
          studentEmail: string;
          studentName: string;
          tutorName: string;
      }
    | { ok: false; error: string };

// ============================================================
// Создание приглашения (ученик → репетитор)
// ============================================================

export async function createInvitation(
    studentId: number,
    tutorId: number,
    message: string | null,
): Promise<CreateInvitationResult> {
    if (studentId === tutorId) {
        return { ok: false, error: "Нельзя пригласить самого себя" };
    }

    const [tutorRows]: any = await pool.execute(
        `SELECT u.id
         FROM users u
         INNER JOIN tutor_profiles t ON t.user_id = u.id
         WHERE u.id = ? AND u.role = 'tutor' AND t.status = 'approved'
         LIMIT 1`,
        [tutorId],
    );

    if (tutorRows.length === 0) {
        return { ok: false, error: "Репетитор не найден" };
    }

    const [enrolled]: any = await pool.execute(
        `SELECT id FROM tutor_students
         WHERE tutor_id = ? AND student_id = ? AND status = 'active'
         LIMIT 1`,
        [tutorId, studentId],
    );

    if (enrolled.length > 0) {
        return { ok: false, error: "Вы уже занимаетесь с этим репетитором" };
    }

    const [existing]: any = await pool.execute(
        `SELECT id FROM invitations
         WHERE student_id = ? AND tutor_id = ? AND status = 'pending'
         LIMIT 1`,
        [studentId, tutorId],
    );

    if (existing.length > 0) {
        return { ok: false, error: "Вы уже отправили заявку этому репетитору" };
    }

    const [result]: any = await pool.execute(
        `INSERT INTO invitations (student_id, tutor_id, message)
         VALUES (?, ?, ?)`,
        [studentId, tutorId, message],
    );

    return { ok: true, invitationId: result.insertId };
}

// ============================================================
// Список приглашений для репетитора
// ============================================================

export async function getTutorInvitations(
    tutorId: number,
): Promise<TutorInvitationItem[]> {
    const [rows]: any = await pool.execute(
        `SELECT 
            i.id,
            i.student_id,
            i.message,
            i.created_at,
            u.first_name AS student_first_name,
            u.last_name AS student_last_name,
            u.avatar_url AS student_avatar_url
         FROM invitations i
         INNER JOIN users u ON u.id = i.student_id
         WHERE i.tutor_id = ? AND i.status = 'pending'
         ORDER BY i.created_at ASC`,
        [tutorId],
    );

    return rows.map((r: any) => ({
        id: r.id,
        student_id: r.student_id,
        student_first_name: r.student_first_name ?? null,
        student_last_name: r.student_last_name ?? null,
        student_avatar_url: r.student_avatar_url ?? null,
        message: r.message ?? null,
        created_at: r.created_at,
    }));
}

// ============================================================
// Список активных учеников репетитора
// ============================================================

export async function getTutorStudents(
    tutorId: number,
): Promise<TutorStudentItem[]> {
    const [rows]: any = await pool.execute(
        `SELECT 
            ts.id,
            ts.student_id,
            ts.started_at,
            u.first_name,
            u.last_name,
            u.avatar_url
         FROM tutor_students ts
         INNER JOIN users u ON u.id = ts.student_id
         WHERE ts.tutor_id = ? AND ts.status = 'active'
         ORDER BY ts.started_at DESC`,
        [tutorId],
    );

    return rows.map((r: any) => ({
        id: r.id,
        student_id: r.student_id,
        first_name: r.first_name ?? null,
        last_name: r.last_name ?? null,
        avatar_url: r.avatar_url ?? null,
        started_at: r.started_at,
    }));
}

// ============================================================
// Принять приглашение
// ============================================================

export async function acceptInvitation(
    invitationId: number,
    tutorId: number,
): Promise<AcceptInvitationResult> {
    if (!Number.isInteger(invitationId) || invitationId <= 0) {
        return { ok: false, error: "Некорректный ID" };
    }
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
        return { ok: false, error: "Некорректный репетитор" };
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Блокируем строку + данные ученика
        const [rows]: any = await conn.execute(
            `SELECT 
                i.student_id,
                i.status,
                u.email AS student_email,
                u.first_name AS student_first_name,
                u.last_name AS student_last_name
             FROM invitations i
             INNER JOIN users u ON u.id = i.student_id
             WHERE i.id = ? AND i.tutor_id = ?
             FOR UPDATE`,
            [invitationId, tutorId],
        );

        if (rows.length === 0) {
            await conn.rollback();
            return { ok: false, error: "Приглашение не найдено" };
        }

        const inv = rows[0];

        if (inv.status !== "pending") {
            await conn.rollback();
            return { ok: false, error: "Приглашение уже обработано" };
        }

        // 2. Проверяем, что между этой парой НЕТ accepted (кроме текущей заявки)
        const [dupCheck]: any = await conn.execute(
            `SELECT id FROM invitations
             WHERE student_id = ? AND tutor_id = ? AND status = 'accepted' AND id != ?
             LIMIT 1`,
            [inv.student_id, tutorId, invitationId],
        );

        if (dupCheck.length > 0) {
            await conn.rollback();
            return {
                ok: false,
                error: "Связь с этим учеником уже установлена",
            };
        }

        // 3. Имя репетитора
        const [tutorRows]: any = await conn.execute(
            `SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1`,
            [tutorId],
        );

        if (tutorRows.length === 0) {
            await conn.rollback();
            return { ok: false, error: "Репетитор не найден" };
        }

        const tutor = tutorRows[0];

        // 4. Обновляем приглашение
        await conn.execute(
            `UPDATE invitations SET status = 'accepted' WHERE id = ?`,
            [invitationId],
        );

        // 5. Создаём/обновляем связь
        await conn.execute(
            `INSERT INTO tutor_students (tutor_id, student_id, status)
             VALUES (?, ?, 'active')
             ON DUPLICATE KEY UPDATE
                status = 'active',
                ended_at = NULL,
                started_at = IF(status = 'ended', NOW(), started_at)`,
            [tutorId, inv.student_id],
        );

        await conn.commit();

        const studentName =
            [inv.student_first_name, inv.student_last_name]
                .filter(Boolean)
                .join(" ") || "Ученик";

        const tutorName =
            [tutor.first_name, tutor.last_name].filter(Boolean).join(" ") ||
            "Репетитор";

        return {
            ok: true,
            studentEmail: inv.student_email,
            studentName,
            tutorName,
        };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

// ============================================================
// Отклонить приглашение
// ============================================================

export async function rejectInvitation(
    invitationId: number,
    tutorId: number,
): Promise<InvitationActionResult> {
    if (!Number.isInteger(invitationId) || invitationId <= 0) {
        return { ok: false, error: "Некорректный ID" };
    }
    if (!Number.isInteger(tutorId) || tutorId <= 0) {
        return { ok: false, error: "Некорректный репетитор" };
    }

    const [result]: any = await pool.execute(
        `UPDATE invitations
         SET status = 'rejected'
         WHERE id = ? AND tutor_id = ? AND status = 'pending'`,
        [invitationId, tutorId],
    );

    if (result.affectedRows === 0) {
        return {
            ok: false,
            error: "Приглашение не найдено или уже обработано",
        };
    }

    return { ok: true };
}
