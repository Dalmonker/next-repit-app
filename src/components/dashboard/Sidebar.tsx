"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Svg } from "@/components/Svg";

const MENU = [
    { href: "/dashboard", label: "Главная", iconId: "aside-home" },
    { href: "/dashboard/students", label: "Ученики", iconId: "aside-students" },
    {
        href: "/dashboard/schedule",
        label: "Расписание",
        iconId: "aside-schedule",
    },
    {
        href: "/dashboard/finance",
        label: "Финансы",
        iconId: "aside-wallet",
    },
    { href: "/dashboard/statistics", label: "Доски", iconId: "aside-boards" },
    {
        href: "/dashboard/notifications",
        label: "Чаты",
        iconId: "aside-chats",
        badge: 3,
    },
];

const SECONDARY = [
    {
        href: "/dashboard/settings",
        label: "Настройки",
        iconId: "aside-settings",
        className:
            "text-black bg-white rounded-[30px] mb-0 pt-[12px] pb-[14px]",
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    function renderItem(item: {
        href: string;
        label: string;
        iconId: string;
        badge?: number;
        className?: string;
    }) {
        const isActive =
            item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/student") ||
                  pathname.startsWith("/dashboard/tutor") ||
                  pathname.startsWith("/dashboard/parent")
                : pathname === item.href;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex font-medium mb-[30px] items-center gap-[12px] px-[14px] rounded-[10px] text-[17px] transition ${
                    item.className ?? "text-white"
                }`}
            >
                <Svg iconId={`${item.iconId}`} className="w-[24px] h-[24px]" />

                <span>{item.label}</span>
                {item.badge && (
                    <span className="ml-auto bg-[#EEF861] text-black text-[12px] font-medium px-[8px] py-[2px] rounded-full">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <aside className="sticky top-[30px] h-[calc(100vh-60px)] w-[300px] pb-[30px] rounded-[30px] bg-black border-r flex flex-col">
            <div className="p-[30px] flex flex-col h-full">
                <div className="flex items-center justify-between mb-[38px]">
                    <Link href="/" className="flex items-center gap-2">
                        <Svg
                            className="w-[74px] h-[42px]"
                            iconId="logo"
                            color="#F3F3F3"
                        />
                    </Link>
                    <button
                        type="button"
                        className="cursor-pointer w-[28px] h-[28px] flex items-center justify-center rounded-[8px] border border-[#EDEDF5] text-darkGray hover:bg-violet"
                        aria-label="Свернуть"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                </div>
                <div className="h-[1px] w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)]" />

                <nav className="mt-[28px]">
                    {MENU.map(renderItem)}

                    <div className="h-[1px] w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] my-[44px]" />
                    {SECONDARY.map(renderItem)}
                </nav>

                <div className="mt-auto bg-white p-[7px] rounded-[30px] flex items-center gap-[12px]">
                    <div className="w-[44px] h-[44px] rounded-full bg-violet shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-medium text-black mb-[2px]">
                            Дмитрий
                        </p>
                        <p className="text-[13px] font-medium text-gray">
                            Преподаватель
                        </p>
                    </div>
                    <button
                        type="button"
                        className="cursor-pointer p-[11px] border border-violet rounded-full"
                        aria-label="Выйти"
                    >
                        <Svg
                            iconId="aside-leave"
                            className="w-[20px] h-[20px]"
                        />
                    </button>
                </div>
            </div>
        </aside>
    );
}
