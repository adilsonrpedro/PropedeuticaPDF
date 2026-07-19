/*
# Create reviews and feedbacks tables

1. New Tables
- `reviews`: stores public anonymous reviews (1-5 stars + optional comment).
  - id (uuid PK), rating (int 1-5, CHECK constrained), comment (text nullable), created_at (timestamptz default now())
- `feedbacks`: stores private suggestions/problem reports (admin-only, never shown publicly).
  - id (uuid PK), type (text 'suggestion'|'problem', CHECK constrained), message (text not null), email (text nullable), created_at (timestamptz default now())
2. Security
- RLS enabled on both tables.
- `reviews`: public read + anonymous insert (TO anon, authenticated) — reviews are intentionally public/shared, no ownership concept.
- `feedbacks`: anonymous insert only (TO anon, authenticated) — no SELECT policy so data is never exposed via the API; only the service_role (admin) can read.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('suggestion', 'problem')),
  message text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_feedbacks" ON feedbacks;
CREATE POLICY "anon_insert_feedbacks" ON feedbacks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
