import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TutorCard from "@/components/TutorCard";
import { getApprovedTutors } from "@/lib/tutors";

const PAGE_SIZE = 12;

export default async function TutorsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page: pageParam } = await searchParams;
    const page = Math.max(1, Number(pageParam) || 1);

    const {
        tutors,
        totalPages,
        page: currentPage,
    } = await getApprovedTutors(page, PAGE_SIZE);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-violet px-[30px] py-[60px]">
                <div className="container">
                    {/* Заголовок */}
                    <div className="text-center mb-[40px]">
                        <h1 className="font-days text-[40px] text-black mb-[12px]">
                            Учитесь у лучших
                        </h1>
                        <p className="text-darkGray text-[18px] max-w-[600px] mx-auto">
                            Проверенные репетиторы по всем предметам. Найдите
                            того, кто подойдёт именно вам
                        </p>
                    </div>

                    {/* Пусто или сетка */}
                    {tutors.length === 0 ? (
                        <div className="text-center py-[80px]">
                            <p className="text-darkGray">
                                Пока нет одобренных репетиторов
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                            {tutors.map((tutor) => (
                                <TutorCard key={tutor.id} tutor={tutor} />
                            ))}
                        </div>
                    )}

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-[8px] mt-[40px]">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <Link
                                    key={p}
                                    href={`/tutors?page=${p}`}
                                    className={`w-[40px] h-[40px] flex items-center justify-center rounded-full transition ${
                                        p === currentPage
                                            ? "bg-green text-black font-medium"
                                            : "bg-white text-darkGray hover:bg-violet"
                                    }`}
                                >
                                    {p}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
