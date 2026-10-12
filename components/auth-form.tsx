"use client";

import Link from "next/link";
import { useState } from "react";

export function AuthForm() {
  const [tab, setTab] = useState<"in" | "up">("in");

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

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === "in" ? "on" : ""}
            onClick={() => setTab("in")}
          >
            SIGN IN
          </button>
          <button
            type="button"
            className={tab === "up" ? "on" : ""}
            onClick={() => setTab("up")}
          >
            CREATE ACCOUNT
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label>Username</label>
            <input placeholder="px_kai" />
          </div>
          {tab === "up" && (
            <div className="field slide-in">
              <label>Email</label>
              <input type="email" placeholder="player@vault.gg" />
            </div>
          )}
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button
            className="btn lg"
            type="submit"
            style={{ width: "100%", marginTop: 8 }}
          >
            {tab === "in" ? "ENTER THE VAULT" : "CREATE & PLAY"}
          </button>
        </form>

        <Link
          href="/games"
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
        >
          PLAY AS GUEST
        </Link>

        <div className="auth-divider">OR CONTINUE WITH</div>
        <div className="social">
          <button className="btn ghost" type="button">
            ◆ GOOGLE
          </button>
          <button className="btn ghost" type="button">
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
