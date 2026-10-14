"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signIn, signUp } from "@/app/auth/actions";

type Mode = "in" | "up";

export function AuthForm() {
  const [tab, setTab] = useState<Mode>("in");

  return (
    <div className="av-auth-wrap fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="mark"></div>
          <h2 className="neon-cyan">ARCADE VAULT</h2>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.16em",
              marginTop: 6,
            }}
          >
            SYSTEM ACCESS · v2.6
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "in"}
            className={tab === "in" ? "on" : ""}
            onClick={() => setTab("in")}
          >
            SIGN IN
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "up"}
            className={tab === "up" ? "on" : ""}
            onClick={() => setTab("up")}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Remounting per tab gives each mode its own action state and error. */}
        <CredentialsForm key={tab} mode={tab} />

        <Link
          href="/games"
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
        >
          PLAY AS GUEST
        </Link>

        <div className="auth-divider">OR CONTINUE WITH</div>
        <div className="social">
          <button className="btn ghost" type="button" disabled>
            ◆ GOOGLE
          </button>
          <button className="btn ghost" type="button" disabled>
            ▣ GITHUB
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: 11,
            color: "var(--ink-faint)",
            letterSpacing: "0.1em",
          }}
        >
          BY ENTERING YOU ACCEPT THE ARCADE HALL TERMS
        </div>
      </div>
    </div>
  );
}

function CredentialsForm({ mode }: { mode: Mode }) {
  const isSignUp = mode === "up";
  const [state, formAction, pending] = useActionState(
    isSignUp ? signUp : signIn,
    null,
  );

  // Controlled inputs: React resets uncontrolled forms after an action, which
  // would wipe what the player typed when the server returns an error.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} noValidate>
      {isSignUp && (
        <div className="field slide-in">
          <label htmlFor="auth-username">Username</label>
          <input
            id="auth-username"
            name="username"
            placeholder="px_kai"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            minLength={3}
            maxLength={16}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      )}
      <div className="field">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          name="email"
          type="email"
          placeholder="player@vault.gg"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={isSignUp ? 8 : undefined}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {state?.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}

      <button
        className="btn lg"
        type="submit"
        disabled={pending}
        style={{ width: "100%", marginTop: 8 }}
      >
        {pending
          ? isSignUp
            ? "CREATING…"
            : "ENTERING…"
          : isSignUp
            ? "CREATE & PLAY"
            : "ENTER THE VAULT"}
      </button>
    </form>
  );
}
