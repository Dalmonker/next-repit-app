"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Svg } from "@/components/Svg";

import parrotImage from "@/assets/images/login/parrot-tablet.webp";

type Props = {
    onSubmit: (email: string, consent: boolean) => Promise<boolean>;
    loading: boolean;
    error: string;
};

export default function LoginForm({ onSubmit, loading, error }: Props) {
    const [email, setEmail] = useState("");
    const [consent, setConsent] = useState(false);
    const [localError, setLocalError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLocalError("");

        if (!consent) {
            setLocalError("Необходимо согласие на обработку данных");
            return;
        }

        await onSubmit(email, consent);
    }

    return (
        <div className="w-full rounded-[24px] bg-violet relative">
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

            {/* Нижняя зона */}
            <div className="bg-white rounded-[24px] p-[40px]">
                <h1 className="font-days text-[32px] text-black text-center mb-[40px]">
                    Войти в кабинет
                </h1>

                <form onSubmit={handleSubmit} className="font-sans">
                    <div className="mb-[24px]">
                        <label
                            className="block font-medium text-black mb-[12px]"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@gmail.com"
                            required
                            className="w-full px-[21px] pt-[10px] pb-[13px] rounded-full border border-whiteTxt bg-white placeholder:text-clue text-black focus:border-green outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-start mb-[24px]">
                        <div className="flex mt-[4px] mr-[10px]">
                            <input
                                id="checkbox-id"
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="cursor-pointer"
                            />
                        </div>
                        <label
                            htmlFor="checkbox-id"
                            className="text-darkGray leading-5 text-[15px] cursor-pointer max-w-[400px]"
                        >
                            Соглашаюсь с{" "}
                            <Link
                                href="#"
                                className="text-blue hover:underline"
                            >
                                политикой обработки персональных данных
                            </Link>{" "}
                            и принимаю условия{" "}
                            <Link
                                href="#"
                                className="text-blue hover:underline"
                            >
                                пользовательского соглашения
                            </Link>
                        </label>
                    </div>

                    {(localError || error) && (
                        <p className="text-red text-sm mb-3">
                            {localError || error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition disabled:opacity-50"
                    >
                        {loading ? "Отправка..." : "Войти"}
                    </button>
                </form>

                <Link
                    href="#"
                    className="cursor-pointer block bg-transparent text-center pt-[10px] pb-[12px] rounded-full active:bg-green transition"
                >
                    По приглашению от учителя
                </Link>
            </div>
        </div>
    );
}
