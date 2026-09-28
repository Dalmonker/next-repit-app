"use client";

import { useEffect, useState } from "react";

// ============================================================
// Константы — варианты
// ============================================================

const START_INTERVAL_OPTIONS = [
    { value: "15", label: "15 мин" },
    { value: "30", label: "30 мин" },
    { value: "60", label: "60 мин" },
] as const;

const DURATION_OPTIONS = [
    { value: "30", label: "30 мин" },
    { value: "45", label: "45 мин" },
    { value: "60", label: "60 мин" },
    { value: "90", label: "90 мин" },
    { value: "120", label: "120 мин" },
] as const;

const MIN_TIME_OPTIONS = [
    { value: "60", label: "1 час" },
    { value: "120", label: "2 часа" },
    { value: "180", label: "3 часа" },
    { value: "240", label: "4 часа" },
    { value: "1440", label: "1 день" },
] as const;

type StartInterval = "15" | "30" | "60";
type DefaultDuration = "30" | "45" | "60" | "90" | "120";
type MinTimeBefore = "60" | "120" | "180" | "240" | "1440";

type Props = {
    userId: number;
};

export default function LessonSettings({ userId }: Props) {
    // ===== State =====
    const [freeTrial, setFreeTrial] = useState(false);
    const [priceIndividual, setPriceIndividual] = useState("");
    const [priceGroup, setPriceGroup] = useState("");
    const [startInterval, setStartInterval] = useState<StartInterval>("30");
    const [defaultDuration, setDefaultDuration] =
        useState<DefaultDuration>("45");
    const [minTimeBefore, setMinTimeBefore] = useState<MinTimeBefore>("120");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ===== Загрузка =====
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/profile/lesson-settings");
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Не удалось загрузить");
                    return;
                }

                setFreeTrial(Boolean(data.free_trial));
                setPriceIndividual(
                    data.price_individual != null
                        ? String(data.price_individual)
                        : "",
                );
                setPriceGroup(
                    data.price_group != null ? String(data.price_group) : "",
                );
                setStartInterval(data.start_interval ?? "30");
                setDefaultDuration(data.default_duration ?? "45");
                setMinTimeBefore(data.min_time_before ?? "120");
            } catch {
                setError("Ошибка сети");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // ===== Сохранение =====
    async function handleSave() {
        setError("");
        setSuccess("");

        // Локальная валидация цены
        const pInd = priceIndividual.trim();
        const pGrp = priceGroup.trim();

        if (pInd && (!Number.isFinite(Number(pInd)) || Number(pInd) <= 0)) {
            setError("Цена индивидуального урока должна быть больше 0");
            return;
        }
        if (pGrp && (!Number.isFinite(Number(pGrp)) || Number(pGrp) <= 0)) {
            setError("Цена группового урока должна быть больше 0");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/profile/lesson-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    free_trial: freeTrial,
                    price_individual: pInd ? Number(pInd) : null,
                    price_group: pGrp ? Number(pGrp) : null,
                    start_interval: startInterval,
                    default_duration: defaultDuration,
                    min_time_before: minTimeBefore,
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
            {/* 1. Бесплатный пробный урок */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <div className="flex items-start justify-between gap-[20px]">
                    <div className="flex-1">
                        <h2 className="font-days text-[22px] text-black mb-[8px]">
                            Бесплатный пробный урок
                        </h2>
                        <p className="text-gray text-[15px]">
                            Запись осуществляется на странице как на обычный
                            урок
                        </p>
                    </div>

                    {/* Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            setFreeTrial(!freeTrial);
                            setSuccess("");
                            setError("");
                        }}
                        className={`cursor-pointer relative w-[64px] h-[36px] rounded-full transition shrink-0 ${
                            freeTrial ? "bg-blue" : "bg-violet"
                        }`}
                        aria-label="Toggle"
                    >
                        <span
                            className={`absolute top-[4px] w-[28px] h-[28px] bg-white rounded-full transition-all ${
                                freeTrial ? "left-[32px]" : "left-[4px]"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* 2. Цена на странице */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <h2 className="font-days text-[22px] text-black mb-[20px]">
                    Цена на странице
                </h2>

                {/* Индивидуальный */}
                <div className="mb-[24px]">
                    <label className="block font-medium text-[17px] text-gray mb-[12px]">
                        Индивидуальный урок, от BYN
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={priceIndividual}
                        onChange={(e) => {
                            setPriceIndividual(e.target.value);
                            setSuccess("");
                            setError("");
                        }}
                        placeholder="0"
                        maxLength={10}
                        className="w-full px-[20px] pt-[15px] pb-[17px] rounded-full border border-violet bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                    <p className="text-[15px]/20% text-darkGray mt-[8px]">
                        Если оставить пустым — будет отображаться как «цена по
                        запросу»
                    </p>
                </div>

                {/* Групповой */}
                <div>
                    <label className="block font-medium text-[17px] text-gray mb-[12px]">
                        Групповое занятие
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={priceGroup}
                        onChange={(e) => {
                            setPriceGroup(e.target.value);
                            setSuccess("");
                            setError("");
                        }}
                        placeholder="0"
                        maxLength={10}
                        className="w-full px-[20px] pt-[15px] pb-[17px] rounded-full border border-violet bg-white text-black placeholder:text-clue focus:border-green outline-none transition-all"
                    />
                    <p className="text-[15px]/20% text-darkGray mt-[8px]">
                        Если не проводите — оставьте поле пустым
                    </p>
                </div>
            </div>

            {/* 3. Интервал начала уроков */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <h2 className="font-days text-[22px] text-black mb-[20px]">
                    Интервал начала уроков
                </h2>

                <div className="flex flex-wrap gap-[10px] mb-[16px]">
                    {START_INTERVAL_OPTIONS.map((opt) => {
                        const isActive = startInterval === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setStartInterval(opt.value);
                                    setSuccess("");
                                    setError("");
                                }}
                                className={`cursor-pointer font-medium px-[20px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% transition ${
                                    isActive
                                        ? "bg-green text-black"
                                        : "bg-white border border-violet text-black hover:opacity-80"
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                <p className="text-[15px]/20% text-darkGray">
                    С каким интервалом могут начинаться уроки. Например, при
                    выборе 30 минут доступно время 10:00, 10:30, 11:00...
                    Длительность самого урока не меняется
                </p>
            </div>

            {/* 4. Стандартная длительность урока */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <h2 className="font-days text-[22px] text-black mb-[20px]">
                    Стандартная длительность урока
                </h2>

                <div className="flex flex-wrap gap-[10px]">
                    {DURATION_OPTIONS.map((opt) => {
                        const isActive = defaultDuration === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setDefaultDuration(opt.value);
                                    setSuccess("");
                                    setError("");
                                }}
                                className={`cursor-pointer font-medium px-[20px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% transition ${
                                    isActive
                                        ? "bg-green text-black"
                                        : "bg-white border border-violet text-black hover:opacity-80"
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 5. Минимальное время до начала урока */}
            <div className="bg-white rounded-[30px] p-[30px]">
                <h2 className="font-days text-[22px] text-black mb-[20px]">
                    Минимальное время до начала урока
                </h2>

                <div className="flex flex-wrap gap-[10px] mb-[16px]">
                    {MIN_TIME_OPTIONS.map((opt) => {
                        const isActive = minTimeBefore === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setMinTimeBefore(opt.value);
                                    setSuccess("");
                                    setError("");
                                }}
                                className={`cursor-pointer font-medium px-[20px] pt-[9px] pb-[11px] rounded-full text-[15px]/20% transition ${
                                    isActive
                                        ? "bg-green text-black"
                                        : "bg-white border border-violet text-black hover:opacity-80"
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>

                <p className="text-[15px]/20% text-darkGray">
                    Укажите, за сколько времени до урока ученик может
                    записаться. Более позднее время будет недоступно. При выборе
                    «Следующий день» запись на сегодня закрывается
                </p>
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
