"use client";

import { useState } from "react";
import Image from "next/image";
import type { TutorInvitationItem } from "@/lib/invitations";

export default function InvitationsList({
    invitations: initialInvitations,
}: {
    invitations: TutorInvitationItem[];
}) {
    const [invitations, setInvitations] = useState(initialInvitations);
    const [processing, setProcessing] = useState<number | null>(null);
    const [error, setError] = useState("");

    async function handleAction(
        invitationId: number,
        action: "accept" | "reject",
    ) {
        setError("");
        setProcessing(invitationId);

        try {
            const res = await fetch(
                `/api/invitations/${invitationId}/${action}`,
                { method: "POST" },
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            // Убираем из списка
            setInvitations((prev) =>
                prev.filter((i) => i.id !== invitationId),
            );
        } catch {
            setError("Ошибка сети");
        } finally {
            setProcessing(null);
        }
    }

    return (
        <>
            {error && (
                <div className="bg-red/10 text-red rounded-[16px] p-[16px] mb-[16px]">
                    {error}
                </div>
            )}

            <div className="space-y-[12px]">
                {invitations.map((inv) => {
                    const fullName =
                        [inv.student_first_name, inv.student_last_name]
                            .filter(Boolean)
                            .join(" ") || "Ученик";

                    const isProcessing = processing === inv.id;

                    return (
                        <div
                            key={inv.id}
                            className="bg-white rounded-[24px] p-[24px] flex flex-col md:flex-row md:items-center gap-[20px]"
                        >
                            {/* Аватар */}
                            <div className="relative w-[64px] h-[64px] rounded-full overflow-hidden bg-violet shrink-0">
                                {inv.student_avatar_url ? (
                                    <Image
                                        src={inv.student_avatar_url}
                                        alt={fullName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-darkGray text-[10px]">
                                        Нет фото
                                    </div>
                                )}
                            </div>

                            {/* Инфо */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-black text-[16px] mb-[4px]">
                                    {fullName}
                                </p>
                                {inv.message && (
                                    <p className="text-darkGray text-[14px] whitespace-pre-line">
                                        {inv.message}
                                    </p>
                                )}
                            </div>

                            {/* Кнопки */}
                            <div className="flex gap-[8px] shrink-0">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAction(inv.id, "accept")
                                    }
                                    disabled={isProcessing}
                                    className="cursor-pointer bg-green text-black px-[20px] py-[10px] rounded-full font-medium hover:bg-[#c2e055] transition disabled:opacity-50"
                                >
                                    {isProcessing ? "..." : "Принять"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleAction(inv.id, "reject")
                                    }
                                    disabled={isProcessing}
                                    className="cursor-pointer bg-red text-white px-[20px] py-[10px] rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
                                >
                                    Отклонить
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}