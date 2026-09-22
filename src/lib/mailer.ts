import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true для порта 465, false для 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOtpEmail(email: string, code: string) {
    await transporter.sendMail({
        from: `"Ripit" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Код подтверждения для входа в Ripit",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #37324C; margin: 0 0 16px;">Вход в Ripit</h2>
                <p style="color: #37324C; margin: 0 0 16px;">Ваш код подтверждения:</p>
                <p style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4945CA; margin: 24px 0; text-align: center;">
                    ${code}
                </p>
                <p style="color: #888; font-size: 14px; margin: 0;">
                    Код действует 10 минут. Если вы не запрашивали вход — просто проигнорируйте это письмо.
                </p>
            </div>
        `,
    });
}
