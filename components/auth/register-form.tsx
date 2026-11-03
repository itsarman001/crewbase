"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      setErrorNotice("Full name must be at least 2 characters.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorNotice("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorNotice("Password must be at least 8 characters long.");
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorNotice("Password must contain at least 1 letter and 1 number.");
      return;
    }

    setErrorNotice(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          teamCode: teamCode.trim() ? teamCode.trim().toUpperCase() : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorNotice(
          result.error?.message ?? "Registration failed. Please check your information."
        );
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!", {
        description: `Welcome to Crewbase, ${result.data?.user?.name ?? name}!`,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorNotice("Network error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
      <div className="w-full bg-card rounded-xl border border-border shadow-xs p-6 sm:p-7 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get started with your team workspace on Crewbase
          </p>
        </div>

        {/* Info Banner: First account becomes Admin */}
        <Alert className="bg-primary/10 border-primary/20 text-primary py-2.5 px-3">
          <Info className="size-4 shrink-0 text-primary" />
          <AlertDescription className="text-xs text-foreground font-medium leading-normal">
            Self-registration defaults to standard <strong>USER</strong> access.
          </AlertDescription>
        </Alert>

        {/* Validation error alert if active */}
        {errorNotice && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
            <AlertCircle className="size-4 shrink-0" />
            <AlertDescription className="text-xs font-medium">
              {errorNotice}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-1">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fullName" className="text-xs font-medium text-foreground">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-9 pl-9 text-sm bg-muted/30 border-border"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="registerEmail" className="text-xs font-medium text-foreground">
              Work email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="registerEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-9 pl-9 text-sm bg-muted/30 border-border"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="registerPassword" className="text-xs font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="registerPassword"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-9 pl-9 pr-9 text-sm bg-muted/30 border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Must contain at least 8 characters with letters & numbers.
            </p>
          </div>

          {/* Team Code (Optional) */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="teamCode" className="text-xs font-medium text-foreground">
                Squad code
              </label>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                Optional
              </span>
            </div>
            <Input
              id="teamCode"
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="e.g. ENG or DSN"
              className="h-9 text-sm bg-muted/30 border-border font-mono uppercase"
            />
            <p className="text-[11px] text-muted-foreground">
              Have a squad code? Enter it to join your team automatically.
            </p>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 mt-1 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Card Footer / Sign in Link */}
        <div className="pt-2 text-center border-t border-border -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>Protected by enterprise-grade encryption & SOC-2 compliance.</span>
      </div>
    </div>
  );
}
