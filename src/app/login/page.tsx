"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/components/ui/LoginForm";
import OtpStep from "@/components/ui/OtpStep";
import bgImage from "@/assets/images/login/backgroundLogin.webp";

const RESEND_SECONDS = 49;

export default function LoginPage() {
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [resending, setResending] = useState(false);

    // Таймер работает, пока secondsLeft > 0
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    // Отправка / повторная отправка кода
    async function handleSendOtp(inputEmail: string, consent: boolean) {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inputEmail, consent }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка отправки");
                return false;
            }

            setEmail(inputEmail);
            setStep("code");
            setSecondsLeft(RESEND_SECONDS);
            return true;
        } catch {
            setError("Ошибка сети. Проверьте подключение.");
            return false;
        } finally {
            setLoading(false);
        }
    }

    // Повторная отправка (кнопка "Получить новый код")
    async function handleResend() {
        setError("");
        setResending(true);
        const ok = await handleSendOtp(email, true);
        setResending(false);
        return ok;
    }

    // Проверка кода
    async function handleVerifyOtp(inputCode: string) {
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: inputCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Неверный код");
                return false;
            }

            window.location.href = "/dashboard";
            return true;
        } catch {
            setError("Ошибка сети. Проверьте подключение.");
            return false;
        } finally {
            setLoading(false);
        }
    }

    function handleBackToEmail() {
        setStep("email");
        setError("");
        setSecondsLeft(0);
    }

    return (
        <main
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat px-[30px]"
            style={{ backgroundImage: `url(${bgImage.src})` }}
        >
            <div className="w-full max-w-[560px]">
                {step === "email" ? (
                    <LoginForm
                        onSubmit={handleSendOtp}
                        loading={loading}
                        error={error}
                    />
                ) : (
                    <OtpStep
                        email={email}
                        onVerify={handleVerifyOtp}
                        onBack={handleBackToEmail}
                        loading={loading}
                        error={error}
                        secondsLeft={secondsLeft}
                        resending={resending}
                        onResend={handleResend}
                    />
                )}
            </div>
        </main>
    );
}
