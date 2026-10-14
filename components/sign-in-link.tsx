"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Signed-out state of the nav. Also the Suspense fallback while the session loads.
export function SignInLink({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "desktop") {
    return (
      <Link href="/auth" className="btn auth-btn">
        Sign In
      </Link>
    );
  }
  return (
    <Link href="/auth" className={pathname.startsWith("/auth") ? "active" : ""}>
      Sign In
    </Link>
  );
}
