import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/(admin)/login/login-form";

export const metadata: Metadata = {
  title: "Admin Login - AirportMatrix",
  robots: { index: false },
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value === "authenticated") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">AM</span>
          </div>
          <h1 className="text-xl font-bold text-white">AirportMatrix Admin</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
