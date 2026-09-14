"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { recordAdminSignInAction } from "@/app/(admin)/admin/auth-actions";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminInviteAcceptance() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function acceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 10) return setError("Use at least 10 characters for your password.");
    if (password !== confirmation) return setError("The passwords do not match.");
    setPending(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Open this page from the latest Supabase invitation email.");
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) throw passwordError;
      const { data: activated, error: activationError } = await supabase.rpc("activate_my_admin_invitation");
      if (activationError || !activated) throw activationError || new Error("This invitation is no longer active.");
      await recordAdminSignInAction();
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The invitation could not be activated.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f5f7] px-4 py-10">
      <AdminPendingOverlay visible={pending} label="Activating administrator…" />
      <section className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-6 shadow-[0_24px_80px_rgba(7,20,33,.1)] sm:p-8">
        <Image src="/arlar-logo-tight.png" alt="ArLAR" width={130} height={80} className="h-14 w-auto" />
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson-600">Administrator invitation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-ink-950">Create your password.</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">This activates only the administrator account invited by the ArLAR owner.</p>
        <form onSubmit={acceptInvitation} className="mt-7 space-y-4">
          <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-800">New password</span><input type="password" minLength={10} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-ink-200 px-4 text-sm outline-none focus:border-crimson-400 focus:ring-4 focus:ring-crimson-100" /></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-ink-800">Confirm password</span><input type="password" minLength={10} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12 w-full rounded-xl border border-ink-200 px-4 text-sm outline-none focus:border-crimson-400 focus:ring-4 focus:ring-crimson-100" /></label>
          {error ? <p role="alert" className="rounded-xl border border-crimson-100 bg-crimson-50 px-4 py-3 text-xs leading-5 text-crimson-800">{error}</p> : null}
          <button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-crimson-600 text-sm font-semibold text-white transition hover:bg-crimson-700 disabled:cursor-wait disabled:opacity-60">{pending ? "Activating…" : "Activate administrator access"}</button>
        </form>
      </section>
    </main>
  );
}
