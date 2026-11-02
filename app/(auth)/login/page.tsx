import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login — Crewbase",
  description: "Sign in to your Crewbase workspace account",
};

export default function LoginPage() {
  return <LoginForm />;
}
