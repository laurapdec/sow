"use client";

import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import Link from "next/link";
import type { Place } from "@teko/db/types";
import styles from "./MapView.module.css";

const CATEGORY_COLOR: Record<string, string> = {
  business: "#14b8a6",   // teal
  service: "#a855f7",    // purple
  garden: "#22c55e",     // green
  hub: "#f59e0b",        // amber
  skillshare: "#f97316", // coral
};

export default function MapView({ places }: { places: Place[] }) {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <div className={styles.root}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: -73.944, latitude: 40.678, zoom: 13 }}
        style={{ width: "100%", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            longitude={Number(place.longitude)}
            latitude={Number(place.latitude)}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(place);
            }}
          >
            <div
              className={styles.pin}
              style={{
                backgroundColor:
                  CATEGORY_COLOR[place.category] ?? "#888",
              }}
            />
          </Marker>
        ))}
      </Map>

      {selected && (
        <aside className={styles.panel}>
          <button
            className={styles.close}
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            ✕
          </button>

          <span className={styles.category}>{selected.category}</span>
          <h2 className={styles.name}>{selected.name}</h2>
          {selected.address && (
            <p className={styles.address}>{selected.address}</p>
          )}

          <div className={styles.tags}>
            {selected.ownership_types.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>

          {selected.description && (
            <p className={styles.description}>{selected.description}</p>
          )}

          <div className={styles.externalLinks}>
            {selected.website && (
              <a
                href={selected.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </a>
            )}
            {selected.instagram && (
              <a
                href={`https://instagram.com/${selected.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </div>

          <Link href={`/map/${selected.id}`} className={styles.fullDetail}>
            See full details →
          </Link>
        </aside>
      )}

      <Link href="/submit" className={styles.addButton}>
        + Add a place
      </Link>
    </div>
  );
}
