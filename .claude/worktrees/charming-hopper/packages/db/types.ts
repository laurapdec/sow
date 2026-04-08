export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          neighborhood: string | null;
          latitude: number | null;
          longitude: number | null;
          skills: string[];
          languages: string[];
          credit_balance: number;
          subscription_status: "active" | "inactive" | "hardship";
          subscription_amount: number | null;
          is_sustainer: boolean;
          sustainer_since: string | null;
          hardship_waiver: boolean;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          neighborhood?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          skills?: string[];
          languages?: string[];
          credit_balance?: number;
          subscription_status?: "active" | "inactive" | "hardship";
          subscription_amount?: number | null;
          is_sustainer?: boolean;
          sustainer_since?: string | null;
          hardship_waiver?: boolean;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          latitude: number;
          longitude: number;
          category: "business" | "service" | "garden" | "hub" | "skillshare";
          ownership_types: string[];
          place_values: string[];
          is_cooperative: boolean;
          cooperative_type:
            | "worker"
            | "consumer"
            | "producer"
            | "multi-stakeholder"
            | null;
          website: string | null;
          instagram: string | null;
          photos: string[];
          hours: Json | null;
          submitted_by: string | null;
          status: "pending" | "approved" | "rejected";
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          latitude: number;
          longitude: number;
          category: "business" | "service" | "garden" | "hub" | "skillshare";
          ownership_types: string[];
          place_values?: string[];
          is_cooperative?: boolean;
          cooperative_type?:
            | "worker"
            | "consumer"
            | "producer"
            | "multi-stakeholder"
            | null;
          website?: string | null;
          instagram?: string | null;
          photos?: string[];
          hours?: Json | null;
          submitted_by?: string | null;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Insert"]>;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Place = Database["public"]["Tables"]["places"]["Row"];
export type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"];
export type PlaceUpdate = Database["public"]["Tables"]["places"]["Update"];

export type PlaceCategory = Place["category"];
export type CooperativeType = Place["cooperative_type"];

export type PlaceWithSubmitter = Place & {
  profiles: { username: string; display_name: string | null } | null;
};
