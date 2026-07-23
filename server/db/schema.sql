-- Recipe app schema. Single table: a recipe is one self-contained document,
-- and Postgres arrays let us keep ingredients/steps/tags inline without
-- three extra join tables that this app would never query independently.

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
  id            SERIAL PRIMARY KEY,
  title         TEXT      NOT NULL,
  description   TEXT      NOT NULL,
  category      TEXT      NOT NULL,
  emoji         TEXT      NOT NULL DEFAULT '🍽️',
  tags          TEXT[]    NOT NULL DEFAULT '{}',
  ingredients   TEXT[]    NOT NULL DEFAULT '{}',
  steps         TEXT[]    NOT NULL DEFAULT '{}',
  prep_minutes  INTEGER   NOT NULL DEFAULT 0,
  cook_minutes  INTEGER   NOT NULL DEFAULT 0,
  servings      INTEGER   NOT NULL DEFAULT 2,
  difficulty    TEXT      NOT NULL DEFAULT 'Easy',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speeds up the category filter chips.
CREATE INDEX recipes_category_idx ON recipes (category);

-- trigram-style prefix matching on title would need pg_trgm; a plain lower()
-- index is enough for the dataset size here and needs no extension.
CREATE INDEX recipes_title_lower_idx ON recipes (lower(title));
