"use client";

import { useState } from "react";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotDelete from "@/assets/images/profile/parrot-delete.webp";

export default function DeleteAccountBlock() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* Блок-предупреждение */}
            <div className="bg-redLight rounded-[30px] p-[30px] pb-[34px] flex flex-col md:flex-row md:items-center md:justify-between gap-[20px]">
                <div>
                    <h2 className="font-days text-[22px] text-black mb-[20px] flex items-center gap-[8px]">
                        <span className="text-[22px]">❗</span>
                        Удаление аккаунта
                    </h2>
                    <p className="text-gray text-[17px]">
                        Все данные будут удалены. Это действие нельзя отменить
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="cursor-pointer bg-white border border-red text-red px-[26px] pt-[14px] pb-[16px] rounded-full font-medium hover:bg-red/5 transition text-[15px] whitespace-nowrap"
                >
                    Удалить аккаунт
                </button>
            </div>

            {/* Модалка */}
            {showModal && <DeleteModal onClose={() => setShowModal(false)} />}
        </>
    );
}

// ============================================================
// Модалка подтверждения
// ============================================================

function DeleteModal({ onClose }: { onClose: () => void }) {
    const [confirmed, setConfirmed] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        if (!confirmed) return;
        setError("");
        setDeleting(true);

        try {
            const res = await fetch("/api/profile/delete", {
                method: "POST",
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка удаления");
                return;
            }

            // Редирект на главную после удаления
            window.location.href = "/";
        } catch {
            setError("Ошибка сети");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[20px]">
            <div className="w-full max-w-[500px] bg-white rounded-[30px] overflow-hidden shadow-xl relative">
                {/* Верхняя зона с попугаем */}
                <div className="bg-violet rounded-t-[30px] h-[160px] relative w-full">
                    <div className="p-[40px] relative z-10">
                        <Svg iconId="logo" className="w-[74px] h-[42px]" />
                    </div>

                    <div className="absolute bottom-0 right-0 w-full h-full">
                        <Image
                            src={parrotDelete}
                            alt=""
                            fill
                            className="object-contain object-bottom-right"
                            priority
                        />
                    </div>
                </div>

                {/* Контент */}
                <div className="p-[30px] pt-[24px]">
                    <h2 className="font-days text-[32px] text-black text-center mb-[16px]">
                        Вы уверены, что хотите удалить аккаунт?
                    </h2>

                    {/* Чекбокс */}
                    <label className="flex items-start gap-[10px] mb-[30px] cursor-pointer">
                        <input
                            type="checkbox"
                            id="checkbox-id"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="cursor-pointer"
                        />
                        <span className="text-black text-[17px]">
                            Я понимаю, что все данные будут удалены безвозвратно
                        </span>
                    </label>

                    {error && (
                        <p className="text-red text-[13px] mb-[12px] text-center">
                            {error}
                        </p>
                    )}

                    {/* Кнопка «Удалить» */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!confirmed || deleting}
                        className="cursor-pointer w-full bg-red text-white pt-[14px] pb-[16px] rounded-full font-medium hover:opacity-90 transition disabled:opacity-20 disabled:cursor-not-allowed text-[17px] mb-[24px]"
                    >
                        {deleting ? "Удаление..." : "Удалить"}
                    </button>

                    {/* Кнопка «Отмена» */}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="cursor-pointer w-full bg-white border border-violet text-black pt-[14px] pb-[16px] rounded-full font-medium hover:bg-violet transition disabled:opacity-50 text-[17px]"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}
