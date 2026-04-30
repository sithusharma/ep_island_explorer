// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LoginForm from "./components/LoginForm";
import { supabase } from "./utils/supabase";
import type { User } from "@supabase/supabase-js";

const GameCanvas = dynamic(() => import("./components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const sessionUser = data.session?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
        setTimeout(() => setIsFadingIn(true), 50);
      }
      setCheckingSession(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) setTimeout(() => setIsFadingIn(true), 50);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setTimeout(() => setIsFadingIn(true), 50);
  };

  if (checkingSession) {
    return <main className="h-screen w-screen bg-black" />;
  }

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <main
      className={`h-screen w-screen bg-black transition-opacity duration-1000 ${
        isFadingIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <GameCanvas user={user} />
    </main>
  );
}
