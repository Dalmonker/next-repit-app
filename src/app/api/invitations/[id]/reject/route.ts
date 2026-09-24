import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rejectInvitation } from "@/lib/invitations";
import { sendInvitationRejectedEmail } from "@/lib/mailer";
import pool from "@/lib/db";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        if (session.role !== "tutor") {
            return NextResponse.json(
                { error: "Только для репетиторов" },
                { status: 403 },
            );
        }

        const { id } = await params;
        const invitationId = Number(id);

        if (!Number.isInteger(invitationId) || invitationId <= 0) {
            return NextResponse.json(
                { error: "Некорректный ID" },
                { status: 400 },
            );
        }

        // Получаем данные ДО отклонения (потом статус изменится)
        const [infoRows]: any = await pool.execute(
            `SELECT 
                u.email AS student_email,
                u.first_name AS student_first_name,
                u.last_name AS student_last_name,
                t.first_name AS tutor_first_name,
                t.last_name AS tutor_last_name
             FROM invitations i
             INNER JOIN users u ON u.id = i.student_id
             INNER JOIN users t ON t.id = i.tutor_id
             WHERE i.id = ? AND i.tutor_id = ? AND i.status = 'pending'
             LIMIT 1`,
            [invitationId, session.userId],
        );

        const result = await rejectInvitation(invitationId, session.userId);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Email — если данные получены
        if (infoRows.length > 0) {
            const info = infoRows[0];
            const studentName =
                [info.student_first_name, info.student_last_name]
                    .filter(Boolean)
                    .join(" ") || "Ученик";
            const tutorName =
                [info.tutor_first_name, info.tutor_last_name]
                    .filter(Boolean)
                    .join(" ") || "Репетитор";

            try {
                await sendInvitationRejectedEmail(
                    info.student_email,
                    tutorName,
                    studentName,
                );
            } catch (emailError) {
                console.error("Email send error (reject):", emailError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("invitation reject error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
