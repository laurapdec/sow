import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Profile, ProfileUpdate } from "../types.js";

type DB = SupabaseClient<Database>;

export async function getProfile(db: DB, id: string): Promise<Profile | null> {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function updateProfile(
  db: DB,
  id: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await db
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
