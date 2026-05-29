"use client";

import { useAuth } from "@/lib/auth";

export default function LoginButton() {

  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] text-[#1C1C1C]">

      {user ? (

        <div className="flex flex-col items-center gap-4">

          <h1 className="text-2xl font-bold">
            Welcome {user.displayName}
          </h1>

          <p>{user.email}</p>

          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors font-bold"
          >
            Sign Out
          </button>

        </div>

      ) : (

        <button
          onClick={signInWithGoogle}
          className="bg-[#1F5C4A] hover:bg-[#2F7A62] text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Sign In With Google
        </button>

      )}

    </div>
  );
}