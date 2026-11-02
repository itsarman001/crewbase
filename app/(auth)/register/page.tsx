import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register — Crewbase",
  description: "Create an account on Crewbase to manage teams and role-based access",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
