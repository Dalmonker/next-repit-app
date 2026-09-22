import LoginForm from "@/components/ui/LoginForm";
import bgImage from "@/assets/images/login/backgroundLogin.webp";

export default function LoginPage() {
    return (
        <main
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat px-[30px]"
            style={{ backgroundImage: `url(${bgImage.src})` }}
        >
            <div className="w-full max-w-[560px]">
                <LoginForm />
            </div>
        </main>
    );
}
