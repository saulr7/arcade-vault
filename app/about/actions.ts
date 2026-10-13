"use server";

import { Resend } from "resend";

export type ContactResult = { ok: true; name: string } | { ok: false; error: string };

const MAX_NAME = 80;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR = "We couldn't send your message right now. Please try again in a moment.";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Honeypot: real users never see this field. Pretend success so bots learn nothing.
  if (field(formData, "website") !== "") {
    return { ok: true, name: field(formData, "name") };
  }

  // Newlines are stripped from the name so it can't inject headers via the subject.
  const name = field(formData, "name").replace(/[\r\n]+/g, " ").trim();
  const email = field(formData, "email");
  const message = field(formData, "message");

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in your name, email and message." };
  }
  if (name.length > MAX_NAME) {
    return { ok: false, error: `Name must be ${MAX_NAME} characters or fewer.` };
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (message.length > MAX_MESSAGE) {
    return { ok: false, error: `Message must be ${MAX_MESSAGE} characters or fewer.` };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    const missing = Object.entries({
      RESEND_API_KEY: apiKey,
      CONTACT_TO_EMAIL: to,
      CONTACT_FROM_EMAIL: from,
    })
      .filter(([, value]) => !value)
      .map(([key]) => key);
    console.error(`[contact] Missing environment variables: ${missing.join(", ")}`);
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    if (error) {
      console.error("[contact] Resend rejected the message:", error);
      return { ok: false, error: GENERIC_ERROR };
    }
  } catch (err) {
    console.error("[contact] Failed to send the message:", err);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, name };
}
