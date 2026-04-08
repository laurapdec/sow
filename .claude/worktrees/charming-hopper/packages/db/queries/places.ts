import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Place, PlaceInsert, PlaceWithSubmitter } from "../types.js";

type DB = SupabaseClient<Database>;

export async function getApprovedPlaces(db: DB): Promise<Place[]> {
  const { data, error } = await db
    .from("places")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPlaceById(db: DB, id: string): Promise<Place | null> {
  const { data, error } = await db
    .from("places")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function submitPlace(db: DB, place: PlaceInsert): Promise<Place> {
  const { data, error } = await db
    .from("places")
    .insert(place)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingPlaces(db: DB): Promise<PlaceWithSubmitter[]> {
  const { data, error } = await db
    .from("places")
    .select("*, profiles:submitted_by(username, display_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as PlaceWithSubmitter[];
}

export async function updatePlaceStatus(
  db: DB,
  id: string,
  status: "approved" | "rejected",
  rejection_reason?: string
): Promise<void> {
  const { error } = await db
    .from("places")
    .update({ status, rejection_reason: rejection_reason ?? null })
    .eq("id", id);
  if (error) throw error;
}
