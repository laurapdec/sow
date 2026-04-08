export { createWebClient } from "./client.web.js";
export { createServerClient } from "./client.server.js";
export { createAdminClient } from "./client.admin.js";

export type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Place,
  PlaceInsert,
  PlaceUpdate,
  PlaceCategory,
  CooperativeType,
  PlaceWithSubmitter,
} from "./types.js";

export {
  getApprovedPlaces,
  getPlaceById,
  submitPlace,
  getPendingPlaces,
  updatePlaceStatus,
} from "./queries/places.js";

export { getProfile, updateProfile } from "./queries/profiles.js";
