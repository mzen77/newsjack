import Link from "next/link";
import type { ReactNode } from "react";

import type { AppUser } from "../../lib/auth";
import { signOutAction } from "./actions";

export function AppShell({
  user,
  children,
}: {
  user: AppUser;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090b0f] text-zinc-50">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link className="font-semibold" href="/app/dashboard">
            Mike&apos;s Newsjack Web
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/profile">Company profile</Link>
            <form action={signOutAction}>
              <button className="hover:text-white" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="mb-6 font-mono text-xs text-zinc-500">{user.email}</p>
        {children}
      </main>
    </div>
  );
}
