"use server";

import { revalidatePath } from "next/cache";

import { createInboxRecordAsync, subscribeInboxEmailAsync } from "@/lib/inbox-repository";

export type SubmissionState = { success: boolean; message: string; submissionId?: string };

const initialFailure: SubmissionState = { success: false, message: "Please check the form and try again." };

export async function submitContactEnquiryAction(_previous: SubmissionState, formData: FormData): Promise<SubmissionState> {
  if (isBot(formData)) return { success: true, message: "Thank you. Your enquiry has been received." };
  const email = validEmail(formData.get("email"));
  const fullName = required(formData, "fullName", 160);
  const subject = required(formData, "subject", 240);
  const message = required(formData, "message", 8000);
  const country = required(formData, "country", 120);
  const role = required(formData, "role", 160);
  const enquiryType = required(formData, "enquiryType", 180);
  if (!email) return { success: false, message: "Enter a valid email address." };
  if (!fullName || !subject || !message || !country || !role || !enquiryType || formData.get("consent") !== "yes") return initialFailure;
  try {
    const record = await createInboxRecordAsync({
      kind: "contact", status: "unread", name: fullName, email,
      phone: value(formData, "phone", 80), country,
      role, organisation: value(formData, "organisation", 200),
      enquiryType, subject, message,
      source: "Contact Us form", consent: true,
    });
    revalidateInbox(record.id);
    return { success: true, message: "Thank you. Your enquiry has been sent to the ArLAR Secretariat.", submissionId: record.id };
  } catch (error) {
    return submissionFailure("contact", error);
  }
}

export async function submitPatientQuestionAction(_previous: SubmissionState, formData: FormData): Promise<SubmissionState> {
  if (isBot(formData)) return { success: true, message: "Thank you. Your question has been received." };
  const question = required(formData, "question", 8000);
  const suppliedEmail = value(formData, "email", 240);
  const email = suppliedEmail ? validEmail(suppliedEmail) : "";
  if (!question || (suppliedEmail && !email)) return initialFailure;
  try {
    const record = await createInboxRecordAsync({
      kind: "question", status: "unread", name: value(formData, "name", 160), email,
      phone: "", country: "", role: "Member of the public", organisation: "",
      enquiryType: "Public and patient question", subject: "Question for the AAAA Group",
      message: question, source: "For Public & Patients form", consent: true,
    });
    revalidateInbox(record.id);
    return { success: true, message: "Thank you. Your question has been sent to the team managing this page.", submissionId: record.id };
  } catch (error) {
    return submissionFailure("patient-question", error);
  }
}

export async function subscribeToMailingListAction(_previous: SubmissionState, formData: FormData): Promise<SubmissionState> {
  if (isBot(formData)) return { success: true, message: "You are subscribed." };
  const email = validEmail(formData.get("email"));
  if (!email) return { success: false, message: "Enter a valid email address." };
  let record: Awaited<ReturnType<typeof subscribeInboxEmailAsync>>;
  try {
    record = await subscribeInboxEmailAsync(email);
    revalidateInbox(record.id);
  } catch (error) {
    return submissionFailure("newsletter", error);
  }
  return { success: true, message: "You’re subscribed to ArLAR updates.", submissionId: record.id };
}

function revalidateInbox(id: string) {
  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${id}`);
}

function isBot(formData: FormData) { return Boolean(String(formData.get("website") || "").trim()); }
function value(formData: FormData, name: string, max: number) { return String(formData.get(name) || "").trim().slice(0, max); }
function required(formData: FormData, name: string, max: number) { return value(formData, name, max); }
function validEmail(input: FormDataEntryValue | null) {
  const email = String(input || "").trim().toLowerCase().slice(0, 240);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function submissionFailure(scope: string, error: unknown): SubmissionState {
  const detail = error instanceof Error
    ? { name: error.name, message: error.message, cause: error.cause }
    : { message: String(error) };
  console.error(`[public-form:${scope}] Supabase submission failed`, detail);
  return {
    success: false,
    message: "We couldn't send this right now. Please wait a moment and try again.",
  };
}
