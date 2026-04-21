/* Backwards-compat redirect: /share/[token] → /guide/[token].
   The primary redirect is in next.config.mjs; this is here as a safety net
   so the route always resolves even if config redirects are bypassed. */
import { redirect } from "next/navigation";

export default async function ShareRedirect({ params }) {
  const { token } = await params;
  redirect(`/guide/${token}`);
}
