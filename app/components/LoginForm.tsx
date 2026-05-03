// components/LoginForm.tsx
"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginState('loading');

    const formattedEmail = `${username.trim().toLowerCase()}@vt.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formattedEmail,
      password,
    });

    if (error) {
      setError("Incorrect login. Try again.");
      setLoginState('idle');
    } else {
      setLoginState('success');
      
      // Wait 2.5 seconds to show the welcome text, then load the game
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 2500);
    }
  };

  if (loginState === 'success') {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white animate-pulse">
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider">
          Welcome, {username}
        </h1>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center text-white"
    >
      {/* Removed backdrop-blur-sm here so the image stays sharp */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 bg-neutral-900/80 p-8 rounded-xl shadow-2xl w-96 border border-neutral-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Welcome to VT Island!</h2>
        
        {error && <p className="text-red-400 mb-4 text-center font-semibold">{error}</p>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            className="p-3 rounded bg-neutral-800 border border-neutral-600 focus:outline-none focus:border-blue-500 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loginState === 'loading'}
          />
          <input
            type="password"
            placeholder="Passcode"
            className="p-3 rounded bg-neutral-800 border border-neutral-600 focus:outline-none focus:border-blue-500 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginState === 'loading'}
          />
          <button 
            type="submit" 
            disabled={loginState === 'loading'}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 text-white font-bold py-3 rounded mt-2 transition-colors"
          >
            {loginState === 'loading' ? 'Loading World...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}