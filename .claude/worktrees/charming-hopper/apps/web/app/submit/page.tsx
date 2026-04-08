"use client";

import { createWebClient } from "@teko/db/client.web";
import { submitPlace } from "@teko/db/queries/places";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./submit.module.css";

const CATEGORIES = [
  "business",
  "service",
  "garden",
  "hub",
  "skillshare",
] as const;

const OWNERSHIP_OPTIONS = [
  "queer-owned",
  "women-owned",
  "trans-owned",
  "POC-owned",
  "Indigenous-owned",
  "immigrant-owned",
  "refugee-owned",
  "worker-owned cooperative",
  "community-owned cooperative",
  "collectively-run",
  "nonprofit",
  "mutual aid org",
] as const;

type Category = (typeof CATEGORIES)[number];

export default function SubmitPage() {
  const router = useRouter();
  const supabase = createWebClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "business" as Category,
    ownership_types: [] as string[],
    place_values: [] as string[],
    is_cooperative: false,
    cooperative_type: "",
    website: "",
    instagram: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleOwnership(value: string) {
    setForm((f) => ({
      ...f,
      ownership_types: f.ownership_types.includes(value)
        ? f.ownership_types.filter((t) => t !== value)
        : [...f.ownership_types, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.ownership_types.length === 0) {
      setError("Select at least one ownership type.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await submitPlace(supabase, {
        name: form.name,
        description: form.description || null,
        address: form.address || null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        category: form.category,
        ownership_types: form.ownership_types,
        place_values: form.place_values,
        is_cooperative: form.is_cooperative,
        cooperative_type:
          (form.cooperative_type as
            | "worker"
            | "consumer"
            | "producer"
            | "multi-stakeholder"
            | null) || null,
        website: form.website || null,
        instagram: form.instagram || null,
        submitted_by: user.id,
      });

      router.push("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Add a place</h1>
      <p className={styles.subtitle}>
        Submissions are reviewed by the Teko team before appearing on the map.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Name *
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Category *
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className={styles.input}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Description
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="What makes this place part of the community?"
          />
        </label>

        <label className={styles.label}>
          Address
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={styles.input}
            placeholder="123 Main St, Brooklyn, NY"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            Latitude *
            <input
              required
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              className={styles.input}
              placeholder="40.678"
            />
          </label>
          <label className={styles.label}>
            Longitude *
            <input
              required
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              className={styles.input}
              placeholder="-73.944"
            />
          </label>
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            Ownership * — select all that apply
          </legend>
          <div className={styles.checkboxGrid}>
            {OWNERSHIP_OPTIONS.map((o) => (
              <label key={o} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.ownership_types.includes(o)}
                  onChange={() => toggleOwnership(o)}
                />
                {o}
              </label>
            ))}
          </div>
        </fieldset>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.is_cooperative}
            onChange={(e) => set("is_cooperative", e.target.checked)}
          />
          This is a cooperative
        </label>

        {form.is_cooperative && (
          <label className={styles.label}>
            Cooperative type
            <select
              value={form.cooperative_type}
              onChange={(e) => set("cooperative_type", e.target.value)}
              className={styles.input}
            >
              <option value="">— select —</option>
              <option value="worker">Worker cooperative</option>
              <option value="consumer">Consumer cooperative</option>
              <option value="producer">Producer cooperative</option>
              <option value="multi-stakeholder">
                Multi-stakeholder cooperative
              </option>
            </select>
          </label>
        )}

        <label className={styles.label}>
          Website
          <input
            type="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            className={styles.input}
            placeholder="https://"
          />
        </label>

        <label className={styles.label}>
          Instagram
          <input
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            className={styles.input}
            placeholder="@handle"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}
