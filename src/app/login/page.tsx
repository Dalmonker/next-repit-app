"use client";

import { useState } from "react";
import LoginForm from "@/components/ui/LoginForm";
import OtpStep from "@/components/ui/OtpStep";
import bgImage from "@/assets/images/login/backgroundLogin.webp";

export default function LoginPage() {
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Отправка кода на почту
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
            return true;
        } catch {
            setError("Ошибка сети. Проверьте подключение.");
            return false;
        } finally {
            setLoading(false);
        }
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

    // Повторная отправка кода (для таймера в OtpStep)
    async function handleResendOtp() {
        return handleSendOtp(email, true);
    }

    function handleBackToEmail() {
        setStep("email");
        setError("");
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
                        onResend={handleResendOtp}
                        onBack={handleBackToEmail}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </main>
    );
}
