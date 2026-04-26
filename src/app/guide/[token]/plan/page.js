import { redirect } from "next/navigation";

export default async function LegacyPlanRedirect({ params }) {
  const { token } = await params;
  redirect(`/plan/${token}`);
}
