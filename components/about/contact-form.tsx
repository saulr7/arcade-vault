"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendContactMessage } from "@/app/about/actions";

const EMPTY = { name: "", email: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const set = (key: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setShake(true);
      clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }

    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await sendContactMessage(formData);
      if (result.ok) setSent(result.name);
      else setError(result.error);
    });
  };

  const reset = () => {
    setSent(null);
    setError(null);
    setForm(EMPTY);
  };

  if (sent !== null) {
    return (
      <div className="terminal-success" role="status">
        <div className="term-bar">
          <span className="dot r"></span>
          <span className="dot y"></span>
          <span className="dot g"></span>
          <span className="term-title">VAULT-OS // TERMINAL</span>
        </div>
        <div className="term-body">
          <div className="line">
            <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
          </div>
          <div className="line dim">[OK] Connecting to server…</div>
          <div className="line dim">[OK] Validating content…</div>
          <div className="line dim">[OK] Transmitting packet…</div>
          <div className="line success">
            &gt; MESSAGE RECEIVED. WE&apos;LL GET BACK TO YOU SOON. THANKS, {sent.toUpperCase()}.
            <span className="caret">_</span>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn ghost" type="button" onClick={reset}>
              SEND ANOTHER MESSAGE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`contact-form${shake ? " shake" : ""}`}
      onSubmit={onSubmit}
      noValidate
    >
      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={80}
          placeholder="Player One"
          value={form.name}
          onChange={set("name")}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          maxLength={2000}
          placeholder="Tell us what's on your mind…"
          value={form.message}
          onChange={set("message")}
        />
      </div>

      {/* Honeypot: hidden from people and assistive tech, must stay empty */}
      <div className="contact-hp" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="contact-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="btn xl press"
        type="submit"
        disabled={pending}
        style={{ width: "100%" }}
      >
        {pending ? "SENDING…" : "▶ SEND MESSAGE"}
      </button>
    </form>
  );
}
