"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

// The auth controls are server-rendered (they read the session cookie) and
// passed in as slots, each wrapped in <Suspense> by the layout.
export function Nav({
  desktopAuth,
  mobileAuth,
}: {
  desktopAuth: ReactNode;
  mobileAuth: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const homeActive = pathname === "/";
  const libraryActive = pathname.startsWith("/games");
  const hallActive = pathname.startsWith("/hall-of-fame");
  const aboutActive = pathname.startsWith("/about");
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={homeActive ? "active" : ""}>
            Home
          </Link>
          <Link href="/games" className={libraryActive ? "active" : ""}>
            Library
          </Link>
          <Link href="/hall-of-fame" className={hallActive ? "active" : ""}>
            Hall of Fame
          </Link>
          <Link href="/about" className={aboutActive ? "active" : ""}>
            About
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CREDITS · 03</span>
        </div>
        {desktopAuth}
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menu"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside
        className={"av-mobile-panel" + (open ? " open" : "")}
        onClick={(e) => {
          // Slotted links are server-rendered, so close the panel on any link click.
          if ((e.target as HTMLElement).closest("a")) close();
        }}
      >
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENU
        </div>
        <Link href="/" className={homeActive ? "active" : ""} onClick={close}>
          Home
        </Link>
        <Link href="/games" className={libraryActive ? "active" : ""} onClick={close}>
          Library
        </Link>
        <Link href="/hall-of-fame" className={hallActive ? "active" : ""} onClick={close}>
          Hall of Fame
        </Link>
        <Link href="/about" className={aboutActive ? "active" : ""} onClick={close}>
          About
        </Link>
        {mobileAuth}
        <div style={{ flex: 1 }}></div>
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CREDITS · 03
        </div>
      </aside>
    </>
  );
}
