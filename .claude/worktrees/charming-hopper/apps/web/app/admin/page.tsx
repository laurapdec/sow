import { createServerClient } from "@teko/db/client.server";
import { getProfile } from "@teko/db/queries/profiles";
import { getPendingPlaces } from "@teko/db/queries/places";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminQueue from "./_components/AdminQueue";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const profile = await getProfile(supabase, user.id);
  if (!profile?.is_admin) redirect("/map");

  const places = await getPendingPlaces(supabase);

  return <AdminQueue initialPlaces={places} />;
}
