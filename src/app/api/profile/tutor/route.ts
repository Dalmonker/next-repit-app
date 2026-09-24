import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

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
const MAX_EDUCATION_LENGTH = 1000;
const MAX_HOURLY_RATE = 100000;

// Валидация
function validateTutor(body: any) {
    const result: {
        subjects?: string[];
        hourly_rate?: number;
        experience_years?: number;
        education?: string;
    } = {};

    // --- Subjects ---
    if (body.subjects !== undefined) {
        if (!Array.isArray(body.subjects)) {
            return {
                ok: false as const,
                error: "subjects должен быть массивом",
            };
        }

        // Нормализация и очистка
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
            // Уникальность
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

    // --- Hourly rate ---
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

    // --- Experience ---
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

    // --- Education ---
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

// ================= GET =================
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

        const [rows]: any = await pool.execute(
            `SELECT subjects, hourly_rate, experience_years, education
             FROM tutor_profiles WHERE user_id = ?`,
            [session.userId],
        );

        if (rows.length === 0) {
            // Профиль ещё не создан — возвращаем пусто
            return NextResponse.json({
                subjects: [],
                hourly_rate: null,
                experience_years: null,
                education: null,
                preset_subjects: PRESET_SUBJECTS,
            });
        }

        const r = rows[0];

        // subjects хранится как JSON-строка
        let subjects: string[] = [];
        try {
            subjects = r.subjects ? JSON.parse(r.subjects) : [];
        } catch {
            subjects = [];
        }

        return NextResponse.json({
            subjects,
            hourly_rate: r.hourly_rate ? Number(r.hourly_rate) : null,
            experience_years: r.experience_years,
            education: r.education,
            preset_subjects: PRESET_SUBJECTS,
        });
    } catch (error) {
        console.error("profile/tutor GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

// ================= POST =================
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

        const data = result.data;

        // Готовим поля для UPSERT
        const subjectsJson = data.subjects
            ? JSON.stringify(data.subjects)
            : null;

        // UPSERT: если профиля нет — создаём, если есть — обновляем
        await pool.execute(
            `INSERT INTO tutor_profiles (user_id, subjects, hourly_rate, experience_years, education)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                subjects = COALESCE(VALUES(subjects), subjects),
                hourly_rate = COALESCE(VALUES(hourly_rate), hourly_rate),
                experience_years = COALESCE(VALUES(experience_years), experience_years),
                education = COALESCE(VALUES(education), education)`,
            [
                session.userId,
                subjectsJson,
                data.hourly_rate ?? null,
                data.experience_years ?? null,
                data.education ?? null,
            ],
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("profile/tutor POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
