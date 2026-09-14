"use client";

import { useActionState } from "react";

import { submitContactEnquiryAction, type SubmissionState } from "@/app/submission-actions";
import { ArrowRight, Check, ChevronDown, Close, Mail } from "@/components/icons";
import { arabCountries, otherCountries } from "@/data/contact-countries";
import { useTranslations } from "@/i18n/locale-context";

const enquiryTypes = [
  "General enquiry",
  "Membership and national societies",
  "ArLAR College and education",
  "Congress or event",
  "Scientific collaboration or research",
  "Media and communications",
  "Partnership or sponsorship",
  "Website or technical support",
] as const;

const roles = [
  "Rheumatologist",
  "Other healthcare professional",
  "National society representative",
  "Researcher or academic",
  "Industry or institutional partner",
  "Media representative",
  "Other",
] as const;

const inputClassName =
  "h-12 w-full rounded-xl border border-ink-150 bg-white px-4 font-display text-[13px] text-ink-950 outline-none transition-[border-color,box-shadow] placeholder:text-ink-300 hover:border-ink-300 focus:border-jade-500 focus:shadow-[0_0_0_3px_rgba(0,149,59,0.09)]";

export function ContactForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<SubmissionState, FormData>(
    submitContactEnquiryAction,
    { success: false, message: "" },
  );

  return (
    <form
      className="rounded-[1.8rem] border border-ink-100 bg-white p-5 sm:p-7 lg:p-9"
      action={formAction}
    >
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-col justify-between gap-4 border-b border-ink-100 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-display text-[10px] font-semibold tracking-[0.17em] text-crimson-600 uppercase">
            {t("Send an enquiry")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink-950 sm:text-4xl">
            {t("How can we help?")}
          </h2>
        </div>
        <p className="font-display text-[10px] text-ink-400">
          {t("Fields marked")} <span className="font-semibold text-crimson-600">*</span> {t("are required")}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-jade-100 bg-jade-50/65 px-4 py-3.5">
        <p className="font-display text-[11.5px] font-semibold text-jade-900">
          {t("Organisational enquiries only")}
        </p>
        <p className="mt-1 text-[10.5px] leading-5 text-jade-900/65">
          {t("ArLAR is a professional organisation for the rheumatology community. It does not provide medical advice, diagnoses, treatment, physician referrals, or emergency assistance.")}
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="font-display text-[10px] font-semibold tracking-[0.15em] text-jade-700 uppercase">
          {t("About your enquiry")}
        </legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField label="Enquiry type" name="enquiryType" required>
            <option value="" disabled hidden>{t("Choose a topic")}</option>
            {enquiryTypes.map((type) => (
              <option key={type} value={type}>
                {t(type)}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Subject"
            name="subject"
            required
            placeholder="A short summary of your enquiry"
          />
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-ink-100 pt-7">
        <legend className="font-display text-[10px] font-semibold tracking-[0.15em] text-jade-700 uppercase">
          {t("Your details")}
        </legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Full name"
            name="fullName"
            required
            autoComplete="name"
            placeholder="Your full name"
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            required
            autoComplete="email"
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            placeholder="you@example.com"
          />
          <TextField
            label="Phone number"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Include your country code"
          />
          <SelectField label="Country" name="country" required>
            <option value="" disabled hidden>{t("Select your country")}</option>
            <optgroup label={t("Arab countries")}>
              {arabCountries.map((country) => (
                <option key={country} value={country}>{t(country)}</option>
              ))}
            </optgroup>
            <optgroup label={t("Other countries")}>
              {otherCountries.map((country) => (
                <option key={country} value={country}>{t(country)}</option>
              ))}
            </optgroup>
          </SelectField>
          <SelectField label="I am contacting ArLAR as" name="role" required>
            <option value="" disabled hidden>{t("Select the option that fits best")}</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {t(role)}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Organisation"
            name="organisation"
            autoComplete="organization"
            placeholder="Hospital, society, university, or company"
          />
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-ink-100 pt-3">
        <legend className="font-display text-[10px] font-semibold tracking-[0.15em] text-jade-700 uppercase">
          {t("Your message")}
        </legend>
        <label className="mt-1 block">
          <span className="mb-2 block font-display text-[11px] font-semibold text-ink-700">
            {t("Tell us how we can help")} <span className="text-crimson-600">*</span>
          </span>
          <textarea
            name="message"
            required
            rows={7}
            placeholder={t("Please include the relevant event, programme, organisation, dates, or other details that will help us direct your enquiry.")}
            className={`${inputClassName} min-h-44 resize-y py-3 leading-6`}
          />
        </label>

      </fieldset>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-[#f6f8f7] p-4">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-0.5 size-4 shrink-0 accent-jade-600"
        />
        <span className="text-[11px] leading-5 text-ink-500">
          {t("I understand that this form is for professional and organisational enquiries only and cannot be used to request medical advice or care.")} <span className="font-semibold text-crimson-600">*</span>
        </span>
      </label>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10.5px] leading-5 text-ink-400">
          {t("Your enquiry is sent securely to the ArLAR Secretariat inbox.")}
        </p>
        <button
          type="submit"
          disabled={pending || state.success}
          className="group inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-crimson-600 px-5 font-display text-[12.5px] font-semibold text-white transition-colors hover:bg-crimson-700 disabled:cursor-wait disabled:opacity-60"
        >
          <Mail className="size-4" />
          {pending ? t("Sending…") : state.success ? t("Enquiry sent") : t("Send enquiry")}
          <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {state.message ? (
        <div role={state.success ? "status" : "alert"} aria-live={state.success ? "polite" : "assertive"} className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${state.success ? "border-jade-200 bg-jade-50" : "border-crimson-200 bg-crimson-50"}`}>
          {state.success ? <Check className="mt-0.5 size-4 shrink-0 text-jade-700" /> : <Close className="mt-0.5 size-4 shrink-0 text-crimson-700" />}
          <p className={`text-[11px] leading-5 ${state.success ? "text-jade-900/75" : "text-crimson-900/75"}`}>{t(state.message)}</p>
        </div>
      ) : null}
    </form>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  pattern,
  placeholder,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  autoComplete?: string;
  pattern?: string;
  placeholder: string;
}) {
  const { t } = useTranslations();
  return (
    <label className="block">
      <span className="mb-2 block font-display text-[11px] font-semibold text-ink-700">
        {t(label)} {required ? <span className="text-crimson-600">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        placeholder={t(placeholder)}
        className={inputClassName}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required = false,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  return (
    <label className="relative block">
      <span className="mb-2 block font-display text-[11px] font-semibold text-ink-700">
        {t(label)} {required ? <span className="text-crimson-600">*</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className={`${inputClassName} cursor-pointer appearance-none pe-10`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3.5 bottom-4 size-4 text-ink-400" />
    </label>
  );
}
