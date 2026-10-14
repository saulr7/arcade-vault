import { cache } from "react";

import { signOut } from "@/app/auth/actions";
import { SignInLink } from "@/components/sign-in-link";
import { createClient } from "@/lib/supabase/server";

// Request-time read (cookies). Callers must render this under <Suspense>.
// cache() dedupes the lookup between the desktop bar and the mobile panel.
const getUsername = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.username ?? "Player";
});

export async function NavAuth({ variant }: { variant: "desktop" | "mobile" }) {
  const username = await getUsername();

  if (!username) return <SignInLink variant={variant} />;

  return (
    <form
      action={signOut}
      className={variant === "desktop" ? "nav-user" : "nav-user-mobile"}
    >
      <span className="nav-username" title={username}>
        {username}
      </span>
      <button type="submit" className="btn ghost">
        SIGN OUT
      </button>
    </form>
  );
}
