"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Globe } from "@/components/icons";
import { recordAdminSignInAction } from "@/app/(admin)/admin/auth-actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("The email or password is incorrect, or this account is not active.");
        setPending(false);
        return;
      }
      await recordAdminSignInAction();
      router.replace("/admin/dashboard");
    } catch {
      await createSupabaseBrowserClient().auth.signOut();
      setError("The email or password is incorrect, or this account is not active.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f5f7] lg:grid-cols-[0.9fr_1.1fr]">
      <AdminPendingOverlay visible={pending} label="Signing in…" />
      <section className="flex min-h-screen flex-col justify-between px-6 py-7 sm:px-12 lg:px-[clamp(3rem,6vw,7rem)] lg:py-10">
        <div className="flex items-center justify-between"><Image src="/arlar-logo-tight.png" alt="ArLAR" width={150} height={92} className="h-14 w-auto" /><span className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">Secure workspace</span></div>
        <div className="mx-auto w-full max-w-md py-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-crimson-600">ArLAR administration</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-ink-950 sm:text-5xl">Welcome back.</h1>
          <p className="mt-4 text-sm leading-6 text-ink-500">Manage the people, programmes, publications, and stories that power the ArLAR network.</p>
          <form className="mt-9 space-y-4" onSubmit={handleSubmit}>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-800">Email address</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@arabrheumatology.org" required className="h-12 w-full rounded-xl border border-[#d9dde2] bg-white px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-crimson-400 focus:ring-4 focus:ring-crimson-100" /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-800">Password</span><span className="relative block"><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required className="h-12 w-full rounded-xl border border-[#d9dde2] bg-white px-4 pr-16 text-sm text-ink-950 outline-none transition placeholder:text-ink-400 focus:border-crimson-400 focus:ring-4 focus:ring-crimson-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-500 hover:text-ink-950">{showPassword ? "Hide" : "Show"}</button></span></label>
            {error ? <p role="alert" className="rounded-xl border border-crimson-100 bg-crimson-50 px-3.5 py-3 text-xs leading-5 text-crimson-800">{error}</p> : null}
            <button type="submit" disabled={pending} className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-crimson-600 text-sm font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-wait disabled:opacity-65">{pending ? "Signing in…" : "Access admin"} {!pending ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}</button>
          </form>
        </div>
        <p className="text-xs text-ink-400">Authorized ArLAR personnel only · Activity will be logged in production.</p>
      </section>
      <section className="relative m-3 hidden min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] bg-[#071421] lg:block">
        <Image src="/images/about-hero-lab-alt.jpg" alt="ArLAR scientific collaboration" fill priority sizes="(min-width: 1024px) 50vw, 0px" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(7,20,33,.35),rgba(7,20,33,.95)_78%)]" />
        <div className="absolute inset-0 bg-dots opacity-50" />
        <div className="absolute left-10 top-10 flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-white backdrop-blur"><Globe className="h-3.5 w-3.5 text-jade-300" />Regional command centre</div>
        <div className="absolute inset-x-12 bottom-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jade-300">One network · one source of truth</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white">Everything ArLAR publishes, teaches, and builds—under control.</h2>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[['People','Unified profiles'],['Editorial','Three languages'],['Programmes','One workspace']].map(([title, note]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}
