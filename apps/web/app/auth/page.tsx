'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import styles from './auth.module.css';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const NEIGHBORHOODS = Array.from(new Set([
  'Allerton', 'Annadale', 'Arden Heights', 'Arlington', 'Arrochar', 'Arverne',
  'Astoria', 'Astoria Heights', 'Auburndale', 'Bath Beach', 'Bathgate',
  'Bay Ridge', 'Bay Terrace', 'Baychester', 'Bayside', 'Bayswater',
  'Bedford Park', 'Bedford Stuyvesant', 'Beechhurst', 'Beekman Place',
  'Belle Harbor', 'Bellaire', 'Bellerose', 'Belmont', 'Bensonhurst',
  'Bergen Beach', 'Blissville', 'Bloomfield', 'Boerum Hill', 'Borough Park',
  'Breezy Point', 'Briarwood', 'Brighton Beach', 'Broad Channel', 'Broadway Junction',
  'Bronx Park South', 'Bronx River', 'Bronxdale', 'Brooklyn Heights', 'Brookville',
  'Brownsville', 'Bulls Head', 'Bushwick', 'Butler Manor', 'Cambria Heights',
  'Canarsie', 'Carnegie Hill', 'Carroll Gardens', 'Castle Hill', 'Castleton Corners',
  'Charleston', 'Chelsea', 'Chinatown', 'City Island', 'City Line',
  'Civic Center', 'Claremont Village', 'Clason Point', 'Clearview', 'Clifton',
  'Clinton', 'Clinton Hill', 'Co-op City', 'Cobble Hill', 'College Point',
  'Concord', 'Concourse', 'Concourse Village', 'Coney Island', 'Country Club',
  'Crown Heights', 'Cypress Hills', 'Ditmas Park', 'Dongan Hills', 'Douglaston',
  'Downtown', 'DUMBO', 'Dutch Kills', 'Dyker Heights', 'East Elmhurst',
  'East Flatbush', 'East Harlem', 'East New York', 'East Tremont', 'East Village',
  'East Williamsburg', 'Eastchester', 'Edenwald', 'Edgemere', 'Edgewater Park',
  'Egbertville', 'Elm Park', 'Elmhurst', 'Eltingville', 'Emerson Hill',
  'Far Rockaway', 'Farragut', 'Fieldston', 'Financial District', 'Flatbush',
  'Flatlands', 'Flatiron', 'Floral Park', 'Flushing', 'Flushing (Downtown)',
  'Fordham', 'Forest Hills', 'Forest Hills Gardens', 'Fort Greene', 'Fort Hamilton',
  'Fox Hills', 'Fresh Meadows', 'Fulton Ferry', 'Georgetown', 'Gerritsen Beach',
  'Glen Oaks', 'Glendale', 'Gramercy', 'Graniteville', 'Grasmere',
  'Grant City', 'Gravesend', 'Great Kills', 'Greenpoint', 'Greenridge',
  'Greenwich Village', 'Grymes Hill', 'Hamilton Heights', 'Hammels', 'Harlem (Central)',
  'Heartland Village', 'Herald Square', 'High Bridge', 'Highland Park', 'Hillcrest',
  'Hollis', 'Holliswood', 'Homecrest', 'Howard Beach', 'Howland Hook',
  'Hudson Square', 'Huguenot', 'Hunters Point', 'Hunts Point', 'Inwood',
  'Jackson Heights', 'Jamaica', 'Jamaica Center', 'Jamaica Estates', 'Jamaica Hills',
  'Kensington', 'Kew Gardens', 'Kew Gardens Hills', 'Kings Highway', 'Kingsbridge',
  'Kingsbridge Heights', 'Laurelton', 'Lefrak City', 'Lenox Hill', 'Lighthouse Hill',
  'Lincoln Square', 'Lindenwood', 'Little Italy', 'Little Neck', 'Livingston',
  'Long Island City', 'Longwood', 'Lower East Side', 'Malba', 'Manhattan Beach',
  'Manhattan Terrace', 'Manhattan Valley', 'Manhattanville', 'Manor Heights', 'Mapleton',
  'Marble Hill', "Mariner's Harbor", 'Marine Park', 'Maspeth', 'Melrose',
  'Middle Village', 'Midland Beach', 'Midtown', 'Midtown South', 'Midwood',
  'Mill Basin', 'Mill Island', 'Morningside Heights', 'Morris Heights', 'Morris Park',
  'Morrisania', 'Mott Haven', 'Mount Eden', 'Mount Hope', 'Murray Hill',
  'Navy Yard', 'Neponsit', 'New Brighton', 'New Dorp', 'New Dorp Beach',
  'New Hyde Park', 'New Lots', 'New Springville', 'NoHo', 'Norwood',
  'North Corona', 'North Riverdale', 'North Side', 'Oakland Gardens', 'Oakwood',
  'Ocean Hill', 'Ocean Parkway', 'Old Place', 'Old Town', 'Olinville',
  'Ozone Park', 'Paerdegat Basin', 'Park Hill', 'Park Slope', 'Parkchester',
  'Pelham Bay', 'Pelham Gardens', 'Pelham Parkway', 'Pleasant Plains', 'Plum Beach',
  'Pomonok', 'Port Ivory', 'Port Morris', 'Port Richmond', "Prince's Bay",
  'Prospect Heights', 'Prospect Lefferts Gardens', 'Prospect Park South',
  'Queens Village', 'Queensboro Hill', 'Randall Manor', 'Ravenswood', 'Red Hook',
  'Rego Park', 'Remsen Village', 'Richmond Hill', 'Richmond Town', 'Richmond Valley',
  'Ridgewood', 'Riverdale', 'Rochdale', 'Rockaway Park', 'Roosevelt Island',
  'Rosebank', 'Rosedale', 'Rossville', 'Roxbury', 'Rugby', 'Sandy Ground',
  'Schuylerville', 'Sea Gate', 'Seaside', 'Sheepshead Bay', 'Shore Acres',
  'Silver Lake', 'SoHo', 'Somerville', 'Soundview', 'South Beach',
  'South Corona', 'South Jamaica', 'South Ozone Park', 'South Side', 'South Village',
  'Spring Creek', 'Springfield Gardens', 'Spuyten Duyvil', 'St. Albans', 'St. George',
  'Stapleton', 'Starrett City', 'Steinway', 'Stuyvesant Heights', 'Stuyvesant Town',
  'Sunnyside', 'Sunnyside Gardens', 'Sunset Park', 'Sutton Place', 'Throgs Neck',
  'Times Square', 'Todt Hill', 'Tompkins Park North', 'Tompkinsville', 'Tottenville',
  'Travis', 'Tribeca', 'Tudor City', 'Turtle Bay', 'Union Square',
  'Unionport', 'University Heights', 'Upper East Side', 'Upper West Side', 'Utopia',
  'Van Nest', 'Vinegar Hill', 'Wakefield', 'Wall Street', 'Ward Hill',
  'Washington Heights', 'Weeksville', 'West Brighton', 'West Farms', 'West Village',
  'Westchester Square', 'Westerleigh', 'Whitestone', 'Williamsbridge', 'Williamsburg',
  'Willowbrook', 'Windsor Terrace', 'Wingate', 'Woodhaven', 'Woodlawn',
  'Woodrow', 'Woodside', 'Yorkville',
])).sort();

const STARS = [
  { top: '8%',  left: '12%', delay: '0s',   size: 6 },
  { top: '15%', left: '82%', delay: '0.7s', size: 8 },
  { top: '6%',  left: '55%', delay: '1.2s', size: 5 },
  { top: '22%', left: '5%',  delay: '0.3s', size: 7 },
  { top: '11%', left: '70%', delay: '1.8s', size: 5 },
  { top: '28%', left: '92%', delay: '0.9s', size: 6 },
];

const SEEDLING_POSITIONS = [8, 18, 32, 48, 63, 76, 87, 94];

type Mode = 'join' | 'signin';
type Errors = Partial<Record<string, string>>;

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('join');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const neighborhoodRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (neighborhoodRef.current && !neighborhoodRef.current.contains(e.target as Node)) {
        setNeighborhoodOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredNeighborhoods = useMemo(() => {
    const q = neighborhoodSearch.trim().toLowerCase();
    if (!q) return NEIGHBORHOODS;
    return NEIGHBORHOODS.filter(n => n.toLowerCase().includes(q));
  }, [neighborhoodSearch]);

  const toggleNeighborhood = (n: string) => {
    setNeighborhoods(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    );
  };

  const seedlingOffsets = useMemo(
    () => SEEDLING_POSITIONS.map(() => Math.floor(Math.random() * 3)),
    []
  );

  const validate = (): Errors => {
    const e: Errors = {};
    if (mode === 'join' && !name.trim()) e.name = 'What should we call you?';
    if (!email.trim()) e.email = 'We need an email to reach you.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "That email doesn't look quite right.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: mode === 'join' ? { name, neighborhoods } : undefined,
        },
      });
      if (error) setErrors({ form: error.message });
      else setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setSent(false);
  };

  return (
    <div className={styles.container}>

      {/* Twinkling stars */}
      <div className={styles.stars}>
        {STARS.map((s, i) => (
          <div
            key={i}
            className={styles.star}
            style={{ top: s.top, left: s.left, animationDelay: s.delay, width: s.size, height: s.size }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <h1 className={`${styles.wordmark} ${styles.fadeIn}`}>SOW</h1>
      <p className={`${styles.tagline} ${styles.fadeIn}`}>
        Sharing Our Wealth - Because abundance is in community.
      </p>

      {/* Auth card */}
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'join' ? styles.active : ''}`}
            onClick={() => switchMode('join')}
          >
            Join
          </button>
          <button
            className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
        </div>

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>🌱</div>
            <p>Check your email — a magic link is on its way.</p>
          </div>
        ) : (
          <>
            <p className={styles.heading}>
              {mode === 'join' ? 'Join your community' : 'Welcome home'}
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              {mode === 'join' && (
                <div className={styles.field}>
                  <label className={styles.label}>Your name</label>
                  <input
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    type="text"
                    placeholder="How should we call you?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {mode === 'join' && (
                <div className={styles.field}>
                  <label className={styles.label}>Where do your roots thrive? (optional)</label>
                  <div className={styles.neighborhoodWrap} ref={neighborhoodRef}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Search neighborhoods…"
                      value={neighborhoodSearch}
                      onChange={e => { setNeighborhoodSearch(e.target.value); setNeighborhoodOpen(true); }}
                      onFocus={() => setNeighborhoodOpen(true)}
                      autoComplete="off"
                    />
                    {neighborhoodOpen && filteredNeighborhoods.length > 0 && (
                      <div className={styles.neighborhoodDropdown}>
                        {filteredNeighborhoods.map(n => (
                          <button
                            key={n}
                            type="button"
                            className={`${styles.neighborhoodOption} ${neighborhoods.includes(n) ? styles.neighborhoodSelected : ''}`}
                            onMouseDown={e => { e.preventDefault(); toggleNeighborhood(n); }}
                          >
                            {n}
                            {neighborhoods.includes(n) && <span className={styles.checkmark}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {neighborhoods.length > 0 && (
                      <div className={styles.chips}>
                        {neighborhoods.map(n => (
                          <span key={n} className={styles.chip}>
                            {n}
                            <button
                              type="button"
                              className={styles.chipRemove}
                              onClick={() => toggleNeighborhood(n)}
                              aria-label={`Remove ${n}`}
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {errors.form && <span className={styles.errorText}>{errors.form}</span>}

              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? 'One moment…' : 'Send magic link'}
              </button>


              <div className={styles.divider}>or</div>

              <button type="button" className={styles.btnGoogle} onClick={signInWithGoogle}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </>
        )}
      </div>

      {/* Subtle seedling silhouettes at the bottom */}
      <div className={styles.seedlings}>
        {SEEDLING_POSITIONS.map((left, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/seedling.webp"
            alt=""
            className={styles.seedlingDecor}
            style={{ left: `${left}%`, height: `${44 + seedlingOffsets[i] * 10}px` }}
          />
        ))}
      </div>
    </div>
  );
}
