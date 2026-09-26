import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
    getTutorProfile,
    upsertTutorProfile,
    hasCriticalTutorChanges,
    resetToPendingIfApproved,
} from "@/lib/tutor-profile";

// Разрешённые предметы (те, что в кнопках)
const PRESET_SUBJECTS = [
    "Математика",
    "Физика",
    "Химия",
    "Информатика",
    "Русский язык",
    "Белорусский язык",
    "Английский язык",
    "История",
    "Биология",
    "География",
    "Литература",
    "Обществознание",
    "Робототехника",
    "Программирование",
];

const MAX_SUBJECTS = 20;
const MAX_SUBJECT_LENGTH = 50;
const MAX_HEADLINE_LENGTH = 150;
const MAX_EDUCATION_LENGTH = 1000;
const MAX_HOURLY_RATE = 100000;

// ============================================================
// Валидация
// ============================================================

function validateTutor(body: any) {
    const result: {
        subjects?: string[];
        headline?: string;
        hourly_rate?: number;
        experience_years?: number;
        education?: string;
    } = {};

    if (body.subjects !== undefined) {
        if (!Array.isArray(body.subjects)) {
            return {
                ok: false as const,
                error: "subjects должен быть массивом",
            };
        }

        const cleaned: string[] = [];
        for (const raw of body.subjects) {
            if (typeof raw !== "string") continue;
            const s = raw.trim();
            if (!s) continue;
            if (s.length > MAX_SUBJECT_LENGTH) {
                return {
                    ok: false as const,
                    error: `Предмет слишком длинный: «${s.slice(0, 20)}...»`,
                };
            }
            if (!/^[А-Яа-яЁёA-Za-z0-9\- .,()]+$/.test(s)) {
                return {
                    ok: false as const,
                    error: `Недопустимые символы в предмете «${s}»`,
                };
            }
            if (!cleaned.includes(s)) cleaned.push(s);
        }

        if (cleaned.length > MAX_SUBJECTS) {
            return {
                ok: false as const,
                error: `Максимум ${MAX_SUBJECTS} предметов`,
            };
        }

        result.subjects = cleaned;
    }

    // --- Headline ---
    if (body.headline !== undefined) {
        const s = String(body.headline).trim();
        if (s.length > MAX_HEADLINE_LENGTH) {
            return {
                ok: false as const,
                error: `Короткое описание макс. ${MAX_HEADLINE_LENGTH} символов`,
            };
        }
        result.headline = s;
    }

    if (
        body.hourly_rate !== undefined &&
        body.hourly_rate !== null &&
        body.hourly_rate !== ""
    ) {
        const n = Number(String(body.hourly_rate).replace(",", "."));
        if (!Number.isFinite(n) || n <= 0 || n > MAX_HOURLY_RATE) {
            return { ok: false as const, error: "Некорректная цена за урок" };
        }
        result.hourly_rate = Math.round(n * 100) / 100;
    }

    if (
        body.experience_years !== undefined &&
        body.experience_years !== null &&
        body.experience_years !== ""
    ) {
        const n = Number(body.experience_years);
        if (!Number.isInteger(n) || n < 0 || n > 80) {
            return {
                ok: false as const,
                error: "Некорректный опыт (0–80 лет)",
            };
        }
        result.experience_years = n;
    }

    if (body.education !== undefined) {
        const s = String(body.education).trim();
        if (s.length > MAX_EDUCATION_LENGTH) {
            return {
                ok: false as const,
                error: `Образование макс. ${MAX_EDUCATION_LENGTH} символов`,
            };
        }
        result.education = s;
    }

    return { ok: true as const, data: result };
}

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

        const profile = await getTutorProfile(session.userId);

        if (!profile) {
            return NextResponse.json({
                status: null,
                subjects: [],
                headline: null,
                hourly_rate: null,
                experience_years: null,
                education: null,
                rejection_reason: null,
                preset_subjects: PRESET_SUBJECTS,
            });
        }

        return NextResponse.json({
            ...profile,
            preset_subjects: PRESET_SUBJECTS,
        });
    } catch (error) {
        console.error("profile/tutor GET error:", error);
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
        const result = validateTutor(body);

        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // 1. Читаем текущий профиль (до обновления)
        const current = await getTutorProfile(session.userId);

        // 2. Обновляем
        await upsertTutorProfile(session.userId, result.data);

        // 3. Если были критичные изменения и статус был approved — сбрасываем в pending
        if (
            current?.status === "approved" &&
            hasCriticalTutorChanges(current, result.data)
        ) {
            await resetToPendingIfApproved(session.userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("profile/tutor POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
