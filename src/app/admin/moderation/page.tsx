import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPendingTutors } from "@/lib/admin";
import ModerationList from "./ModerationList";

export default async function ModerationPage() {
    const session = await getSession();

    // Защита: только админ
    if (!session || session.role !== "admin") {
        notFound();
    }

    const tutors = await getPendingTutors();

    return (
        <main className="min-h-screen bg-violet px-[30px] py-[60px]">
            <div className="container max-w-[1200px]">
                <h1 className="font-days text-[36px] text-black mb-[12px]">
                    Модерация репетиторов
                </h1>
                <p className="text-darkGray text-[16px] mb-[40px]">
                    {tutors.length === 0
                        ? "Нет заявок на модерацию"
                        : `Заявок в ожидании: ${tutors.length}`}
                </p>

                {tutors.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-[60px] text-center">
                        <p className="text-darkGray text-[18px]">
                            Все заявки обработаны. Новые появятся здесь
                            автоматически.
                        </p>
                    </div>
                ) : (
                    <ModerationList tutors={tutors} />
                )}
            </div>
        </main>
    );
}
