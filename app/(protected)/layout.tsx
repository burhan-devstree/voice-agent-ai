"use client";
import { useFetchMe } from "@/hooks/api";
import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setUser, logout } = useAppStore();
  const router = useRouter();

  // Next.js-style data fetching effect
  const { data: userProfile, isError, isLoading } = useFetchMe(token);

  useEffect(() => {
    if (userProfile && token) setUser(userProfile);
    if (isError) {
      logout();
      router.push("/login");
    }
  }, [userProfile, isError, token, router, setUser, logout]);

  if (isLoading && token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
