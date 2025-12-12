import React from "react";
import { Providers } from "../components/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
            <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center ">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
