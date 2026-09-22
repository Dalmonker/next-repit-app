"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-tablet.webp";

type Props = {
    email: string;
    onVerify: (code: string) => Promise<boolean>;
    onResend: () => Promise<boolean>;
    onBack: () => void;
    loading: boolean;
    error: string;
};

const RESEND_SECONDS = 49;

export default function OtpStep({
    email,
    onVerify,
    onResend,
    onBack,
    loading,
    error,
}: Props) {
    const [code, setCode] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
    const [resending, setResending] = useState(false);

    // Таймер
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await onVerify(code);
    }

    async function handleResend() {
        setResending(true);
        const ok = await onResend();
        setResending(false);
        if (ok) {
            setSecondsLeft(RESEND_SECONDS);
            setCode("");
        }
    }

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full rounded-[24px] bg-violet relative">
            {/* Верхняя зона — та же самая, что в LoginForm */}
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
                    Введите код
                </h1>
                <p className="text-center text-darkGray mb-[24px] text-[15px]">
                    Мы отправили его на почту
                    <br />
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
                        className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white placeholder:text-clue text-black focus:border-green outline-none transition-all text-center text-2xl tracking-widest"
                    />

                    {error && <p className="text-red text-sm mt-3">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition mt-4 disabled:opacity-50"
                    >
                        {loading ? "Проверка..." : "Подтвердить"}
                    </button>

                    <div className="text-center mt-4">
                        {secondsLeft > 0 ? (
                            <p className="text-darkGray text-sm">
                                Получить новый код через{" "}
                                <b className="text-black">
                                    {formatTime(secondsLeft)}
                                </b>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-blue hover:underline text-sm cursor-pointer disabled:opacity-50"
                            >
                                {resending
                                    ? "Отправка..."
                                    : "Получить новый код"}
                            </button>
                        )}
                    </div>

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
