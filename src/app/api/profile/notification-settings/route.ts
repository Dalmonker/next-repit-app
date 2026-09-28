import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
    getNotificationSettings,
    upsertNotificationSettings,
    DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/notification-settings";

// ============================================================
// GET
// ============================================================

export async function GET() {
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

        const settings = await getNotificationSettings(session.userId);

        // Если записи нет — дефолт
        if (!settings) {
            return NextResponse.json(DEFAULT_NOTIFICATION_SETTINGS);
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("notification-settings GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

// ============================================================
// POST
// ============================================================

export async function POST(request: Request) {
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

        const body = await request.json();
        const input: any = {};

        if (body.lesson_reminder !== undefined) {
            input.lesson_reminder = Boolean(body.lesson_reminder);
        }
        if (body.lesson_reminder_before !== undefined) {
            input.lesson_reminder_before = String(body.lesson_reminder_before);
        }
        if (body.new_invitation !== undefined) {
            input.new_invitation = Boolean(body.new_invitation);
        }
        if (body.new_booking !== undefined) {
            input.new_booking = Boolean(body.new_booking);
        }
        if (body.marketing_emails !== undefined) {
            input.marketing_emails = Boolean(body.marketing_emails);
        }

        const result = await upsertNotificationSettings(session.userId, input);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("notification-settings POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
