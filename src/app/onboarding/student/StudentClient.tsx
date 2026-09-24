"use client";

import { useState } from "react";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-hooray.webp";

const GRADES = [
    "11 класс",
    "10 класс",
    "9 класс",
    "8 класс",
    "7 класс",
    "6 класс",
    "5 класс",
    "4 класс",
    "3 класс",
    "2 класс",
    "1 класс",
    "Дошкольник",
];

export default function StudentOnboardingPage() {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleContinue() {
        if (!selected) return;
        setError("");
        setLoading(true);

        // Преобразуем "11 класс" → "11", "Дошкольник" → "Дошкольник"
        const gradeValue =
            selected === "Дошкольник"
                ? "Дошкольник"
                : selected.replace(" класс", "");

        try {
            const res = await fetch("/api/onboarding/set-class", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grade: gradeValue }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка");
                return;
            }

            window.location.href = "/dashboard";
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-violet px-[30px]">
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

                {/* Нижняя зона — выбор класса */}
                <div className="bg-white rounded-[24px] p-[40px]">
                    <h1 className="font-days text-[32px] text-black text-center mb-[12px]">
                        Расскажи о себе
                    </h1>
                    <p className="font-medium text-center text-black mb-[32px]">
                        В каком классе ты учишься?
                    </p>

                    {error && (
                        <p className="text-red text-sm mb-4 text-center">
                            {error}
                        </p>
                    )}

                    {/* Сетка кнопок 3 в ряд */}
                    <div className="grid grid-cols-3 gap-[10px] mb-[24px]">
                        {GRADES.map((grade) => {
                            const isSelected = selected === grade;
                            return (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => setSelected(grade)}
                                    disabled={loading}
                                    className={`cursor-pointer py-[12px] rounded-[12px] text-[15px] font-medium transition disabled:opacity-50 ${
                                        isSelected
                                            ? "bg-green text-black"
                                            : "bg-violet text-black hover:opacity-80"
                                    }`}
                                >
                                    {grade}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!selected || loading}
                        className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Сохранение..." : "Продолжить"}
                    </button>
                </div>
            </div>
        </main>
    );
}
