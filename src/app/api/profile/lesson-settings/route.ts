import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLessonSettings, upsertLessonSettings } from "@/lib/lesson-settings";

// ============================================================
// GET — получить настройки уроков
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

        const settings = await getLessonSettings(session.userId);

        // Если записей нет — возвращаем дефолт
        if (!settings) {
            return NextResponse.json({
                free_trial: false,
                price_individual: null,
                price_group: null,
                start_interval: "30",
                default_duration: "45",
                min_time_before: "120",
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("lesson-settings GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

// ============================================================
// POST — обновить настройки
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

        // === Валидация тела ===
        const input: any = {};

        // free_trial
        if (body.free_trial !== undefined) {
            input.free_trial = Boolean(body.free_trial);
        }

        // price_individual — null, "" или число
        if (body.price_individual !== undefined) {
            if (
                body.price_individual === null ||
                body.price_individual === ""
            ) {
                input.price_individual = null;
            } else {
                input.price_individual = Number(body.price_individual);
            }
        }

        // price_group
        if (body.price_group !== undefined) {
            if (body.price_group === null || body.price_group === "") {
                input.price_group = null;
            } else {
                input.price_group = Number(body.price_group);
            }
        }

        // start_interval
        if (body.start_interval !== undefined) {
            input.start_interval = String(body.start_interval);
        }

        // default_duration
        if (body.default_duration !== undefined) {
            input.default_duration = String(body.default_duration);
        }

        // min_time_before
        if (body.min_time_before !== undefined) {
            input.min_time_before = String(body.min_time_before);
        }

        const result = await upsertLessonSettings(session.userId, input);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("lesson-settings POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
