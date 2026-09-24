"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "draft" | "pending" | "approved" | "rejected" | "hidden" | null;

type Props = {
    initialStatus: Status;
    rejectionReason: string | null;
    tutorId: number;
};

export default function ProfileStatus({
    initialStatus,
    rejectionReason,
    tutorId,
}: Props) {
    const [status, setStatus] = useState<Status>(initialStatus);
    const [reason, setReason] = useState<string | null>(rejectionReason);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit() {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/profile/submit-for-review", {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка отправки");
                return;
            }

            // Локально обновляем
            setStatus("pending");
            setReason(null);
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    }

    // ---------- Черновик ----------
    if (status === null || status === "draft") {
        return (
            <div className="bg-white rounded-[24px] p-[32px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[12px]">
                    Статус профиля
                </h2>
                <p className="text-darkGray mb-[20px]">
                    Заполните профиль и отправьте его на проверку. Обычно
                    проверка занимает 1-2 рабочих дня.
                </p>

                {error && <p className="text-red text-sm mb-[12px]">{error}</p>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="cursor-pointer bg-green text-black px-[32px] py-[12px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
                >
                    {loading ? "Отправка..." : "Отправить на проверку"}
                </button>
            </div>
        );
    }

    // ---------- На модерации ----------
    if (status === "pending") {
        return (
            <div className="bg-violet rounded-[24px] p-[32px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[12px]">
                    ⏳ Заявка на модерации
                </h2>
                <p className="text-darkGray">
                    Проверяем ваш профиль. Обычно это занимает 1-2 рабочих дня.
                    Мы уведомим вас по email.
                </p>
            </div>
        );
    }

    // ---------- Одобрен ----------
    if (status === "approved") {
        return (
            <div className="bg-green/20 rounded-[24px] p-[32px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[12px]">
                    ✓ Профиль одобрен
                </h2>
                <p className="text-black mb-[20px]">
                    Ваш профиль виден в каталоге. Ученики могут отправлять вам
                    заявки.
                </p>
                <Link
                    href={`/tutors/${tutorId}`}
                    target="_blank"
                    className="inline-block bg-green text-black px-[32px] py-[12px] rounded-full font-medium hover:bg-[#c2e055] transition"
                >
                    Открыть публичную страницу →
                </Link>
            </div>
        );
    }

    // ---------- Отклонён ----------
    if (status === "rejected") {
        return (
            <div className="bg-red/10 rounded-[24px] p-[32px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[12px]">
                    ✕ Заявка отклонена
                </h2>

                {reason && (
                    <div className="mb-[20px]">
                        <p className="text-black font-medium mb-[6px]">
                            Причина:
                        </p>
                        <p className="text-darkGray whitespace-pre-line">
                            {reason}
                        </p>
                    </div>
                )}

                <p className="text-darkGray mb-[20px]">
                    Исправьте замечания и отправьте профиль повторно.
                </p>

                {error && <p className="text-red text-sm mb-[12px]">{error}</p>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="cursor-pointer bg-green text-black px-[32px] py-[12px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
                >
                    {loading ? "Отправка..." : "Подать снова"}
                </button>
            </div>
        );
    }

    // ---------- Скрыт ----------
    if (status === "hidden") {
        return (
            <div className="bg-violet rounded-[24px] p-[32px] max-w-[640px] mt-[24px]">
                <h2 className="font-days text-[22px] text-black mb-[12px]">
                    Профиль скрыт
                </h2>
                <p className="text-darkGray">
                    Ваш профиль скрыт администратором. Свяжитесь с поддержкой
                    для уточнения причин.
                </p>
            </div>
        );
    }

    return null;
}
