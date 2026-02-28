import { LoginForm } from "@/components/auth/loginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0B0F19] overflow-hidden px-4">

      {/* Adding Background Glow Effects */}
      <div className="absolute w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl -bottom-40 -right-40" />

      <div className="relative w-full max-w-md text-center space-y-6">

        <LoginForm />
      </div>
    </div>
  )
}
