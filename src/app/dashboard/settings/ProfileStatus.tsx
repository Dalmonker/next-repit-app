"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import parrotImage from "@/assets/images/login/parrot-tablet.webp";

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

            setStatus("pending");
            setReason(null);
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    }

    // Тексты и кнопки по статусу
    const content = getContent(status, reason, tutorId);

    return (
        <div className="bg-white rounded-[24px] p-[32px] relative overflow-hidden">
            <div className="flex items-start justify-between gap-[20px]">
                <div className="flex-1 min-w-0">
                    {/* Заголовок с иконкой */}
                    <div className="flex items-center gap-[10px] mb-[12px]">
                        <span className="flex items-center justify-center w-[24px] h-[24px] text-darkGray">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </span>
                        <h2 className="font-days text-[22px] text-black">
                            Статус профиля
                        </h2>
                    </div>

                    {/* Текст */}
                    <p className="text-darkGray text-[15px] leading-[1.5] mb-[20px] max-w-[440px]">
                        {content.text}
                    </p>

                    {/* Причина отклонения */}
                    {status === "rejected" && reason && (
                        <div className="bg-red/10 rounded-[12px] p-[12px] mb-[16px]">
                            <p className="text-red text-[13px] font-medium mb-[4px]">
                                Причина:
                            </p>
                            <p className="text-black text-[13px] whitespace-pre-line">
                                {reason}
                            </p>
                        </div>
                    )}

                    {error && (
                        <p className="text-red text-sm mb-[12px]">{error}</p>
                    )}

                    {/* Кнопка */}
                    {content.button && (
                        <>
                            {content.button.type === "link" ? (
                                <Link
                                    href={content.button.href}
                                    target="_blank"
                                    className="inline-block bg-green text-black px-[24px] py-[10px] rounded-full font-medium hover:bg-[#c2e055] transition text-[14px]"
                                >
                                    {content.button.label}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="cursor-pointer bg-green text-black px-[24px] py-[10px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50 text-[14px]"
                                >
                                    {loading
                                        ? "Отправка..."
                                        : content.button.label}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Попугай — только для approved */}
                {status === "approved" && (
                    <div className="relative w-[140px] h-[140px] shrink-0 hidden md:block">
                        <Image
                            src={parrotImage}
                            alt=""
                            fill
                            className="object-contain object-right"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Тексты и кнопки по статусу
// ============================================================

type Content = {
    text: string;
    button:
        | { type: "link"; href: string; label: string }
        | { type: "button"; label: string }
        | null;
};

function getContent(
    status: Status,
    reason: string | null,
    tutorId: number,
): Content {
    switch (status) {
        case null:
        case "draft":
            return {
                text: "Заполните профиль, чтобы ученики могли найти вас. Мы проверим его в течение одного рабочего дня.",
                button: { type: "button", label: "Отправить на проверку" },
            };
        case "pending":
            return {
                text: "Профиль на модерации. Обычно проверка занимает 1-2 рабочих дня. Мы уведомим вас по email.",
                button: null,
            };
        case "approved":
            return {
                text: "Ваш профиль одобрен и виден в каталоге. Ученики могут отправлять вам заявки.",
                button: {
                    type: "link",
                    href: `/tutors/${tutorId}`,
                    label: "Открыть публичную страницу",
                },
            };
        case "rejected":
            return {
                text: "Заявка отклонена. Исправьте замечания и отправьте профиль повторно.",
                button: { type: "button", label: "Подать снова" },
            };
        case "hidden":
            return {
                text: "Профиль скрыт администратором. Свяжитесь с поддержкой для уточнения причин.",
                button: null,
            };
    }
}
