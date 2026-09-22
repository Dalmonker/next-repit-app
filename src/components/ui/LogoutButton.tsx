"use client";

export default function LogoutButton() {
    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <button
            onClick={handleLogout}
            className="cursor-pointer w-full bg-green text-black pt-[10px] pb-[12px] rounded-full hover:bg-[#c2e055] transition"
        >
            Выйти
        </button>
    );
}
