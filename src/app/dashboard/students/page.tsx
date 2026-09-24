import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTutorInvitations, getTutorStudents } from "@/lib/invitations";
import InvitationsList from "./InvitationsList";
import StudentsList from "./StudentsList";

export default async function StudentsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    if (session.role !== "tutor") {
        redirect("/dashboard");
    }

    const [invitations, students] = await Promise.all([
        getTutorInvitations(session.userId),
        getTutorStudents(session.userId),
    ]);

    return (
        <>
            <h1 className="font-days text-[32px] text-black mb-[24px]">
                Мои ученики
            </h1>

            {/* Заявки */}
            <section className="mb-[40px]">
                <h2 className="font-days text-[22px] text-black mb-[16px]">
                    Новые заявки
                    {invitations.length > 0 && (
                        <span className="ml-[8px] bg-green text-black text-[14px] font-medium px-[10px] py-[2px] rounded-full">
                            {invitations.length}
                        </span>
                    )}
                </h2>

                {invitations.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-[32px] text-center">
                        <p className="text-darkGray">Пока нет новых заявок</p>
                    </div>
                ) : (
                    <InvitationsList invitations={invitations} />
                )}
            </section>

            {/* Активные ученики */}
            <section>
                <h2 className="font-days text-[22px] text-black mb-[16px]">
                    Активные ученики
                    {students.length > 0 && (
                        <span className="ml-[8px] bg-violet text-black text-[14px] font-medium px-[10px] py-[2px] rounded-full">
                            {students.length}
                        </span>
                    )}
                </h2>

                {students.length === 0 ? (
                    <div className="bg-white rounded-[24px] p-[32px] text-center">
                        <p className="text-darkGray">
                            Пока нет активных учеников
                        </p>
                    </div>
                ) : (
                    <StudentsList students={students} />
                )}
            </section>
        </>
    );
}
