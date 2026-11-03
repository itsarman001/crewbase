import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login — Crewbase",
  description: "Sign in to your Crewbase workspace account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[400px] mx-auto min-h-[380px] rounded-xl border border-border bg-card animate-pulse" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
