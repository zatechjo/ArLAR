"use client";

import { useActionState, useMemo, useState } from "react";

import { submitPatientQuestionAction, type SubmissionState } from "@/app/submission-actions";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Close,
  ExternalLink,
  HeartPulse,
  Mail,
  Search,
} from "@/components/icons";
import {
  patientFaqCategories,
  type PatientFaq,
  type PatientFaqCategory,
} from "@/data/patient-faqs";
import { useTranslations } from "@/i18n/locale-context";

type CategoryFilter = "all" | PatientFaqCategory;

const formInputClassName =
  "w-full rounded-xl border border-white/12 bg-white/[0.07] px-4 py-2.5 font-display text-[12.5px] text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-white/28 hover:border-white/20 focus:border-jade-300/65 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(51,201,126,0.1)]";

export function PatientFaqCentre({ faqs }: { faqs: PatientFaq[] }) {
  const { t } = useTranslations();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("rheumatology");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        patientFaqCategories.map((item) => [
          item.id,
          item.id === "all"
            ? faqs.length
            : faqs.filter((faq) => faq.category === item.id).length,
        ]),
      ),
    [faqs],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      if (category !== "all" && faq.category !== category) return false;
      if (!normalizedQuery) return true;
      return [t(faq.question), ...faq.answer.map(t)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, faqs, query, t]);

  const activeCategory = patientFaqCategories.find(
    (item) => item.id === category,
  );

  const chooseCategory = (value: CategoryFilter) => {
    setCategory(value);
    setOpenId(null);
  };

  const clearSearch = () => {
    setQuery("");
    setCategory("all");
    setOpenId(faqs[0]?.id ?? null);
  };

  return (
    <section className="bg-[#f4f7f6] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0 lg:sticky lg:top-56 lg:self-start">
            <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
              {t("Browse by topic")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1.5">
              {patientFaqCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseCategory(item.id)}
                  aria-pressed={category === item.id}
                  className={`group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-start font-display text-[11.5px] font-semibold transition-colors last:col-span-2 lg:col-span-1 lg:px-4 lg:text-[12px] ${
                    category === item.id
                      ? "bg-ink-950 text-white"
                      : "border border-ink-100 bg-white text-ink-600 hover:border-jade-200 hover:text-jade-800"
                  }`}
                >
                  <span>{t(item.shortLabel)}</span>
                  <span
                    className={
                      category === item.id ? "text-white/45" : "text-ink-300"
                    }
                  >
                    {counts[item.id]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 hidden rounded-[1.35rem] border border-jade-100 bg-jade-50/65 p-5 lg:block">
              <HeartPulse className="size-5 text-jade-700" />
              <p className="mt-4 font-display text-[13px] font-semibold leading-5 text-ink-900">
                {t("Information, not a diagnosis")}
              </p>
              <p className="mt-2 text-[11.5px] leading-5 text-ink-500">
                {t("These answers support—not replace—care from your own healthcare professional.")}
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-[1.5rem] border border-ink-100 bg-white p-4 sm:p-5">
              <label className="flex min-h-13 items-center gap-3 rounded-2xl bg-[#f3f6f5] px-4 transition-[background-color,box-shadow] focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(0,149,59,0.18)]">
                <Search className="size-4.5 shrink-0 text-jade-700" />
                <span className="sr-only">{t("Search patient questions")}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setOpenId(null);
                  }}
                  placeholder={t("Search symptoms, medicines, exercise, COVID-19…")}
                  className="min-w-0 flex-1 bg-transparent font-display text-[13px] text-ink-950 outline-none placeholder:text-ink-400 sm:text-[14px]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={t("Clear FAQ search")}
                    className="grid size-8 cursor-pointer place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                  >
                    <Close className="size-4" />
                  </button>
                ) : null}
              </label>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-3 border-b border-ink-150 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-display text-[10px] font-semibold tracking-[0.15em] text-jade-700 uppercase">
                  {activeCategory ? t(activeCategory.shortLabel) : null}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-3xl">
                  {query ? `${t("Results for")} “${query}”` : activeCategory ? t(activeCategory.label) : null}
                </h2>
                {!query && activeCategory ? (
                  <p className="mt-2 text-[12px] leading-5 text-ink-500">
                    {t(activeCategory.description)}
                  </p>
                ) : null}
              </div>
              <p aria-live="polite" className="font-display text-[11px] font-medium text-ink-400">
                {filtered.length} {t(filtered.length === 1 ? "answer" : "answers")}
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="mt-3 divide-y divide-ink-100 border-b border-ink-100">
                {filtered.map((faq, index) => (
                  <FaqItem
                    key={faq.id}
                    faq={faq}
                    number={index + 1}
                    open={openId === faq.id}
                    onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                    translate={t}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 grid min-h-64 place-items-center rounded-[1.5rem] border border-dashed border-ink-200 bg-white px-6 text-center">
                <div>
                  <Search className="mx-auto size-7 text-ink-300" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink-800">
                    {t("No matching answer yet")}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-5 text-ink-400">
                    {t("Try another term or send your question to the AAAA team below.")}
                  </p>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mt-5 min-h-10 cursor-pointer rounded-full bg-crimson-600 px-5 font-display text-[12px] font-semibold text-white transition-colors hover:bg-crimson-700"
                  >
                    {t("View every question")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  faq,
  number,
  open,
  onToggle,
  translate,
}: {
  faq: PatientFaq;
  number: number;
  open: boolean;
  onToggle: () => void;
  translate: (source: string) => string;
}) {
  return (
    <article className="scroll-mt-28">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`answer-${faq.id}`}
          className="group flex w-full cursor-pointer items-start gap-4 py-5 text-start sm:gap-5 sm:py-6"
        >
          <span className={`mt-0.5 font-display text-[10px] font-semibold tracking-[0.12em] ${open ? "text-crimson-600" : "text-ink-300"}`}>
            {String(number).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 font-display text-[16px] font-semibold leading-6 tracking-[-0.015em] text-ink-950 transition-colors group-hover:text-jade-800 sm:text-[18px] sm:leading-7">
            {translate(faq.question)}
          </span>
          <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border transition-[transform,border-color,background-color,color] duration-300 ${open ? "rotate-180 border-jade-700 bg-jade-700 text-white" : "border-ink-150 bg-white text-ink-500 group-hover:border-jade-300 group-hover:text-jade-700"}`}>
            <ChevronDown className="size-4" />
          </span>
        </button>
      </h3>

      <div
        id={`answer-${faq.id}`}
        aria-hidden={!open}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-7 ps-9 pe-1 sm:ps-[3.75rem] sm:pe-12">
            <div className={`border-s-2 ps-4 sm:ps-5 ${faq.urgent ? "border-crimson-300" : "border-jade-200"}`}>
              {faq.answer.map((paragraph) => (
                <p key={paragraph} className="mt-3 first:mt-0 text-[13px] leading-6 text-ink-600 sm:text-[13.5px]">
                  {translate(paragraph)}
                </p>
              ))}
              {faq.sourceHref && faq.sourceLabel ? (
                <a
                  href={faq.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group/source mt-4 inline-flex cursor-pointer items-center gap-1.5 font-display text-[10.5px] font-semibold text-jade-700 transition-colors hover:text-jade-900"
                >
                  {translate(faq.sourceLabel)}
                  <ExternalLink className="size-3 transition-transform group-hover/source:-translate-y-0.5 group-hover/source:translate-x-0.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AskAQuestion() {
  const { t } = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [state, formAction, pending] = useActionState<SubmissionState, FormData>(
    submitPatientQuestionAction,
    { success: false, message: "" },
  );

  return (
    <section id="ask-a-question" className="bg-white py-14 sm:py-18 lg:py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-ink-900 bg-[#07131f] text-white">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(193,2,48,0.24),transparent_32%),radial-gradient(circle_at_92%_85%,rgba(0,149,59,0.2),transparent_34%)]" />
          <div aria-hidden className="absolute -end-36 -top-52 size-[34rem] rounded-full border border-white/8" />
          <div aria-hidden className="absolute -end-14 -top-28 size-80 rounded-full border border-jade-300/10" />

          <div className="relative grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="p-7 sm:p-9 lg:p-11">
              <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-jade-300 uppercase">
                {t("Ask the AAAA Group")}
              </p>
              <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl">
                {t("Still looking for an answer?")}
              </h2>
              <p className="mt-5 max-w-md text-[13px] leading-6 text-sky-50/58">
                {t("Send a general patient-education question to the team managing this page. Please do not include medical records, identification numbers, or other sensitive health information.")}
              </p>

              <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-[11.5px] leading-5 text-sky-50/55">
                <span className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-jade-300" />
                  {t("Questions may help shape future patient FAQs.")}
                </span>
                <span className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-jade-300" />
                  {t("This service cannot diagnose or provide emergency care.")}
                </span>
              </div>
            </div>

            <form
              className="border-t border-white/10 bg-white/[0.045] p-7 sm:p-9 lg:border-s lg:border-t-0 lg:p-11"
              action={formAction}
            >
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" optional>
                  <input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    className={formInputClassName}
                    placeholder={t("How should we address you?")}
                  />
                </Field>
                <Field label="Email address" optional>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className={formInputClassName}
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Your question">
                  <textarea
                    name="question"
                    required
                    rows={6}
                    value={question}
                    onChange={(event) => {
                      setQuestion(event.target.value);
                    }}
                    className={`${formInputClassName} min-h-36 resize-y py-3`}
                    placeholder={t("What would you like the AAAA team to explain?")}
                  />
                </Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-[10.5px] leading-5 text-sky-50/40">
                  {t("Your question is sent to the team managing this page.")}
                </p>
                <button
                  type="submit"
                  disabled={pending || state.success}
                  className="group inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-jade-500 px-5 font-display text-[12.5px] font-semibold text-white transition-colors hover:bg-jade-400 disabled:cursor-wait disabled:opacity-60"
                >
                  <Mail className="size-4" />
                  {pending ? t("Sending…") : state.success ? t("Question sent") : t("Ask the AAAA team")}
                  <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {state.message ? (
                <p aria-live="polite" className={`mt-4 rounded-xl border px-4 py-3 text-[11px] leading-5 ${state.success ? "border-jade-300/20 bg-jade-300/10 text-jade-100" : "border-crimson-300/25 bg-crimson-400/10 text-crimson-100"}`}>
                  {t(state.message)}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  return (
    <label className="mt-4 block first:mt-0 sm:mt-0">
      <span className="mb-2 flex items-center justify-between gap-3 font-display text-[10px] font-semibold tracking-[0.12em] text-white/72 uppercase">
        {t(label)}
        {optional ? (
          <span className="font-normal tracking-normal text-white/30 normal-case">{t("Optional")}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function SourceLink({ label, href }: { label: string; href: string }) {
  const { t } = useTranslations();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 font-display text-[11px] font-semibold text-ink-600 transition-colors hover:border-jade-200 hover:text-jade-800"
    >
      <span>{t(label)}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-ink-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-jade-600" />
    </a>
  );
}
