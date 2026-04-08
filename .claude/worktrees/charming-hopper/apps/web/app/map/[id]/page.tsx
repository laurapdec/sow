import { createServerClient } from "@teko/db/client.server";
import { getPlaceById } from "@teko/db/queries/places";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./place.module.css";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const place = await getPlaceById(supabase, id);

  if (!place || place.status !== "approved") notFound();

  return (
    <main className={styles.container}>
      <Link href="/map" className={styles.back}>
        ← Back to map
      </Link>

      {place.photos.length > 0 && (
        <div className={styles.photos}>
          {place.photos.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt={place.name} className={styles.photo} />
          ))}
        </div>
      )}

      <div className={styles.content}>
        <span className={styles.category}>{place.category}</span>
        <h1 className={styles.name}>{place.name}</h1>
        {place.address && <p className={styles.address}>{place.address}</p>}

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

        <div className={styles.links}>
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Website ↗
            </a>
          )}
          {place.instagram && (
            <a
              href={`https://instagram.com/${place.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Instagram ↗
            </a>
          )}
        </div>

        <Link href={`/submit?suggest=${place.id}`} className={styles.suggest}>
          ✎ Suggest an edit
        </Link>
      </div>
    </main>
  );
}
