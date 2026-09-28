"use client";

import { useEffect, useState } from "react";

// ============================================================
// Константы
// ============================================================

const REMINDER_OPTIONS = [
    { value: "30", label: "30 мин" },
    { value: "60", label: "60 мин" },
    { value: "120", label: "2 часа" },
    { value: "180", label: "3 часа" },
    { value: "1440", label: "1 день" },
] as const;

type ReminderBefore = "30" | "60" | "120" | "180" | "1440";

type Props = {
    userId: number;
};

export default function NotificationSettings({ userId }: Props) {
    const [lessonReminder, setLessonReminder] = useState(true);
    const [reminderBefore, setReminderBefore] = useState<ReminderBefore>("30");
    const [newInvitation, setNewInvitation] = useState(true);
    const [newBooking, setNewBooking] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/profile/notification-settings");
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Не удалось загрузить");
                    return;
                }

                setLessonReminder(Boolean(data.lesson_reminder));
                setReminderBefore(data.lesson_reminder_before ?? "30");
                setNewInvitation(Boolean(data.new_invitation));
                setNewBooking(Boolean(data.new_booking));
                setMarketingEmails(Boolean(data.marketing_emails));
            } catch {
                setError("Ошибка сети");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function handleSave() {
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const res = await fetch("/api/profile/notification-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lesson_reminder: lessonReminder,
                    lesson_reminder_before: reminderBefore,
                    new_invitation: newInvitation,
                    new_booking: newBooking,
                    marketing_emails: marketingEmails,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка сохранения");
                return;
            }

            setSuccess("Сохранено");
        } catch {
            setError("Ошибка сети");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-[60px]">
                <p className="text-darkGray">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[20px]">
            {/* 1. Важные — всегда включены */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Важные
                        </h2>
                        <p className="text-gray text-[15px]">
                            Операции с деньгами, напоминания о платежах и работе
                            платформы. Эти уведомления нельзя отключить
                        </p>
                    </div>

                    {/* Неактивный toggle — всегда включён */}
                    <div className="relative w-[64px] h-[36px] rounded-full bg-violet shrink-0 cursor-not-allowed opacity-50">
                        <span className="absolute top-[4px] left-[32px] w-[28px] h-[28px] bg-white rounded-full" />
                    </div>
                </div>
            </div>

            {/* 2. Скоро урок */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Скоро урок
                        </h2>

                        {/* Select + текст */}
                        <div className="flex flex-wrap items-center gap-[8px] text-gray text-[15px]">
                            <span>напомнить за</span>

                            <select
                                value={reminderBefore}
                                onChange={(e) => {
                                    setReminderBefore(
                                        e.target.value as ReminderBefore,
                                    );
                                    setSuccess("");
                                    setError("");
                                }}
                                disabled={!lessonReminder || saving}
                                className="cursor-pointer px-[14px] py-[6px] rounded-full bg-green text-black text-[14px] font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {REMINDER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <span>до начала</span>
                        </div>
                    </div>

                    {/* Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            setLessonReminder(!lessonReminder);
                            setSuccess("");
                            setError("");
                        }}
                        className={`cursor-pointer relative w-[64px] h-[36px] rounded-full transition shrink-0 ${
                            lessonReminder ? "bg-blue" : "bg-violet"
                        }`}
                        aria-label="Toggle"
                    >
                        <span
                            className={`absolute top-[4px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                                lessonReminder ? "left-[32px]" : "left-[4px]"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* 3. Новая заявка */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Новая заявка
                        </h2>
                        <p className="text-gray text-[15px]">
                            Сообщим, когда кто-то оставит заявку на вашей
                            публичной странице
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setNewInvitation(!newInvitation);
                            setSuccess("");
                            setError("");
                        }}
                        className={`cursor-pointer relative w-[64px] h-[36px] rounded-full transition shrink-0 ${
                            newInvitation ? "bg-blue" : "bg-violet"
                        }`}
                        aria-label="Toggle"
                    >
                        <span
                            className={`absolute top-[4px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                                newInvitation ? "left-[32px]" : "left-[4px]"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* 4. Новая запись */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Новая запись
                        </h2>
                        <p className="text-gray text-[15px]">
                            Сообщим, когда ученик сам запишется на свободное
                            время
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setNewBooking(!newBooking);
                            setSuccess("");
                            setError("");
                        }}
                        className={`cursor-pointer relative w-[64px] h-[36px] rounded-full transition shrink-0 ${
                            newBooking ? "bg-blue" : "bg-violet"
                        }`}
                        aria-label="Toggle"
                    >
                        <span
                            className={`absolute top-[4px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                                newBooking ? "left-[32px]" : "left-[4px]"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* 5. Письма от Ripit */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Письма от Ripit
                        </h2>
                        <p className="text-gray text-[15px]">
                            Новости, полезные материалы и объявления от команды
                            сервиса на вашу почту
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setMarketingEmails(!marketingEmails);
                            setSuccess("");
                            setError("");
                        }}
                        className={`cursor-pointer relative w-[64px] h-[36px] rounded-full transition shrink-0 ${
                            marketingEmails ? "bg-blue" : "bg-violet"
                        }`}
                        aria-label="Toggle"
                    >
                        <span
                            className={`absolute top-[4px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                                marketingEmails ? "left-[32px]" : "left-[4px]"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Сообщения */}
            {error && (
                <div className="bg-red/10 text-red rounded-[12px] p-[16px] text-[14px]">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green/20 text-black rounded-[12px] p-[16px] text-[14px]">
                    {success}
                </div>
            )}

            {/* Кнопка Сохранить */}
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer w-full bg-green text-black pt-[14px] pb-[16px] rounded-[16px] font-medium hover:bg-[#c2e055] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {saving ? "Сохранение..." : "Сохранить"}
            </button>
        </div>
    );
}
