import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createInvitation } from "@/lib/invitations";

const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: Request) {
    try {
        // 1. Сессия
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 },
            );
        }

        // 2. Только ученик (пока)
        if (session.role !== "student") {
            return NextResponse.json(
                { error: "Только ученики могут отправлять приглашения" },
                { status: 403 },
            );
        }

        // 3. Тело запроса
        const body = await request.json();
        const tutorId = Number(body.tutorId);
        const rawMessage = body.message;
        const message =
            typeof rawMessage === "string" && rawMessage.trim()
                ? rawMessage.trim()
                : null;

        // 4. Валидация tutorId
        if (!Number.isInteger(tutorId) || tutorId <= 0) {
            return NextResponse.json(
                { error: "Некорректный ID репетитора" },
                { status: 400 },
            );
        }

        // 5. Валидация message
        if (message && message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Сообщение максимум ${MAX_MESSAGE_LENGTH} символов` },
                { status: 400 },
            );
        }

        // 6. Создаём
        const result = await createInvitation(session.userId, tutorId, message);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            invitationId: result.invitationId,
        });
    } catch (error) {
        console.error("invitations POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
