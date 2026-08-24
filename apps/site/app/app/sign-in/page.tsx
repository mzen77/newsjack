import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "../../../lib/auth";
import { sendMagicLinkAction } from "../actions";

type Props = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
    developmentUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  if (await currentUser()) {
    redirect("/app/dashboard");
  }
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-5 py-16">
      <section className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-7 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">
          Mike&apos;s Newsjack Web
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Enter your email. We&apos;ll send a one-time link that expires in 15
          minutes.
        </p>

        {params.sent && (
          <p className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            Check your inbox for the sign-in link.
          </p>
        )}
        {params.error && (
          <p className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
            {params.error}
          </p>
        )}
        {params.developmentUrl && (
          <a
            className="mt-4 block rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100 underline"
            href={params.developmentUrl}
          >
            Development only: open the magic link
          </a>
        )}

        <form action={sendMagicLinkAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300"
            id="email"
            name="email"
            placeholder="you@company.com"
            required
            type="email"
          />
          <button
            className="w-full rounded-lg bg-emerald-300 px-4 py-2.5 font-semibold text-zinc-950 hover:bg-emerald-200"
            type="submit"
          >
            Send magic link
          </button>
        </form>

        <Link
          className="mt-6 block text-center text-xs text-zinc-500 underline"
          href="/"
        >
          Back to the fork site
        </Link>
      </section>
    </main>
  );
}
