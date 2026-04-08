"use client";

import { createWebClient } from "@teko/db/client.web";
import { useState } from "react";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createWebClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Teko</h1>
      <p className={styles.subtitle}>
        Cooperative infrastructure for your community
      </p>

      {sent ? (
        <p className={styles.sent}>
          Check your email — a magic link is on its way.
        </p>
      ) : (
        <>
          <form onSubmit={handleMagicLink} className={styles.form}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.divider}>or</div>

          <button onClick={handleGoogle} className={styles.googleButton}>
            Continue with Google
          </button>
        </>
      )}
    </main>
  );
}
