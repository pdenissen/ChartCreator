"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-[#232628] dark:bg-[#181a1b] border-b border-primary/20 shadow-lg mb-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="text-2xl font-extrabold text-primary rounded-xl px-4 py-2 hover:bg-primary/10 transition-colors"
          >
            Drum Chart Creator
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/charts">
                  <Button className="rounded-lg" variant="ghost">
                    My Charts
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  className="rounded-lg"
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="rounded-lg" variant="ghost">
                  Sign In
                </Button>
              </Link>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2 p-2 rounded-full border border-primary/20 bg-background shadow hover:bg-primary/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-6 w-6 text-primary" />
              ) : (
                <MoonIcon className="h-6 w-6 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
