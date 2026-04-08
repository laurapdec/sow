"use server";

import { createAdminClient } from "@teko/db/client.admin";
import { updatePlaceStatus } from "@teko/db/queries/places";
import { revalidatePath } from "next/cache";

export async function approvePlace(id: string) {
  const supabase = createAdminClient();
  await updatePlaceStatus(supabase, id, "approved");
  revalidatePath("/admin");
}

export async function rejectPlace(id: string, reason: string) {
  const supabase = createAdminClient();
  await updatePlaceStatus(supabase, id, "rejected", reason);
  revalidatePath("/admin");
}
