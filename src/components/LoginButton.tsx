"use client";

import { useAuth } from "@/lib/auth";

export default function LoginButton() {

  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">

      {user ? (

        <div className="flex flex-col items-center gap-4">

          <h1 className="text-2xl font-bold">
            Welcome {user.displayName}
          </h1>

          <p>{user.email}</p>

          <button
            onClick={signOut}
            className="bg-red-500 px-6 py-3 rounded-xl"
          >
            Sign Out
          </button>

        </div>

      ) : (

        <button
          onClick={signInWithGoogle}
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
        >
          Sign In With Google
        </button>

      )}

    </div>
  );
}