import nodemailer from "nodemailer";

// ============================================================
// Транспорт
// ============================================================

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true для порта 465, false для 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ============================================================
// Общий HTML-каркас письма
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function renderEmail(content: string): string {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #37324C;">
            ${content}
            <hr style="border: none; border-top: 1px solid #EDEDF5; margin: 32px 0 16px;" />
            <p style="color: #888; font-size: 12px; margin: 0;">
                Ripit — платформа для поиска репетиторов.
                <a href="${SITE_URL}" style="color: #4945CA;">Перейти на сайт</a>
            </p>
        </div>
    `;
}

// ============================================================
// 1. Код подтверждения (OTP)
// ============================================================

export async function sendOtpEmail(email: string, code: string) {
    await transporter.sendMail({
        from: `"Ripit" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Код подтверждения для входа в Ripit",
        html: renderEmail(`
            <h2 style="margin: 0 0 16px;">Вход в Ripit</h2>
            <p style="margin: 0 0 16px;">Ваш код подтверждения:</p>
            <p style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4945CA; margin: 24px 0; text-align: center;">
                ${code}
            </p>
            <p style="color: #888; font-size: 14px; margin: 0;">
                Код действует 10 минут. Если вы не запрашивали вход — просто проигнорируйте это письмо.
            </p>
        `),
    });
}

// ============================================================
// 2. Новое приглашение (ученик → репетитор)
// ============================================================

export async function sendInvitationEmail(
    tutorEmail: string,
    studentName: string,
    tutorName: string,
) {
    await transporter.sendMail({
        from: `"Ripit" <${process.env.SMTP_USER}>`,
        to: tutorEmail,
        subject: "Новая заявка на занятия в Ripit",
        html: renderEmail(`
            <h2 style="margin: 0 0 16px;">Новая заявка 📩</h2>
            <p style="margin: 0 0 12px;">Здравствуйте, ${tutorName}!</p>
            <p style="margin: 0 0 12px;">
                Ученик <b>${studentName}</b> хочет заниматься с вами.
            </p>
            <p style="margin: 0 0 24px;">
                Откройте кабинет, чтобы принять или отклонить заявку.
            </p>
            <a href="${SITE_URL}/dashboard/students"
               style="display: inline-block; background: #D5F861; color: #37324C; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-weight: 600;">
                Открыть заявки →
            </a>
        `),
    });
}

// ============================================================
// 3. Приглашение принято (репетитор → ученик)
// ============================================================

export async function sendInvitationAcceptedEmail(
    studentEmail: string,
    tutorName: string,
    studentName: string,
) {
    await transporter.sendMail({
        from: `"Ripit" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: "Ваша заявка принята!",
        html: renderEmail(`
            <h2 style="margin: 0 0 16px;">Заявка принята ✅</h2>
            <p style="margin: 0 0 12px;">Здравствуйте, ${studentName}!</p>
            <p style="margin: 0 0 12px;">
                Репетитор <b>${tutorName}</b> принял вашу заявку на занятия.
            </p>
            <p style="margin: 0 0 24px;">
                Свяжитесь с репетитором, чтобы договориться о первом уроке.
            </p>
            <a href="${SITE_URL}/dashboard/student"
               style="display: inline-block; background: #D5F861; color: #37324C; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-weight: 600;">
                Открыть кабинет →
            </a>
        `),
    });
}

// ============================================================
// 4. Приглашение отклонено (репетитор → ученик)
// ============================================================

export async function sendInvitationRejectedEmail(
    studentEmail: string,
    tutorName: string,
    studentName: string,
) {
    await transporter.sendMail({
        from: `"Ripit" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: "Заявка отклонена",
        html: renderEmail(`
            <h2 style="margin: 0 0 16px;">Заявка отклонена</h2>
            <p style="margin: 0 0 12px;">Здравствуйте, ${studentName}!</p>
            <p style="margin: 0 0 12px;">
                К сожалению, репетитор <b>${tutorName}</b> отклонил вашу заявку.
            </p>
            <p style="margin: 0 0 24px;">
                Вы можете найти другого репетитора в нашем каталоге.
            </p>
            <a href="${SITE_URL}/tutors"
               style="display: inline-block; background: #D5F861; color: #37324C; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-weight: 600;">
                Смотреть каталог →
            </a>
        `),
    });
}
