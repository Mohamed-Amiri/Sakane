-- ============================================================================
-- MySQL / Aiven migration: replace the JPA @ElementCollection tables
-- `lieu_photos` and `lieu_amenities` with child tables that have an explicit
-- primary key, so they are compatible with `sql_require_primary_key=ON`.
--
-- Run this ONCE against the populated database, BEFORE deploying/starting the
-- new application version (which validates the schema). Do not disable
-- `sql_require_primary_key` and do not let Hibernate `ddl-auto=update` alter
-- these populated tables.
--
-- The old collection tables do not preserve collection order reliably, so the
-- `position` column is backfilled using alphabetical ordering as a fallback.
-- Every existing value and its `lieu_id` association is preserved.
--
-- Requires MySQL 5.7+ (the position backfill avoids window functions).
-- Do not run this against a database that already contains the new schema.
-- ============================================================================

-- ---------------------------------------------------------------- photos ----
DROP TABLE IF EXISTS lieu_photos_new;

CREATE TABLE lieu_photos_new (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    lieu_id   BIGINT       NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    position  INT          NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO lieu_photos_new (lieu_id, photo_url, position)
SELECT p.lieu_id,
       p.photo_url,
       (SELECT COUNT(*)
        FROM lieu_photos p2
        WHERE p2.lieu_id = p.lieu_id
          AND p2.photo_url < p.photo_url) AS position
FROM lieu_photos p;

-- ------------------------------------------------------------- amenities ----
DROP TABLE IF EXISTS lieu_amenities_new;

CREATE TABLE lieu_amenities_new (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    lieu_id  BIGINT       NOT NULL,
    amenity  VARCHAR(255) NOT NULL,
    position INT          NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO lieu_amenities_new (lieu_id, amenity, position)
SELECT a.lieu_id,
       a.amenity,
       (SELECT COUNT(*)
        FROM lieu_amenities a2
        WHERE a2.lieu_id = a.lieu_id
          AND a2.amenity < a.amenity) AS position
FROM lieu_amenities a;

-- --------------------------------------------------------------- swap -------
-- RENAME TABLE is atomic, so the old tables stay intact until both new tables
-- are ready. The old tables are kept as *_old until they are dropped below.
RENAME TABLE
    lieu_photos    TO lieu_photos_old,
    lieu_photos_new TO lieu_photos,
    lieu_amenities    TO lieu_amenities_old,
    lieu_amenities_new TO lieu_amenities;

-- Verify counts before dropping the backups, e.g.:
--   SELECT COUNT(*) FROM lieu_photos;
--   SELECT COUNT(*) FROM lieu_photos_old;
--   SELECT COUNT(*) FROM lieu_amenities;
--   SELECT COUNT(*) FROM lieu_amenities_old;

DROP TABLE lieu_photos_old;
DROP TABLE lieu_amenities_old;
