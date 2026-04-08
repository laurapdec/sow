import { createServerClient } from "@teko/db/client.server";
import { getApprovedPlaces } from "@teko/db/queries/places";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./_components/MapView"), { ssr: false });

export default async function MapPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const places = await getApprovedPlaces(supabase);

  return <MapView places={places} />;
}
