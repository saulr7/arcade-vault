"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthResult = { ok: false; error: string };

const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt ignores anything beyond 72 bytes

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";
const INVALID_CREDENTIALS = "Invalid email or password.";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Passwords are never trimmed: leading/trailing spaces are valid characters.
function rawField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validateEmail(email: string): string | null {
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  }
  if (password.length > MAX_PASSWORD) {
    return `Password must be ${MAX_PASSWORD} characters or fewer.`;
  }
  return null;
}

export async function signIn(
  _prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const email = field(formData, "email");
  const password = rawField(formData, "password");

  if (!email || !password) {
    return { ok: false, error: "Please enter your email and password." };
  }
  // Wrong-format input gets the same generic message as wrong credentials.
  if (validateEmail(email)) {
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth] Sign in failed:", error.code ?? error.message);
    const isCredentials =
      error.code === "invalid_credentials" || error.status === 400;
    return { ok: false, error: isCredentials ? INVALID_CREDENTIALS : GENERIC_ERROR };
  }

  redirect("/games");
}

export async function signUp(
  _prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const username = field(formData, "username");
  const email = field(formData, "email");
  const password = rawField(formData, "password");

  if (!username || !email || !password) {
    return { ok: false, error: "Please fill in your username, email and password." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "Username must be 3–16 characters: letters, numbers or underscores.",
    };
  }
  const emailError = validateEmail(email);
  if (emailError) return { ok: false, error: emailError };
  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  const supabase = await createClient();

  // Friendly pre-check. Usernames are unique case-insensitively. In ILIKE, `_` is a
  // single-character wildcard, so it is escaped to match literally.
  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username.replace(/_/g, "\\_"))
    .limit(1);

  if (lookupError) {
    console.error("[auth] Username lookup failed:", lookupError.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (existing.length > 0) {
    return { ok: false, error: "That username is already taken." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    console.error("[auth] Sign up failed:", error.code ?? error.message);
    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        return { ok: false, error: "An account with that email already exists." };
      case "weak_password":
        return { ok: false, error: "That password is too weak. Try a longer one." };
      case "email_address_invalid":
        return { ok: false, error: "Please enter a valid email address." };
      case "over_request_rate_limit":
      case "over_email_send_rate_limit":
        return { ok: false, error: "Too many attempts. Please wait a bit and try again." };
      case "unexpected_failure":
        // The profile trigger failed. After the pre-check, the likeliest cause is
        // another sign-up claiming the same username a moment earlier.
        return { ok: false, error: "That username may have just been taken. Try another." };
      default:
        return { ok: false, error: GENERIC_ERROR };
    }
  }

  if (!data.session) {
    // "Confirm email" is still enabled in the dashboard, so no session was created.
    console.error("[auth] Sign up returned no session. Is 'Confirm email' disabled?");
    return { ok: false, error: GENERIC_ERROR };
  }

  redirect("/games");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] Sign out failed:", error.message);
  }
  redirect("/");
}
