import pool from "@/lib/db";

export type CreateInvitationResult =
    { ok: true; invitationId: number } | { ok: false; error: string };

export async function createInvitation(
    studentId: number,
    tutorId: number,
    message: string | null,
): Promise<CreateInvitationResult> {
    // 1. Нельзя пригласить самого себя
    if (studentId === tutorId) {
        return { ok: false, error: "Нельзя пригласить самого себя" };
    }

    // 2. Проверяем, что репетитор существует и approved
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

    // 3. Проверяем, что нет активного приглашения
    const [existing]: any = await pool.execute(
        `SELECT id FROM invitations
         WHERE student_id = ? AND tutor_id = ? AND status = 'pending'
         LIMIT 1`,
        [studentId, tutorId],
    );

    if (existing.length > 0) {
        return { ok: false, error: "Вы уже отправили заявку этому репетитору" };
    }

    // 4. Создаём
    const [result]: any = await pool.execute(
        `INSERT INTO invitations (student_id, tutor_id, message)
         VALUES (?, ?, ?)`,
        [studentId, tutorId, message],
    );

    return { ok: true, invitationId: result.insertId };
}
