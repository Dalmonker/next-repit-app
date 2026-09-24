"use client";

import { useState } from "react";

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

export default function GradeModal() {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleContinue() {
        if (!selected) return;
        setError("");
        setLoading(true);

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

            // Перезагружаем страницу, чтобы модалка исчезла
            window.location.reload();
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[30px]">
            <div className="w-full max-w-[560px] bg-white rounded-[24px] p-[40px]">
                <h1 className="font-days text-[32px] text-black text-center mb-[12px]">
                    Расскажи о себе
                </h1>
                <p className="font-medium text-center text-black mb-[32px]">
                    В каком классе ты учишься?
                </p>

                {error && (
                    <p className="text-red text-sm mb-4 text-center">{error}</p>
                )}

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
    );
}
