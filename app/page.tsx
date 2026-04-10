// app/page.tsx
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import LoginForm from "./components/LoginForm";

const GameCanvas = dynamic(() => import("./components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isFadingIn, setIsFadingIn] = useState(false);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setTimeout(() => setIsFadingIn(true), 50);
  };

  if (!user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <main
      className={`h-screen w-screen bg-black transition-opacity duration-1000 ${
        isFadingIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <GameCanvas />
    </main>
  );
}
