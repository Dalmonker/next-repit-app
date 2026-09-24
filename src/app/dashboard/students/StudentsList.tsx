import Image from "next/image";
import type { TutorStudentItem } from "@/lib/invitations";

export default function StudentsList({
    students,
}: {
    students: TutorStudentItem[];
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {students.map((s) => {
                const fullName =
                    [s.first_name, s.last_name].filter(Boolean).join(" ") ||
                    "Ученик";

                const startDate = new Date(s.started_at).toLocaleDateString(
                    "ru-RU",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    },
                );

                return (
                    <div
                        key={s.id}
                        className="bg-white rounded-[24px] p-[24px] flex items-center gap-[16px]"
                    >
                        <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden bg-violet shrink-0">
                            {s.avatar_url ? (
                                <Image
                                    src={s.avatar_url}
                                    alt={fullName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-darkGray text-[10px]">
                                    Нет фото
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="font-medium text-black text-[16px] truncate">
                                {fullName}
                            </p>
                            <p className="text-darkGray text-[13px]">
                                с {startDate}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
