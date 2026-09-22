import Link from "next/link";
import Image from "next/image";
import { Svg } from "@/components/Svg";

export default function Header() {
    return (
        <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/login" className="flex items-center gap-2">
                <Svg iconId="logo" />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
                <Link href="#" className="hover:text-blue-600 transition">
                    Возможности
                </Link>
                <Link href="#" className="hover:text-blue-600 transition">
                    Для ученика
                </Link>
                <Link href="#" className="hover:text-blue-600 transition">
                    Материалы
                </Link>
            </nav>

            <button className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                Войти
            </button>
        </header>
    );
}
