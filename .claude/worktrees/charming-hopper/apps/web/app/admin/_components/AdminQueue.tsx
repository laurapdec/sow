"use client";

import { useState } from "react";
import { approvePlace, rejectPlace } from "../actions";
import type { PlaceWithSubmitter } from "@teko/db/types";
import styles from "../admin.module.css";

export default function AdminQueue({
  initialPlaces,
}: {
  initialPlaces: PlaceWithSubmitter[];
}) {
  const [places, setPlaces] = useState(initialPlaces);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id);
    await approvePlace(id);
    setPlaces((p) => p.filter((place) => place.id !== id));
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id);
    await rejectPlace(id, rejectReason);
    setPlaces((p) => p.filter((place) => place.id !== id));
    setRejecting(null);
    setRejectReason("");
    setLoading(null);
  }

  if (places.length === 0) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Admin queue</h1>
        <p className={styles.empty}>No pending submissions.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        Admin queue{" "}
        <span className={styles.count}>{places.length}</span>
      </h1>

      <div className={styles.list}>
        {places.map((place) => (
          <div key={place.id} className={styles.card}>
            <div className={styles.meta}>
              <span className={styles.category}>{place.category}</span>
              <span className={styles.submitter}>
                submitted by{" "}
                {place.profiles?.display_name ??
                  place.profiles?.username ??
                  "unknown"}
              </span>
            </div>

            <h2 className={styles.name}>{place.name}</h2>
            {place.address && (
              <p className={styles.address}>{place.address}</p>
            )}

            <div className={styles.tags}>
              {place.ownership_types.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>

            {place.description && (
              <p className={styles.description}>{place.description}</p>
            )}

            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {place.website}
              </a>
            )}

            {rejecting === place.id ? (
              <div className={styles.rejectForm}>
                <textarea
                  placeholder="Reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={styles.rejectInput}
                  rows={2}
                />
                <div className={styles.actions}>
                  <button
                    onClick={() => handleReject(place.id)}
                    disabled={loading === place.id}
                    className={styles.rejectConfirm}
                  >
                    {loading === place.id ? "Rejecting…" : "Confirm reject"}
                  </button>
                  <button
                    onClick={() => {
                      setRejecting(null);
                      setRejectReason("");
                    }}
                    className={styles.cancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <button
                  onClick={() => handleApprove(place.id)}
                  disabled={loading === place.id}
                  className={styles.approve}
                >
                  {loading === place.id ? "…" : "Approve"}
                </button>
                <button
                  onClick={() => setRejecting(place.id)}
                  className={styles.reject}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
