"use client";

import { useState } from "react";
import ProfileTab from "./ProfileTab";
import Placeholder from "./Placeholder";

type Props = {
    email: string;
    role: "student" | "parent" | "tutor";
    userId: number;
};

type TabId = "profile" | "lessons" | "notifications" | "payments";

const TABS: { id: TabId; label: string }[] = [
    { id: "profile", label: "Профиль" },
    { id: "lessons", label: "Уроки" },
    { id: "notifications", label: "Уведомления" },
    { id: "payments", label: "Платежи" },
];

export default function SettingsClient({ email, role, userId }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    return (
        <>
            <h1 className="font-days text-[32px] text-black mb-[24px]">
                Настройки
            </h1>

            {/* Табы */}
            <div className="flex gap-[8px] mb-[24px] flex-wrap">
                {TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`cursor-pointer px-[20px] py-[10px] rounded-full text-[14px] font-medium transition ${
                                isActive
                                    ? "bg-[#2E2A45] text-white"
                                    : "bg-white text-darkGray hover:text-black"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Контент */}
            {activeTab === "profile" && (
                <ProfileTab email={email} role={role} userId={userId} />
            )}
            {activeTab === "lessons" && <Placeholder title="Уроки" />}
            {activeTab === "notifications" && (
                <Placeholder title="Уведомления" />
            )}
            {activeTab === "payments" && <Placeholder title="Платежи" />}
        </>
    );
}
