-- Insert sample users (passwords are 'Password123!' encoded with BCrypt)
-- 'deleted' column is NOT NULL, must be set explicitly for H2
INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Admin User', 'admin@locaspace.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'ADMIN', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@locaspace.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Jean Dupont', 'jean@example.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'PROPRIETAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jean@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Marie Martin', 'marie@example.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'marie@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Test Tenant', 'tenant@test.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tenant@test.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Test Owner', 'owner@test.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'PROPRIETAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@test.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Test Admin', 'admin@test.com', '$2a$10$Hgpo1nplbHLAV8ybThtzW.zRtlAnzvgoDadQCDCC4icOFFt.U2MKS', 'ADMIN', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com');

-- Insert sample lieux (deleted column also required)
INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted)
SELECT 'Villa Spacieuse avec Piscine', 'Une magnifique villa avec piscine privee et grand jardin.', 'VILLA', 350.00, 'Marrakech, Maroc', TRUE, (SELECT id FROM users WHERE email = 'jean@example.com'), FALSE
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted)
SELECT 'Appartement Moderne Centre-Ville', 'Un appartement chic et moderne au coeur de Casablanca.', 'APPARTEMENT', 120.00, 'Casablanca, Maroc', TRUE, (SELECT id FROM users WHERE email = 'jean@example.com'), FALSE
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Appartement Moderne Centre-Ville');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted)
SELECT 'Maison de Campagne Charmante', 'Havre de paix entoure de nature avec tout le confort moderne.', 'MAISON', 210.00, 'Agadir, Maroc', FALSE, (SELECT id FROM users WHERE email = 'jean@example.com'), FALSE
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Maison de Campagne Charmante');

-- Insert sample photos
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1613977257363-31b5a15e3a2b?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id);

INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id);

-- Insert sample reservations (deleted column also required)
INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted)
SELECT '2025-03-15', '2025-03-17', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'),
       FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM reservations WHERE user_id = (SELECT id FROM users WHERE email = 'marie@example.com')
);

-- Insert sample reviews (avis has no soft-delete)
INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Absolument parfait ! La vue est encore plus belle en vrai.',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine')
WHERE NOT EXISTS (
  SELECT 1 FROM avis WHERE user_id = (SELECT id FROM users WHERE email = 'marie@example.com')
);
