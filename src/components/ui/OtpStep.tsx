"use client";

import { useState } from "react";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-tablet.webp";

type Props = {
    email: string;
    onVerify: (code: string) => Promise<boolean>;
    onBack: () => void;
    loading: boolean;
    error: string;
    secondsLeft: number;
    resending: boolean;
    onResend: () => Promise<boolean>;
};

export default function OtpStep({
    email,
    onVerify,
    onBack,
    loading,
    error,
    secondsLeft,
    resending,
    onResend,
}: Props) {
    const [code, setCode] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await onVerify(code);
    }

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    // Что писать на кнопке
    const buttonText =
        secondsLeft > 0
            ? `Получить новый код через ${formatTime(secondsLeft)}`
            : "Получить новый код";

    // Кнопка активна только когда таймер дошёл до 0 и не идёт отправка
    const canResend = secondsLeft === 0 && !resending;

    return (
        <div className="w-full rounded-[24px] bg-violet relative">
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

            {/* Нижняя зона — форма кода */}
            <div className="bg-white rounded-[24px] p-[40px]">
                <h1 className="font-days text-[32px] text-black text-center mb-[16px]">
                    Введите код подтверждения
                </h1>
                <p className="text-center text-darkGray mb-[24px] text-[15px]">
                    Мы отправили его на почту{" "}
                    <b className="text-black">{email}</b>
                </p>

                <form onSubmit={handleSubmit} className="font-sans">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="123456"
                        required
                        autoFocus
                        className="w-full px-[21px] pt-[5px] pb-[5px] rounded-full border border-whiteTxt bg-white placeholder:text-clue text-black focus:border-green outline-none transition-all text-center text-2xl tracking-widest"
                    />

                    {error && <p className="text-red text-sm mt-3">{error}</p>}

                    {/* Одна кнопка: и "Подтвердить", и "Получить новый код" */}
                    {code.length === 6 ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition mt-4 disabled:opacity-50"
                        >
                            {loading ? "Проверка..." : "Подтвердить"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onResend}
                            disabled={!canResend}
                            className="w-full bg-green text-black pt-[10px] pb-[12px] rounded-full transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#c2e055]"
                        >
                            {resending ? "Отправка..." : buttonText}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full text-center text-sm text-darkGray mt-4 hover:text-black transition-colors cursor-pointer"
                    >
                        Изменить email
                    </button>
                </form>
            </div>
        </div>
    );
}
