import pool from "@/lib/db";

// ============================================================
// Типы
// ============================================================

export type LessonReminderBefore = "30" | "60" | "120" | "180" | "1440";

export type NotificationSettings = {
    lesson_reminder: boolean;
    lesson_reminder_before: LessonReminderBefore;
    new_invitation: boolean;
    new_booking: boolean;
    marketing_emails: boolean;
};

export type NotificationSettingsInput = {
    lesson_reminder?: boolean;
    lesson_reminder_before?: LessonReminderBefore;
    new_invitation?: boolean;
    new_booking?: boolean;
    marketing_emails?: boolean;
};

// ============================================================
// Константы
// ============================================================

const VALID_REMINDER_BEFORE: LessonReminderBefore[] = [
    "30",
    "60",
    "120",
    "180",
    "1440",
];

// ============================================================
// Дефолт (когда записи ещё нет)
// ============================================================

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    lesson_reminder: true,
    lesson_reminder_before: "30",
    new_invitation: true,
    new_booking: true,
    marketing_emails: false,
};

// ============================================================
// Чтение
// ============================================================

export async function getNotificationSettings(
    userId: number,
): Promise<NotificationSettings | null> {
    const [rows]: any = await pool.execute(
        `SELECT 
            lesson_reminder,
            lesson_reminder_before,
            new_invitation,
            new_booking,
            marketing_emails
         FROM tutor_notification_settings
         WHERE user_id = ?
         LIMIT 1`,
        [userId],
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
        lesson_reminder: Boolean(r.lesson_reminder),
        lesson_reminder_before: r.lesson_reminder_before,
        new_invitation: Boolean(r.new_invitation),
        new_booking: Boolean(r.new_booking),
        marketing_emails: Boolean(r.marketing_emails),
    };
}

// ============================================================
// Обновление (UPSERT)
// ============================================================

export type UpsertResult = { ok: true } | { ok: false; error: string };

export async function upsertNotificationSettings(
    userId: number,
    data: NotificationSettingsInput,
): Promise<UpsertResult> {
    // Валидация ENUM
    if (
        data.lesson_reminder_before !== undefined &&
        !VALID_REMINDER_BEFORE.includes(data.lesson_reminder_before)
    ) {
        return {
            ok: false,
            error: "Некорректное время напоминания",
        };
    }

    // UPSERT
    await pool.execute(
        `INSERT INTO tutor_notification_settings 
            (user_id, lesson_reminder, lesson_reminder_before, 
             new_invitation, new_booking, marketing_emails)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            lesson_reminder = COALESCE(VALUES(lesson_reminder), lesson_reminder),
            lesson_reminder_before = COALESCE(VALUES(lesson_reminder_before), lesson_reminder_before),
            new_invitation = COALESCE(VALUES(new_invitation), new_invitation),
            new_booking = COALESCE(VALUES(new_booking), new_booking),
            marketing_emails = COALESCE(VALUES(marketing_emails), marketing_emails)`,
        [
            userId,
            data.lesson_reminder ??
                DEFAULT_NOTIFICATION_SETTINGS.lesson_reminder,
            data.lesson_reminder_before ??
                DEFAULT_NOTIFICATION_SETTINGS.lesson_reminder_before,
            data.new_invitation ?? DEFAULT_NOTIFICATION_SETTINGS.new_invitation,
            data.new_booking ?? DEFAULT_NOTIFICATION_SETTINGS.new_booking,
            data.marketing_emails ??
                DEFAULT_NOTIFICATION_SETTINGS.marketing_emails,
        ],
    );

    return { ok: true };
}
