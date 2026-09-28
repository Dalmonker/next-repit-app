import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type StartInterval = "15" | "30" | "60";
export type DefaultDuration = "30" | "45" | "60" | "90" | "120";
export type MinTimeBefore = "60" | "120" | "180" | "240" | "1440";

export type LessonSettings = {
    free_trial: boolean;
    price_individual: number | null;
    price_group: number | null;
    start_interval: StartInterval;
    default_duration: DefaultDuration;
    min_time_before: MinTimeBefore;
};

export type LessonSettingsInput = {
    free_trial?: boolean;
    price_individual?: number | null;
    price_group?: number | null;
    start_interval?: StartInterval;
    default_duration?: DefaultDuration;
    min_time_before?: MinTimeBefore;
};

// ============================================================
// Константы
// ============================================================

const MAX_PRICE = 100000;

const VALID_START_INTERVALS: StartInterval[] = ["15", "30", "60"];
const VALID_DURATIONS: DefaultDuration[] = ["30", "45", "60", "90", "120"];
const VALID_MIN_TIME: MinTimeBefore[] = ["60", "120", "180", "240", "1440"];

// ============================================================
// Чтение
// ============================================================

export async function getLessonSettings(
    userId: number,
): Promise<LessonSettings | null> {
    const [rows]: any = await pool.execute(
        `SELECT 
            free_trial,
            price_individual,
            price_group,
            start_interval,
            default_duration,
            min_time_before
         FROM tutor_lesson_settings
         WHERE user_id = ?
         LIMIT 1`,
        [userId],
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
        free_trial: Boolean(r.free_trial),
        price_individual:
            r.price_individual != null ? Number(r.price_individual) : null,
        price_group: r.price_group != null ? Number(r.price_group) : null,
        start_interval: r.start_interval,
        default_duration: r.default_duration,
        min_time_before: r.min_time_before,
    };
}

// ============================================================
// Обновление (UPSERT)
// ============================================================

export type UpsertResult = { ok: true } | { ok: false; error: string };

export async function upsertLessonSettings(
    userId: number,
    data: LessonSettingsInput,
): Promise<UpsertResult> {
    // --- Валидация price_individual ---
    if (data.price_individual !== undefined && data.price_individual !== null) {
        if (
            !Number.isFinite(data.price_individual) ||
            data.price_individual <= 0 ||
            data.price_individual > MAX_PRICE
        ) {
            return {
                ok: false,
                error: "Цена должна быть больше 0",
            };
        }
    }

    // --- Валидация price_group ---
    if (data.price_group !== undefined && data.price_group !== null) {
        if (
            !Number.isFinite(data.price_group) ||
            data.price_group <= 0 ||
            data.price_group > MAX_PRICE
        ) {
            return {
                ok: false,
                error: "Цена должна быть больше 0",
            };
        }
    }

    // --- Валидация ENUM ---
    if (
        data.start_interval !== undefined &&
        !VALID_START_INTERVALS.includes(data.start_interval)
    ) {
        return { ok: false, error: "Некорректный интервал начала" };
    }
    if (
        data.default_duration !== undefined &&
        !VALID_DURATIONS.includes(data.default_duration)
    ) {
        return { ok: false, error: "Некорректная длительность урока" };
    }
    if (
        data.min_time_before !== undefined &&
        !VALID_MIN_TIME.includes(data.min_time_before)
    ) {
        return { ok: false, error: "Некорректное минимальное время" };
    }

    // --- UPSERT ---
    await pool.execute(
        `INSERT INTO tutor_lesson_settings 
            (user_id, free_trial, price_individual, price_group, 
             start_interval, default_duration, min_time_before)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            free_trial = COALESCE(VALUES(free_trial), free_trial),
            price_individual = VALUES(price_individual),
            price_group = VALUES(price_group),
            start_interval = COALESCE(VALUES(start_interval), start_interval),
            default_duration = COALESCE(VALUES(default_duration), default_duration),
            min_time_before = COALESCE(VALUES(min_time_before), min_time_before)`,
        [
            userId,
            data.free_trial ?? false,
            data.price_individual ?? null,
            data.price_group ?? null,
            data.start_interval ?? "30",
            data.default_duration ?? "45",
            data.min_time_before ?? "120",
        ],
    );

    return { ok: true };
}
