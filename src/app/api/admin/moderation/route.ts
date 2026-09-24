import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { approveTutor, rejectTutor } from "@/lib/admin";

const VALID_ACTIONS = ["approve", "reject"] as const;
type Action = (typeof VALID_ACTIONS)[number];

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

        // 2. Только админ
        if (session.role !== "admin") {
            return NextResponse.json(
                { error: "Доступ запрещён" },
                { status: 403 },
            );
        }

        // 3. Тело запроса
        const body = await request.json();
        const action = String(body.action ?? "") as Action;
        const tutorId = Number(body.tutorId);
        const reason =
            typeof body.reason === "string" ? body.reason.trim() : "";

        // 4. Валидация action
        if (!VALID_ACTIONS.includes(action)) {
            return NextResponse.json(
                { error: "Некорректное действие" },
                { status: 400 },
            );
        }

        // 5. Валидация tutorId
        if (!Number.isInteger(tutorId) || tutorId <= 0) {
            return NextResponse.json(
                { error: "Некорректный ID репетитора" },
                { status: 400 },
            );
        }

        // 6. Выполняем
        let result;
        if (action === "approve") {
            result = await approveTutor(tutorId, session.userId);
        } else {
            // reject: reason обязателен
            if (!reason) {
                return NextResponse.json(
                    { error: "Укажите причину отклонения" },
                    { status: 400 },
                );
            }
            result = await rejectTutor(tutorId, session.userId, reason);
        }

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("admin moderation error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
