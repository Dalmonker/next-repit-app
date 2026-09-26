import Link from "next/link";
import TutorCard from "@/components/TutorCard";
import { getApprovedTutors } from "@/lib/tutors";

export default async function FeaturedTutors() {
    const { tutors } = await getApprovedTutors(1, 6);

    if (tutors.length === 0) return null;

    return (
        <section className="w-full bg-violet py-[80px] px-[30px]">
            <div className="container">
                {/* Заголовок */}
                <div className="text-center mb-[40px]">
                    <h2 className="font-days text-[40px] text-black mb-[12px]">
                        Учитесь у лучших
                    </h2>
                    <p className="text-darkGray text-[18px] max-w-[600px] mx-auto">
                        Проверенные репетиторы по всем предметам
                    </p>
                </div>

                {/* Сетка карточек */}
                <div className="flex gap-[20px] mb-[40px]">
                    {tutors.map((tutor) => (
                        <TutorCard key={tutor.id} tutor={tutor} />
                    ))}
                </div>

                {/* Кнопка «Смотреть всех» */}
                <div className="flex justify-center">
                    <Link
                        href="/tutors"
                        className="bg-green text-black px-[32px] py-[14px] rounded-full font-medium hover:bg-[#c2e055] transition"
                    >
                        Смотреть всех репетиторов →
                    </Link>
                </div>
            </div>
        </section>
    );
}
