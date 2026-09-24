"use client";

import { useState } from "react";
import Image from "next/image";
import type { PendingTutor } from "@/lib/admin";

export default function ModerationList({
    tutors: initialTutors,
}: {
    tutors: PendingTutor[];
}) {
    const [tutors, setTutors] = useState(initialTutors);
    const [processing, setProcessing] = useState<number | null>(null);
    const [error, setError] = useState<string>("");
    const [rejectModal, setRejectModal] = useState<{
        tutorId: number;
        name: string;
    } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    async function handleApprove(tutorId: number) {
        setError("");
        setProcessing(tutorId);

        try {
            const res = await fetch("/api/admin/moderation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve", tutorId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            // Убираем из списка
            setTutors((prev) => prev.filter((t) => t.id !== tutorId));
        } catch {
            setError("Ошибка сети");
        } finally {
            setProcessing(null);
        }
    }

    async function handleReject() {
        if (!rejectModal) return;

        const reason = rejectReason.trim();
        if (!reason) {
            setError("Укажите причину отклонения");
            return;
        }

        setError("");
        setRejecting(true);

        try {
            const res = await fetch("/api/admin/moderation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reject",
                    tutorId: rejectModal.tutorId,
                    reason,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            // Убираем из списка
            setTutors((prev) =>
                prev.filter((t) => t.id !== rejectModal.tutorId),
            );
            setRejectModal(null);
            setRejectReason("");
        } catch {
            setError("Ошибка сети");
        } finally {
            setRejecting(false);
        }
    }

    if (tutors.length === 0) {
        return (
            <div className="bg-white rounded-[24px] p-[60px] text-center">
                <p className="text-darkGray text-[18px]">
                    Все заявки обработаны. Новые появятся здесь автоматически.
                </p>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="bg-red/10 text-red rounded-[16px] p-[16px] mb-[20px]">
                    {error}
                </div>
            )}

            <div className="space-y-[20px]">
                {tutors.map((tutor) => (
                    <TutorModerationCard
                        key={tutor.id}
                        tutor={tutor}
                        onApprove={handleApprove}
                        onReject={(id, name) => {
                            setError("");
                            setRejectModal({ tutorId: id, name });
                        }}
                        processing={processing === tutor.id}
                    />
                ))}
            </div>

            {/* Модалка отклонения */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[30px]">
                    <div className="w-full max-w-[560px] bg-white rounded-[24px] p-[32px]">
                        <h2 className="font-days text-[24px] text-black mb-[8px]">
                            Отклонить заявку?
                        </h2>
                        <p className="text-darkGray text-[14px] mb-[20px]">
                            Репетитор: {rejectModal.name}
                        </p>

                        <label className="block font-medium text-black mb-[8px]">
                            Причина отклонения
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            placeholder="Например: не заполнено образование, нечитаемое фото и т.д."
                            className="w-full px-[16px] py-[12px] rounded-[12px] border border-whiteTxt bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all resize-none mb-[8px]"
                        />
                        <p className="text-[12px] text-darkGray mb-[20px]">
                            {rejectReason.length} / 1000
                        </p>

                        <div className="flex gap-[12px]">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectModal(null);
                                    setRejectReason("");
                                    setError("");
                                }}
                                disabled={rejecting}
                                className="cursor-pointer flex-1 bg-violet text-black py-[12px] rounded-full hover:opacity-80 transition disabled:opacity-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={rejecting || !rejectReason.trim()}
                                className="cursor-pointer flex-1 bg-red text-white py-[12px] rounded-full hover:opacity-90 transition disabled:opacity-50"
                            >
                                {rejecting ? "Отклонение..." : "Отклонить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ============================================================
// Карточка репетитора
// ============================================================

function TutorModerationCard({
    tutor,
    onApprove,
    onReject,
    processing,
}: {
    tutor: PendingTutor;
    onApprove: (id: number) => void;
    onReject: (id: number, name: string) => void;
    processing: boolean;
}) {
    const fullName =
        [tutor.last_name, tutor.first_name, tutor.middle_name]
            .filter(Boolean)
            .join(" ") || "Без имени";

    const registrationDate = new Date(tutor.user_created_at).toLocaleString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <div className="bg-white rounded-[24px] p-[32px]">
            <div className="flex flex-col md:flex-row gap-[24px]">
                {/* Фото */}
                <div className="relative w-[140px] h-[140px] rounded-[20px] overflow-hidden bg-violet shrink-0 mx-auto md:mx-0">
                    {tutor.avatar_url ? (
                        <Image
                            src={tutor.avatar_url}
                            alt={fullName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-darkGray text-[12px]">
                            Нет фото
                        </div>
                    )}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                    <h2 className="font-days text-[24px] text-black mb-[8px]">
                        {fullName}
                    </h2>

                    {/* Контакты */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[6px] text-[14px] mb-[16px]">
                        <p className="text-darkGray">
                            <b className="text-black">Email:</b> {tutor.email}
                        </p>
                        <p className="text-darkGray">
                            <b className="text-black">Телефон:</b>{" "}
                            {tutor.phone || "—"}
                        </p>
                        <p className="text-darkGray">
                            <b className="text-black">Регистрация:</b>{" "}
                            {registrationDate}
                        </p>
                        <p className="text-darkGray">
                            <b className="text-black">Согласие:</b>{" "}
                            {tutor.consent_at
                                ? `да, v${tutor.consent_version}`
                                : "нет"}
                        </p>
                    </div>

                    {/* Headline */}
                    {tutor.headline && (
                        <p className="text-black text-[15px] mb-[12px]">
                            {tutor.headline}
                        </p>
                    )}

                    {/* Предметы */}
                    {tutor.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-[6px] mb-[12px]">
                            {tutor.subjects.map((s) => (
                                <span
                                    key={s}
                                    className="px-[10px] py-[4px] rounded-full bg-violet text-black text-[12px]"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Цена и опыт */}
                    <div className="flex gap-[24px] text-[14px] mb-[16px]">
                        {tutor.hourly_rate != null && (
                            <p className="text-darkGray">
                                <b className="text-black">Цена:</b>{" "}
                                {tutor.hourly_rate} BYN/час
                            </p>
                        )}
                        {tutor.experience_years != null && (
                            <p className="text-darkGray">
                                <b className="text-black">Опыт:</b>{" "}
                                {tutor.experience_years} лет
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    {tutor.bio && (
                        <div className="mb-[12px]">
                            <p className="text-black text-[14px] font-medium mb-[4px]">
                                О себе:
                            </p>
                            <p className="text-darkGray text-[14px] whitespace-pre-line">
                                {tutor.bio}
                            </p>
                        </div>
                    )}

                    {/* Образование */}
                    {tutor.education && (
                        <div className="mb-[16px]">
                            <p className="text-black text-[14px] font-medium mb-[4px]">
                                Образование:
                            </p>
                            <p className="text-darkGray text-[14px] whitespace-pre-line">
                                {tutor.education}
                            </p>
                        </div>
                    )}

                    {/* Кнопки */}
                    <div className="flex gap-[12px] mt-[20px]">
                        <button
                            type="button"
                            onClick={() => onApprove(tutor.id)}
                            disabled={processing}
                            className="cursor-pointer bg-green text-black px-[32px] py-[12px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
                        >
                            {processing ? "..." : "✓ Одобрить"}
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject(tutor.id, fullName)}
                            disabled={processing}
                            className="cursor-pointer bg-red text-white px-[32px] py-[12px] rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            ✕ Отклонить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
