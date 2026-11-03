"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("olivia.bennett@crewbase.dev");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showAlert, setShowAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error?.message ?? "Invalid email or password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!", {
        description: `Signed in as ${result.data?.user?.name ?? email}`,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("Network error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleSSO = (provider: string) => {
    toast.info(`Single Sign-On (${provider})`, {
      description: "SSO authentication is managed via enterprise identity provider.",
    });
  };

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">
      {/* Top Identity Accent */}
      <div className="mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground/80 border border-border/80 shadow-2xs">
        <span className="size-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
          Identity Gateway • SSO Enforced
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full bg-card rounded-xl border border-border shadow-xs p-6 sm:p-7 flex flex-col relative overflow-hidden">
        {/* Top brand gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-300 via-primary to-blue-600" />

        {/* Card Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your Crewbase account
          </p>
        </div>

        {/* Demo Accounts Notice */}
        {showAlert && (
          <Alert className="mb-4 bg-primary/10 border-primary/20 text-foreground relative pr-8">
            <AlertCircle className="size-4 text-primary" />
            <AlertTitle className="text-xs font-semibold text-primary">Pre-seeded Accounts</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Admin: <code className="text-foreground font-mono">olivia.bennett@crewbase.dev</code> | Password: <code className="text-foreground font-mono">Password@123</code>
            </AlertDescription>
            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss alert"
            >
              <X className="size-3.5" />
            </button>
          </Alert>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/20 text-destructive text-xs">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-xs font-medium text-foreground">
              Work email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-9 pl-9 text-sm bg-muted/30 border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-medium text-foreground">
                Password
              </label>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Password Reset", {
                    description: "Self-service password reset is disabled for workspace policy.",
                  });
                }}
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted font-medium flex items-center gap-1">
              <ShieldCheck className="size-3 text-primary" />
              2FA Ready
            </span>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in to Crewbase</span>
            )}
          </Button>
        </form>

        {/* SSO / Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* SSO Actions */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSSO("SAML / Okta")}
            className="w-full h-9 justify-center gap-2 text-xs font-medium border-border"
          >
            <ShieldCheck className="size-4 text-primary" />
            <span>Single Sign-On (SAML / Okta)</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSSO("Google Workspace")}
            className="w-full h-9 justify-center gap-2 text-xs font-medium border-border"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Footer Link */}
        <div className="mt-5 pt-4 text-center border-t border-border -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Regulatory Footnote */}
      <p className="mt-4 text-center text-xs text-muted-foreground max-w-xs leading-relaxed">
        By signing in, you agree to Crewbase&apos;s{" "}
        <Link href="#" className="underline hover:text-foreground">Terms</Link> and{" "}
        <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <span>All Systems Operational • US-East</span>
      </div>
    </div>
  );
}
