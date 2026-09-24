"use client";

import { useState } from "react";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-hooray.webp";

const ROLES = [
    {
        id: "student",
        label: "Ученик",
        emoji: "1",
        description: "Всё для учебы: уроки, задания и прогресс",
        bg: "bg-[#D5F861]",
        circleBg: "bg-violet",
    },
    {
        id: "parent",
        label: "Родитель",
        emoji: "2",
        description: "Всё, чтобы следить за учебой детей",
        bg: "bg-[#EEF861]",
        circleBg: "bg-violet",
    },
    {
        id: "tutor",
        label: "Учитель",
        emoji: "3",
        description: "Всё для преподавания",
        bg: "bg-[#C9C5F5]",
        circleBg: "bg-violet",
    },
] as const;

export default function RolePage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function chooseRole(role: string) {
        setError("");
        setLoading(role);

        try {
            const res = await fetch("/api/auth/set-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            window.location.href = data.redirectTo;
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(null);
        }
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black px-[30px]">
            <div className="w-full max-w-[560px] rounded-[24px] bg-violet relative">
                {/* Верхняя зона — логотип и попугай */}
                <div className="bg-violet rounded-t-[24px] h-[200px] w-full relative">
                    <div className="p-[40px] relative z-10">
                        <Svg iconId="logo" className="w-[74px] h-[42px]" />
                    </div>

                    <div className="absolute bottom-0 right-0 w-full h-full">
                        <Image
                            src={parrotImage}
                            alt="Parrot"
                            fill
                            className="object-contain object-bottom-right"
                            priority
                        />
                    </div>
                </div>

                {/* Нижняя зона — выбор роли */}
                <div className="bg-white rounded-[24px] p-[40px]">
                    <h1 className="font-days text-[32px] text-black text-center mb-[16px]">
                        Добро пожаловать в Ripit!
                    </h1>
                    <p className="font-medium text-center text-black mb-[32px]">
                        Выберите свою роль, чтобы начать
                    </p>

                    {error && (
                        <p className="text-red text-sm mb-4 text-center">
                            {error}
                        </p>
                    )}

                    <div className="space-y-[12px]">
                        {ROLES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => chooseRole(r.id)}
                                disabled={loading !== null}
                                className={`cursor-pointer w-full flex items-center gap-[16px] p-[20px] rounded-[16px] ${r.bg} hover:opacity-90 transition disabled:opacity-50`}
                            >
                                <span
                                    className={`flex items-center justify-center border-2 border-white w-[36px] h-[36px] rounded-full ${r.circleBg} text-[28px] shrink-0`}
                                >
                                    {r.emoji}
                                </span>
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-days text-[22px] text-black mb-[4px]">
                                        {r.label}
                                    </span>
                                    <span className="font-medium text-[17px] text-black">
                                        {r.description}
                                    </span>
                                </div>
                                {loading === r.id && (
                                    <span className="ml-auto text-black/60 text-sm">
                                        Загрузка...
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
