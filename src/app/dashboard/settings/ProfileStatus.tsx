"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import parrotDraft from "@/assets/images/profile/parrot-draft.webp";
import parrotApproved from "@/assets/images/profile/parrot-approved.webp";
import parrotPending from "@/assets/images/profile/parrot-pending.webp";
import parrotRejected from "@/assets/images/profile/parrot-rejected.webp";

type Status = "draft" | "pending" | "approved" | "rejected" | "hidden" | null;

type Props = {
    initialStatus: Status;
    rejectionReason: string | null;
    tutorId: number;
    slug: string | null;
    profileReady: boolean;
};

export default function ProfileStatus({
    initialStatus,
    rejectionReason,
    tutorId,
    slug,
    profileReady,
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

    const content = getContent(status, reason, tutorId, slug);
    const parrot = getParrot(status);

    const isSubmitButton = content.button && content.button.type === "button";
    const isDisabled = isSubmitButton && (!profileReady || loading);

    return (
        <div
            className={`${content.bg} rounded-[30px] mt-[20px] relative overflow-hidden transition-colors ${content.minHeight} pt-[30px] pl-[30px] pr-[30px]`}
        >
            <div className="flex items-stretch gap-[30px]">
                <div className="flex-1 pb-[30px]">
                    <div className="flex items-center gap-[5px] mb-[18px]">
                        <span>{content.icon}</span>
                        <h2 className="font-days text-[22px] text-black">
                            {content.title}
                        </h2>
                    </div>

                    <p className="text-gray text-[17px] mb-[26px]">
                        {content.text}
                    </p>

                    {status === "rejected" && reason && (
                        <div className="bg-white rounded-[16px] p-[20px] mb-[26px]">
                            <p className="text-black text-[17px] font-medium mb-[8px]">
                                Причина
                            </p>
                            <p className="text-gray text-[17px]">{reason}</p>
                        </div>
                    )}

                    {error && (
                        <p className="text-red text-sm mb-[12px]">{error}</p>
                    )}

                    {isSubmitButton && !profileReady && !loading && (
                        <p className="text-darkGray text-[14px] mb-[12px]">
                            Заполните все обязательные поля, чтобы отправить
                            профиль на проверку
                        </p>
                    )}

                    {content.button && (
                        <>
                            {content.button.type === "link" ? (
                                <Link
                                    href={content.button.href}
                                    target="_blank"
                                    className="inline-block bg-green text-black px-[26px] pt-[16px] pb-[17px] rounded-full font-medium text-[17px]"
                                >
                                    {content.button.label}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isDisabled}
                                    className="cursor-pointer bg-green text-black px-[26px] pt-[16px] pb-[17px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-40 disabled:cursor-not-allowed text-[17px]"
                                >
                                    {loading
                                        ? "Отправка..."
                                        : content.button.label}
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="hidden md:flex items-end shrink-0">
                    <Image
                        src={parrot}
                        alt=""
                        className={`object-contain object-bottom w-auto h-auto ${content.parrotClass}`}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Попугай по статусу
// ============================================================

function getParrot(status: Status): StaticImageData {
    switch (status) {
        case null:
        case "draft":
            return parrotDraft;
        case "pending":
            return parrotPending;
        case "approved":
            return parrotApproved;
        case "rejected":
            return parrotRejected;
        case "hidden":
        default:
            return parrotDraft;
    }
}

// ============================================================
// Тексты, иконки, кнопки, фон, высота
// ============================================================

type Content = {
    icon: string;
    title: string;
    text: string;
    bg: string;
    minHeight: string;
    parrotClass: string;
    button:
        | { type: "link"; href: string; label: string }
        | { type: "button"; label: string }
        | null;
};

function getContent(
    status: Status,
    reason: string | null,
    tutorId: number,
    slug: string | null,
): Content {
    switch (status) {
        case null:
        case "draft":
            return {
                icon: "🖊️",
                title: "Статус профиля",
                text: "Заполните профиль, чтобы ученики могли найти вас. Мы проверим его в течение одного рабочего дня.",
                bg: "bg-white",
                minHeight: "min-h-[232px]",
                parrotClass: "max-h-[202px]",
                button: { type: "button", label: "Отправить на проверку" },
            };
        case "pending":
            return {
                icon: "⏳",
                title: "Профиль на проверке",
                text: "Мы уже проверяем ваш профиль! Это займёт не более одного рабочего дня. Как только проверка завершится, мы уведомим вас по email.",
                bg: "bg-yellow/40",
                minHeight: "min-h-[232px]",
                parrotClass: "max-h-[202px]",
                button: null,
            };
        case "approved":
            return {
                icon: "✔️",
                title: "Профиль одобрен",
                text: "Ваш профиль уже в каталоге! Ученики могут отправлять вам заявки – следите за уведомлениями",
                bg: "bg-[#F9FFE4]",
                minHeight: "min-h-[232px]",
                parrotClass: "max-h-[202px]",
                button: {
                    type: "link",
                    href: slug ? `/tutors/${slug}` : `/tutors/${tutorId}`,
                    label: "Открыть публичную страницу",
                },
            };
        case "rejected":
            return {
                icon: "🚫",
                title: "Профиль не прошел проверку",
                text: "Пожалуйста, исправьте замечания, чтобы мы могли одобрить ваш профиль",
                bg: "bg-redLight",
                minHeight: "min-h-[260px]",
                parrotClass: "max-h-[312px]",
                button: {
                    type: "button",
                    label: "Отправить на проверку повторно",
                },
            };
        case "hidden":
            return {
                icon: "🙈",
                title: "Профиль скрыт",
                text: "Профиль скрыт администратором. Свяжитесь с поддержкой для уточнения причин.",
                bg: "bg-violet",
                minHeight: "min-h-[232px]",
                parrotClass: "max-h-[202px]",
                button: null,
            };
    }
}