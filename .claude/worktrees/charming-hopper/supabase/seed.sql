-- =============================================================
-- TEKO SEED DATA — real Brooklyn/NYC queer & cooperative spaces
-- All places inserted as status='approved', submitted_by=null
-- (seeded directly via service role / local psql, bypasses RLS)
-- =============================================================

insert into public.places (
  name, description, address,
  latitude, longitude,
  category, ownership_types, place_values,
  is_cooperative, cooperative_type,
  website, instagram,
  photos, hours, status
) values

-- ----------------------------------------------------------------
-- 1. The Bush — lesbian bar, Bushwick
-- ----------------------------------------------------------------
(
  'The Bush',
  'A lesbian bar and community gathering spot nestled in Bushwick. Known for its warm, inclusive atmosphere, cheap drinks, pool table, and rotating DJ nights that draw a queer crowd from across the borough. One of the rare dedicated lesbian bars in NYC.',
  '221 Stanhope St, Brooklyn, NY 11237',
  40.7014, -73.9193,
  'business',
  array['queer-owned', 'women-owned'],
  array['LGBTQ+ space', 'nightlife', 'events'],
  false, null,
  'https://thebushbar.com',
  '@thebushbar',
  '{}',
  '{"wed": "6pm–2am", "thu": "6pm–2am", "fri": "6pm–4am", "sat": "3pm–4am", "sun": "3pm–2am"}'::jsonb,
  'approved'
),

-- ----------------------------------------------------------------
-- 2. Park Slope Food Coop — member-owned grocery
-- ----------------------------------------------------------------
(
  'Park Slope Food Coop',
  'One of the largest and oldest member-owned food cooperatives in the United States, founded in 1973. Members work 2¾ hours every four weeks in exchange for access to quality food at near-wholesale prices. A model for community-controlled food infrastructure.',
  '782 Union St, Brooklyn, NY 11215',
  40.6724, -73.9800,
  'business',
  array['community-owned cooperative'],
  array['food access', 'member-run', 'sliding scale'],
  true, 'consumer',
  'https://foodcoop.com',
  '@parkslopefoodcoop',
  '{}',
  '{"mon": "8am–10pm", "tue": "8am–10pm", "wed": "8am–10pm", "thu": "8am–10pm", "fri": "8am–10pm", "sat": "8am–10pm", "sun": "8am–10pm"}'::jsonb,
  'approved'
),

-- ----------------------------------------------------------------
-- 3. Interference Archive — movement culture community archive
-- ----------------------------------------------------------------
(
  'Interference Archive',
  'A volunteer-run community archive dedicated to preserving and sharing the cultural production of social movements — posters, zines, records, films, and ephemera from labor, feminist, anti-war, and liberation struggles worldwide. Open to all, with a small shop and regular programming.',
  '314 7th St, Brooklyn, NY 11215',
  40.6699, -73.9887,
  'hub',
  array['collectively-run', 'nonprofit'],
  array['archive', 'zines', 'radical history', 'free access'],
  false, null,
  'https://interferencearchive.org',
  '@interferencearchive',
  '{}',
  '{"thu": "12pm–9pm", "fri": "12pm–5pm", "sat": "12pm–5pm", "sun": "12pm–5pm"}'::jsonb,
  'approved'
),

-- ----------------------------------------------------------------
-- 4. Catland Books — queer & occult bookshop, Bushwick
-- ----------------------------------------------------------------
(
  'Catland Books',
  'An independent queer-owned bookshop in Bushwick specializing in occult, esoteric, and metaphysical literature alongside zines, art, and community events. A beloved neighborhood institution that hosts workshops, readings, and ritual gatherings.',
  '845 Broadway, Brooklyn, NY 11206',
  40.6986, -73.9354,
  'business',
  array['queer-owned', 'women-owned'],
  array['bookshop', 'occult', 'events', 'zines'],
  false, null,
  'https://catlandbooks.com',
  '@catlandbooks',
  '{}',
  '{"mon": "12pm–8pm", "tue": "12pm–8pm", "wed": "12pm–8pm", "thu": "12pm–8pm", "fri": "12pm–9pm", "sat": "11am–9pm", "sun": "11am–8pm"}'::jsonb,
  'approved'
),

-- ----------------------------------------------------------------
-- 5. Mayday Space — collectively-run community hub, Bushwick
-- ----------------------------------------------------------------
(
  'Mayday Space',
  'A collectively-run community space in Bushwick that hosts political education, organizing meetings, mutual aid efforts, and cultural events. Home to a range of left and labor groups, Mayday operates on a pay-what-you-can model and prioritizes BIPOC and working-class communities.',
  '176 St Nicholas Ave, Brooklyn, NY 11237',
  40.7024, -73.9249,
  'hub',
  array['collectively-run', 'nonprofit'],
  array['organizing', 'political education', 'mutual aid', 'events'],
  false, null,
  'https://maydayspace.org',
  '@maydayspace',
  '{}',
  null,
  'approved'
),

-- ----------------------------------------------------------------
-- 6. Nowadays — queer-forward club & bar, Ridgewood
-- ----------------------------------------------------------------
(
  'Nowadays',
  'An outdoor and indoor music venue, bar, and community gathering space straddling the Brooklyn-Queens border in Ridgewood. Known for its lush garden, underground DJ sets, and explicitly queer and trans-inclusive culture. One of NYC''s most beloved independent venues.',
  '56-06 Cooper Ave, Ridgewood, NY 11385',
  40.7030, -73.9060,
  'business',
  array['queer-owned'],
  array['nightlife', 'outdoor space', 'music', 'events'],
  false, null,
  'https://nowadays.nyc',
  '@nowadaysnyc',
  '{}',
  '{"thu": "5pm–4am", "fri": "5pm–4am", "sat": "3pm–4am", "sun": "3pm–2am"}'::jsonb,
  'approved'
),

-- ----------------------------------------------------------------
-- 7. Woodbine — anarchist community space, Ridgewood
-- ----------------------------------------------------------------
(
  'Woodbine',
  'An experimental hub in Ridgewood run by a collective committed to building the infrastructure for autonomous life. Hosts free workshops on skills ranging from coding and urban farming to first aid and political theory. A space for convergence, study, and mutual care.',
  '585 Woodward Ave, Ridgewood, NY 11385',
  40.7012, -73.8963,
  'hub',
  array['collectively-run'],
  array['skillshare', 'political education', 'free events', 'mutual aid'],
  false, null,
  'https://woodbine.nyc',
  '@woodbinenyc',
  '{}',
  null,
  'approved'
),

-- ----------------------------------------------------------------
-- 8. Trans Mutual Aid Brooklyn — mutual aid network
-- ----------------------------------------------------------------
(
  'Trans Mutual Aid Brooklyn',
  'A community-run mutual aid network providing direct financial and material support to trans, nonbinary, and gender-nonconforming people in Brooklyn and the wider NYC area. Operates through a redistributive model connecting those with resources to those with needs.',
  'Brooklyn, NY',
  40.6782, -73.9442,
  'service',
  array['trans-owned', 'queer-owned', 'mutual aid org'],
  array['mutual aid', 'trans support', 'direct aid'],
  false, null,
  null,
  '@transmutualaidbrooklyn',
  '{}',
  null,
  'approved'
),

-- ----------------------------------------------------------------
-- 9. Brooklyn Free Store — free thrift & mutual aid, Gowanus
-- ----------------------------------------------------------------
(
  'Brooklyn Free Store',
  'A pay-nothing shop where everything is free. Clothing, books, housewares, and more — donated and taken freely with no exchange required. Run by volunteers as a practice of degrowth and mutual aid in the Gowanus neighborhood.',
  'Gowanus, Brooklyn, NY',
  40.6726, -73.9892,
  'service',
  array['collectively-run', 'mutual aid org'],
  array['free store', 'degrowth', 'mutual aid', 'clothing'],
  false, null,
  null,
  null,
  '{}',
  null,
  'approved'
),

-- ----------------------------------------------------------------
-- 10. Bed-Stuy Community Garden (718 Jefferson) — community garden
-- ----------------------------------------------------------------
(
  '718 Jefferson Community Garden',
  'A community-tended garden on a formerly vacant lot in Bed-Stuy, managed collectively by neighborhood residents. Grows food, medicinal herbs, and flowers shared freely with the block. Hosts seasonal workshops on urban growing, seed saving, and composting.',
  '718 Jefferson Ave, Brooklyn, NY 11221',
  40.6916, -73.9285,
  'garden',
  array['community-owned cooperative', 'collectively-run'],
  array['urban growing', 'food access', 'free produce', 'workshops'],
  false, null,
  null,
  null,
  '{}',
  '{"sat": "10am–2pm", "sun": "10am–2pm"}'::jsonb,
  'approved'
);
