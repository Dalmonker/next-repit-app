import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { acceptInvitation } from "@/lib/invitations";
import { sendInvitationAcceptedEmail } from "@/lib/mailer";

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

        const result = await acceptInvitation(invitationId, session.userId);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Email — в try/catch, чтобы ошибка SMTP не ломала ответ
        try {
            await sendInvitationAcceptedEmail(
                result.studentEmail,
                result.tutorName,
                result.studentName,
            );
        } catch (emailError) {
            console.error("Email send error (accept):", emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("invitation accept error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
