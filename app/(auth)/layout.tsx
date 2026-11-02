import * as React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-background px-4 py-8">
      {/* Top Brand Header */}
      <div className="w-full flex justify-center pt-2 sm:pt-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-xs">
            CB
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">
            Crewbase
          </span>
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full pb-2 pt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>© 2024 Crewbase Inc. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground transition-colors">
              Security
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
