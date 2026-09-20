import Image from "next/image";
import Link from "next/link";
import { Svg } from "@/components/Svg";

export default function Hero() {
    return (
        <section className="container">
            <Link
                href="/directions"
                className="inline-flex items-center gap-3 mb-6 border border-blackTitle rounded-full bg-white pl-2 pr-5 py-2"
            >
                <div className="flex items-center -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
                        <Svg iconId="icon-book" size={18} />
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden">
                        <Svg iconId="icon-ruler" size={18} />
                    </div>

                    <div className="w-10 h-10 rounded-full bg-[#C6F04D] border-2 border-white flex items-center justify-center">
                        <span className="font-bold text-black text-base">
                            9+
                        </span>
                    </div>
                </div>

                <span className="text-lg text-blackTitle">направлений</span>
            </Link>

            <div className="bg-[#5B4DDF] rounded-[2rem] p-[50px]">
                <div className="">
                    <h1 className="mb-[20px] max-w-[615px] text-[50px] text-white leading-[120%] tracking-[-0.43px]">
                        Учитесь с репетитором, который превращает уроки в
                        прогресс
                    </h1>

                    <p className="text-white">
                        Вместе достигаем целей на удобной платформе
                    </p>

                    <button className="mt-[40px] bg-green text-black text-[17px] px-[24px] py-[16px] rounded-full">
                        Найти репетитора
                    </button>
                </div>
            </div>

            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900">
                    Добро пожаловать
                </h2>
            </div>
        </section>
    );
}
