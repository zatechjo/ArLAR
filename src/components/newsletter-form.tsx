"use client";

import { useActionState } from "react";
import Link from "next/link";

import { subscribeToMailingListAction, type SubmissionState } from "@/app/submission-actions";
import { ArrowRight, Check } from "@/components/icons";
import { useTranslations } from "@/i18n/locale-context";

export function NewsletterForm() {
  const { t, href } = useTranslations();
  const [state, formAction, pending] = useActionState<SubmissionState, FormData>(
    subscribeToMailingListAction,
    { success: false, message: "" },
  );

  return (
    <form className="space-y-3" action={formAction}>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label htmlFor="footer-email" className="font-display text-[10px] font-semibold tracking-[0.12em] text-white/55 uppercase">
        {t("Email address")}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="footer-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#08131f] px-4 text-[13px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-jade-400/60"
        />
        <button type="submit" disabled={pending || state.success} className="group inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-jade-500 px-5 font-display text-[12px] font-semibold text-white transition-colors hover:bg-jade-400 disabled:cursor-wait disabled:opacity-60">
          {pending ? t("Subscribing…") : state.success ? t("Subscribed") : t("Subscribe")}
          <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      {state.message ? (
        <p aria-live="polite" className={`flex items-center gap-2 text-[10.5px] ${state.success ? "text-jade-200" : "text-crimson-200"}`}>
          {state.success ? <Check className="size-3.5" /> : null}{t(state.message)}
        </p>
      ) : null}
      <p className="text-[10px] leading-4 text-white/30">
        {t("Occasional updates only. You can unsubscribe at any time. See our")} {" "}
        <Link href={href("/privacy")} className="underline underline-offset-2 transition-colors hover:text-white/60">{t("privacy policy")}</Link>.
      </p>
    </form>
  );
}
