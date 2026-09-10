-- ============================================================
-- Sakane seed data
-- Passwords:
--   Password1!    -> tenant@example.com, owner@example.com (demo accounts)
--   Password123!  -> jean@example.com, marie@example.com, + other users
-- ============================================================

-- ---------- USERS ----------
INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Amiri Mohamed', 'tenant@example.com', '$2b$10$7rKOA18Zi1jx.Q0v7V3e4umk5R/.3W28RXizL5czQWZ1uX8.QGqai', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tenant@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Jean Dupont', 'owner@example.com', '$2b$10$7rKOA18Zi1jx.Q0v7V3e4umk5R/.3W28RXizL5czQWZ1uX8.QGqai', 'PROPRIETAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Marie Martin', 'marie@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'marie@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Ahmed Benali', 'ahmed@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'PROPRIETAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Fatima Zahra', 'fatima@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fatima@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Youssef El Idrissi', 'youssef@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'PROPRIETAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'youssef@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Sara Alaoui', 'sara@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sara@example.com');

INSERT INTO users (nom, email, mot_de_passe, role, deleted)
SELECT 'Karim Tazi', 'karim@example.com', '$2b$10$d6axm8mrt14xVig2cO2v4.g4dM83FtIip5Jg7L5zIjY0Y5cCPvDOG', 'LOCATAIRE', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'karim@example.com');

-- ---------- LIEUX ----------
-- Owner: jean@example.com (owner@example.com)
INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Villa Spacieuse avec Piscine', 'Magnifique villa avec piscine privee, grand jardin et vue sur les montances. Ideal pour les vacances en famille ou entre amis.', 'VILLA', 350.00, 'Circuit de la Palmeraie, Marrakech', TRUE, (SELECT id FROM users WHERE email = 'owner@example.com'), FALSE, 8, 4, 3, 'Marrakech', 'Palmeraie', TRUE, 31.6500, -8.0000, 'Non fumeurs. Pas d''animaux. Calme apres 22h.', '15:00', '11:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Appartement Moderne Centre-Ville', 'Appartement chic et moderne au coeur de Casablanca, a deux pas du port et des restaurants.', 'APPARTEMENT', 120.00, 'Boulevard Mohammed V, Casablanca', TRUE, (SELECT id FROM users WHERE email = 'owner@example.com'), FALSE, 4, 2, 1, 'Casablanca', 'Centre-Ville', TRUE, 33.5731, -7.5898, 'Non fumeurs.', '14:00', '11:00', 1
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Appartement Moderne Centre-Ville');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Riad Traditionnel Marrakech', 'Authentique Riad avec patio interieur, fontaine et terrasse panoramique sur la medina.', 'MAISON', 180.00, 'Djemaa el-Fna, Marrakech', TRUE, (SELECT id FROM users WHERE email = 'owner@example.com'), FALSE, 6, 3, 2, 'Marrakech', 'Medina', TRUE, 31.6258, -7.9892, 'Respecter le calme de la medina. Pas de visiteurs apres 21h.', '15:00', '12:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Riad Traditionnel Marrakech');

-- Owner: ahmed@example.com
INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Studio Cosy Rabat', 'Studio lumineux et bien equipe, proche du tramway et du centre de Rabat.', 'STUDIO', 65.00, 'Avenue Mohammed VI, Rabat', TRUE, (SELECT id FROM users WHERE email = 'ahmed@example.com'), FALSE, 2, 1, 1, 'Rabat', 'Agdal', TRUE, 34.0209, -6.8416, 'Non fumeurs. Studio pour 1-2 personnes uniquement.', '14:00', '11:00', 1
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Studio Cosy Rabat');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Loft Industriel Casablanca', 'Loft avec decoration industrielle, grands espaces et luminosite exceptionnelle.', 'LOFT', 200.00, 'Quartier Maarif, Casablanca', TRUE, (SELECT id FROM users WHERE email = 'ahmed@example.com'), FALSE, 5, 2, 2, 'Casablanca', 'Maarif', TRUE, 33.5898, -7.6333, 'Non fumeurs. Evenements interdits.', '15:00', '11:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Loft Industriel Casablanca');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Maison Plage Agadir', 'Maison avec acces direct a la plage, jardin tropical et barbecue.', 'MAISON', 250.00, 'Front de mer, Agadir', TRUE, (SELECT id FROM users WHERE email = 'ahmed@example.com'), FALSE, 7, 3, 2, 'Agadir', 'Front de mer', TRUE, 30.4278, -9.5981, 'Attention au bruit sur la plage. Douche obligatoire apres la plage.', '15:00', '11:00', 3
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Maison Plage Agadir');

-- Owner: youssef@example.com
INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Appartement Familial Rabat', 'Grand appartement 3 chambres proche des ecoles et commerces, ideal familles.', 'APPARTEMENT', 140.00, 'Avenue Hay Riad, Rabat', TRUE, (SELECT id FROM users WHERE email = 'youssef@example.com'), FALSE, 6, 3, 2, 'Rabat', 'Hay Riad', TRUE, 33.9713, -6.8801, 'Non fumeurs. Enfants bienvenus.', '14:00', '11:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Appartement Familial Rabat');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Chambre Hotel Fes', 'Chambre confortable dans un hotel avec vue sur la medina de Fes.', 'CHAMBRE', 80.00, 'Bab Doukkala, Fes', TRUE, (SELECT id FROM users WHERE email = 'youssef@example.com'), FALSE, 2, 1, 1, 'Fes', 'Medina', TRUE, 34.0610, -4.9770, 'Non fumeurs. Petit-dejeuner inclus.', '14:00', '12:00', 1
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Chambre Hotel Fes');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Salle Evenement Tanger', 'Espace evenementiel modulable pour conferences, mariages et reunions.', 'EVENT_SPACE', 500.00, 'Zone Franche, Tanger', TRUE, (SELECT id FROM users WHERE email = 'youssef@example.com'), FALSE, 100, 1, 4, 'Tanger', 'Zone Franche', TRUE, 35.7595, -5.8340, 'Evenements uniquement. Caution demandee.', '08:00', '02:00', 1
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Salle Evenement Tanger');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Bureau Coworking Rabat', 'Bureau equipe dans un espace coworking moderne avec wifi haut debit.', 'OFFICE', 45.00, 'Avenue Mohammed VI, Rabat', TRUE, (SELECT id FROM users WHERE email = 'youssef@example.com'), FALSE, 1, 1, 1, 'Rabat', 'Agdal', TRUE, 34.0209, -6.8416, 'Espace professionnel. Silence requis.', '08:00', '20:00', 1
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Bureau Coworking Rabat');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Appartement Vue Mer Tanger', 'Appartement avec vue panoramique sur le detroit de Gibraltar et la mer.', 'APPARTEMENT', 160.00, 'Marina Bay, Tanger', TRUE, (SELECT id FROM users WHERE email = 'youssef@example.com'), FALSE, 4, 2, 1, 'Tanger', 'Marina Bay', TRUE, 35.7771, -5.8033, 'Non fumeurs. Terrasse fragile, surveillance des enfants.', '15:00', '11:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Appartement Vue Mer Tanger');

-- Owner: jean@example.com (additional)
INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Villa Luxe Agadir', 'Villa de luxe avec piscine chauffee, spa prive et personnel de maison.', 'VILLA', 450.00, 'Baie d''Agadir, Agadir', TRUE, (SELECT id FROM users WHERE email = 'owner@example.com'), FALSE, 10, 5, 4, 'Agadir', 'Baie', TRUE, 30.4202, -9.5833, 'Personnel present. Spa sur reservation.', '15:00', '12:00', 3
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Villa Luxe Agadir');

INSERT INTO lieux (titre, description, type, prix, adresse, valide, owner_id, deleted, max_guests, bedrooms, bathrooms, city, neighborhood, active, latitude, longitude, house_rules, check_in_time, check_out_time, minimum_nights)
SELECT 'Appartement Haut Standing Casablanca', 'Appartement de standing avec equipements haut de gamme et parking prive.', 'APARTMENT', 280.00, 'Quartier Anfa, Casablanca', TRUE, (SELECT id FROM users WHERE email = 'owner@example.com'), FALSE, 4, 2, 2, 'Casablanca', 'Anfa', TRUE, 33.5833, -7.6500, 'Non fumeurs. Immeuble residentiel calme.', '14:00', '11:00', 2
WHERE NOT EXISTS (SELECT 1 FROM lieux WHERE titre = 'Appartement Haut Standing Casablanca');

-- ---------- PHOTOS (Unsplash URLs - handled by ImgAttrsDirective for responsive srcset) ----------
-- Villa Spacieuse avec Piscine
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1564013799919%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1600596542815%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1600585154340%');

-- Appartement Moderne Centre-Ville
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1502672260266%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1560448204%');

-- Riad Traditionnel Marrakech
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1539020140153%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1553830591-d8632a99e6ff?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1553830591%');

-- Studio Cosy Rabat
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=2071&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Studio Cosy Rabat'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1536376072261%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1974&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Studio Cosy Rabat'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1586023492125%');

-- Loft Industriel Casablanca
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1493809842364%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2076&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1507089947368%');

-- Maison Plage Agadir
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Maison Plage Agadir'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1499793983690%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Maison Plage Agadir'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1512917774080%');

-- Appartement Familial Rabat
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Familial Rabat'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1522708323590%');

-- Chambre Hotel Fes
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Chambre Hotel Fes'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1611892440504%');

-- Salle Evenement Tanger
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2069&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Salle Evenement Tanger'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1519167758481%');

-- Bureau Coworking Rabat
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Bureau Coworking Rabat'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1497366216548%');

-- Appartement Vue Mer Tanger
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1489749798305%');

-- Villa Luxe Agadir
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Luxe Agadir'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1600607687939%');
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Villa Luxe Agadir'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1600566753190%');

-- Appartement Haut Standing Casablanca
INSERT INTO lieu_photos (lieu_id, photo_url)
SELECT l.id, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop'
FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca'
AND NOT EXISTS (SELECT 1 FROM lieu_photos lp WHERE lp.lieu_id = l.id AND lp.photo_url LIKE '%1600585154526%');

-- ---------- AMENITIES ----------
-- Villa Spacieuse avec Piscine
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Piscine' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Piscine');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Jardin' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Jardin');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Villa Spacieuse avec Piscine' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');

-- Appartement Moderne Centre-Ville
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Lave-linge' FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Lave-linge');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'TV ecran plat' FROM lieux l WHERE l.titre = 'Appartement Moderne Centre-Ville' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'TV ecran plat');

-- Riad Traditionnel Marrakech
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Patio' FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Patio');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Terrasse' FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Terrasse');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Riad Traditionnel Marrakech' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');

-- Studio Cosy Rabat
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Studio Cosy Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Studio Cosy Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Studio Cosy Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'TV ecran plat' FROM lieux l WHERE l.titre = 'Studio Cosy Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'TV ecran plat');

-- Loft Industriel Casablanca
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Lave-linge' FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Lave-linge');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking' FROM lieux l WHERE l.titre = 'Loft Industriel Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking');

-- Maison Plage Agadir
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Maison Plage Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Jardin' FROM lieux l WHERE l.titre = 'Maison Plage Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Jardin');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Barbecue' FROM lieux l WHERE l.titre = 'Maison Plage Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Barbecue');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking' FROM lieux l WHERE l.titre = 'Maison Plage Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Vue mer' FROM lieux l WHERE l.titre = 'Maison Plage Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Vue mer');

-- Appartement Familial Rabat
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Appartement Familial Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Appartement Familial Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Lave-linge' FROM lieux l WHERE l.titre = 'Appartement Familial Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Lave-linge');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Appartement Familial Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');

-- Chambre Hotel Fes
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Chambre Hotel Fes' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Petit-dejeuner inclus' FROM lieux l WHERE l.titre = 'Chambre Hotel Fes' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Petit-dejeuner inclus');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Chambre Hotel Fes' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');

-- Salle Evenement Tanger
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Salle Evenement Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Systeme son' FROM lieux l WHERE l.titre = 'Salle Evenement Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Systeme son');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Projecteur' FROM lieux l WHERE l.titre = 'Salle Evenement Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Projecteur');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Salle Evenement Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking' FROM lieux l WHERE l.titre = 'Salle Evenement Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking');

-- Bureau Coworking Rabat
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi haut debit' FROM lieux l WHERE l.titre = 'Bureau Coworking Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi haut debit');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Imprimante' FROM lieux l WHERE l.titre = 'Bureau Coworking Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Imprimante');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Bureau Coworking Rabat' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');

-- Appartement Vue Mer Tanger
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Vue mer' FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Vue mer');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Terrasse' FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Terrasse');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Appartement Vue Mer Tanger' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');

-- Villa Luxe Agadir
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Piscine chauffee' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Piscine chauffee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Spa' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Spa');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Jardin' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Jardin');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Personnel de maison' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Personnel de maison');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Vue mer' FROM lieux l WHERE l.titre = 'Villa Luxe Agadir' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Vue mer');

-- Appartement Haut Standing Casablanca
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'WiFi' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'WiFi');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Climatisation' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Climatisation');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Cuisine equipee' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Cuisine equipee');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Parking prive' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Parking prive');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'TV ecran plat' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'TV ecran plat');
INSERT INTO lieu_amenities (lieu_id, amenity) SELECT l.id, 'Lave-linge' FROM lieux l WHERE l.titre = 'Appartement Haut Standing Casablanca' AND NOT EXISTS (SELECT 1 FROM lieu_amenities la WHERE la.lieu_id = l.id AND la.amenity = 'Lave-linge');

-- ---------- RESERVATIONS ----------
-- marie@example.com reservations
INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-07-15', '2025-07-18', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'),
       FALSE, 4, 1050.00, 'Marie Martin', 'marie@example.com', '+212600000001', 'Arrivee tardive prevue vers 20h.',
       '2025-06-20 10:30:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'marie@example.com' AND r.date_debut = '2025-07-15');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-09-01', '2025-09-05', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Moderne Centre-Ville'),
       FALSE, 2, 480.00, 'Marie Martin', 'marie@example.com', '+212600000001', NULL,
       '2025-08-10 14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'marie@example.com' AND r.date_debut = '2025-09-01');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-08-20', '2025-08-25', 'EN_ATTENTE',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Maison Plage Agadir'),
       FALSE, 3, 1250.00, 'Marie Martin', 'marie@example.com', '+212600000001', 'Voyage avec enfant de 3 ans.',
       '2025-07-05 09:15:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'marie@example.com' AND r.date_debut = '2025-08-20');

-- fatima@example.com reservations
INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-10-10', '2025-10-14', 'EN_ATTENTE',
       (SELECT id FROM users WHERE email = 'fatima@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'),
       FALSE, 5, 1400.00, 'Fatima Zahra', 'fatima@example.com', '+212600000002', NULL,
       '2025-09-15 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'fatima@example.com' AND r.date_debut = '2025-10-10');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-07-01', '2025-07-03', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'fatima@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Studio Cosy Rabat'),
       FALSE, 2, 130.00, 'Fatima Zahra', 'fatima@example.com', '+212600000002', NULL,
       '2025-06-10 16:45:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'fatima@example.com' AND r.date_debut = '2025-07-01');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-11-05', '2025-11-08', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'fatima@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Riad Traditionnel Marrakech'),
       FALSE, 3, 540.00, 'Fatima Zahra', 'fatima@example.com', '+212600000002', 'Voyage d''anniversaire.',
       '2025-10-01 08:30:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'fatima@example.com' AND r.date_debut = '2025-11-05');

-- sara@example.com reservations
INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-08-12', '2025-08-15', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'sara@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Vue Mer Tanger'),
       FALSE, 2, 480.00, 'Sara Alaoui', 'sara@example.com', '+212600000003', NULL,
       '2025-07-20 13:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'sara@example.com' AND r.date_debut = '2025-08-12');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-12-20', '2025-12-26', 'EN_ATTENTE',
       (SELECT id FROM users WHERE email = 'sara@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Luxe Agadir'),
       FALSE, 6, 2700.00, 'Sara Alaoui', 'sara@example.com', '+212600000003', 'Vacances de Noel en famille.',
       '2025-11-01 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'sara@example.com' AND r.date_debut = '2025-12-20');

-- karim@example.com reservations
INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-09-20', '2025-09-22', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'karim@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Loft Industriel Casablanca'),
       FALSE, 3, 400.00, 'Karim Tazi', 'karim@example.com', '+212600000004', NULL,
       '2025-08-25 15:30:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'karim@example.com' AND r.date_debut = '2025-09-20');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-07-25', '2025-07-28', 'ANNULEE',
       (SELECT id FROM users WHERE email = 'karim@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Familial Rabat'),
       FALSE, 2, 420.00, 'Karim Tazi', 'karim@example.com', '+212600000004', NULL,
       '2025-06-30 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'karim@example.com' AND r.date_debut = '2025-07-25');

INSERT INTO reservations (date_debut, date_fin, statut, user_id, lieu_id, deleted, guests, total_price, guest_name, guest_email, guest_phone, special_requests, created_at)
SELECT '2025-10-01', '2025-10-03', 'CONFIRMEE',
       (SELECT id FROM users WHERE email = 'karim@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Haut Standing Casablanca'),
       FALSE, 2, 560.00, 'Karim Tazi', 'karim@example.com', '+212600000004', NULL,
       '2025-09-05 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM reservations r JOIN users u ON r.user_id = u.id WHERE u.email = 'karim@example.com' AND r.date_debut = '2025-10-01');

-- ---------- REVIEWS (AVIS) ----------
INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Absolument magnifique ! La villa est encore plus belle en vrai. La piscine est paradisiaque et l''accueil chaleureux. Nous reviendrons.',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'marie@example.com' AND l.titre = 'Villa Spacieuse avec Piscine');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 4, 'Tres bel appartement bien situe. Quartier anime et proche de tout. Seul bemol: un peu de bruit le soir.',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Moderne Centre-Ville')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'marie@example.com' AND l.titre = 'Appartement Moderne Centre-Ville');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Le riad est un havre de paix au coeur de la medina. Architecture magnifique et petit-dejeuner delicieux.',
       (SELECT id FROM users WHERE email = 'fatima@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Riad Traditionnel Marrakech')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'fatima@example.com' AND l.titre = 'Riad Traditionnel Marrakech');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 4, 'Studio parfait pour un sejour court. Bien equipe et propre. Bon rapport qualite-prix.',
       (SELECT id FROM users WHERE email = 'fatima@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Studio Cosy Rabat')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'fatima@example.com' AND l.titre = 'Studio Cosy Rabat');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Vue incroyable sur la mer ! Tres romantique, parfait pour un couple. La terrasse est superbe.',
       (SELECT id FROM users WHERE email = 'sara@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Vue Mer Tanger')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'sara@example.com' AND l.titre = 'Appartement Vue Mer Tanger');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 4, 'Loft tres bien decorer et spacieux. Le quartier est vivant et agreable. Bonne literie.',
       (SELECT id FROM users WHERE email = 'karim@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Loft Industriel Casablanca')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'karim@example.com' AND l.titre = 'Loft Industriel Casablanca');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Villa luxueuse avec tout le confort. Le personnel est attentionne et la piscine chauffee est un vrai plus.',
       (SELECT id FROM users WHERE email = 'sara@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Villa Luxe Agadir')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'sara@example.com' AND l.titre = 'Villa Luxe Agadir');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 4, 'Maison ideale pres de la plage. Les enfants ont adore le jardin et le barbecue.',
       (SELECT id FROM users WHERE email = 'marie@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Maison Plage Agadir')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'marie@example.com' AND l.titre = 'Maison Plage Agadir');

INSERT INTO avis (note, commentaire, user_id, lieu_id)
SELECT 5, 'Appartement haut standing impeccable. Finition haut de gamme et parking tres pratique.',
       (SELECT id FROM users WHERE email = 'karim@example.com'),
       (SELECT id FROM lieux WHERE titre = 'Appartement Haut Standing Casablanca')
WHERE NOT EXISTS (SELECT 1 FROM avis a JOIN users u ON a.user_id = u.id JOIN lieux l ON a.lieu_id = l.id WHERE u.email = 'karim@example.com' AND l.titre = 'Appartement Haut Standing Casablanca');

-- ---------- NOTIFICATIONS ----------
-- For owner@example.com (owner)
INSERT INTO notifications (title, message, type, lu, created_at, user_id)
SELECT 'Nouvelle reservation', 'Marie Martin a reserve Villa Spacieuse avec Piscine du 15 au 18 juillet.', 'RESERVATION_NEW', FALSE, '2025-06-20 10:30:00',
       (SELECT id FROM users WHERE email = 'owner@example.com')
WHERE NOT EXISTS (SELECT 1 FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email = 'owner@example.com' AND n.type = 'RESERVATION_NEW');

INSERT INTO notifications (title, message, type, lu, created_at, user_id)
SELECT 'Reservation confirmee', 'Votre reservation pour Appartement Moderne Centre-Ville a ete confirmee.', 'RESERVATION_CONFIRMED', TRUE, '2025-08-12 14:00:00',
       (SELECT id FROM users WHERE email = 'owner@example.com')
WHERE NOT EXISTS (SELECT 1 FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email = 'owner@example.com' AND n.type = 'RESERVATION_CONFIRMED');

-- For marie@example.com (tenant)
INSERT INTO notifications (title, message, type, lu, created_at, user_id)
SELECT 'Reservation confirmee', 'Votre reservation pour Villa Spacieuse avec Piscine a ete confirmee.', 'RESERVATION_CONFIRMED', FALSE, '2025-06-21 09:00:00',
       (SELECT id FROM users WHERE email = 'marie@example.com')
WHERE NOT EXISTS (SELECT 1 FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email = 'marie@example.com' AND n.type = 'RESERVATION_CONFIRMED');

INSERT INTO notifications (title, message, type, lu, created_at, user_id)
SELECT 'Bienvenue sur Sakane', 'Merci d''avoir rejoint Sakane ! Explorez nos espaces et trouvez votre prochain sejour.', 'SYSTEM', TRUE, '2025-06-01 08:00:00',
       (SELECT id FROM users WHERE email = 'marie@example.com')
WHERE NOT EXISTS (SELECT 1 FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email = 'marie@example.com' AND n.type = 'SYSTEM');

-- For fatima@example.com (tenant)
INSERT INTO notifications (title, message, type, lu, created_at, user_id)
SELECT 'Nouvelle reservation', 'Fatima Zahra a reserve Villa Spacieuse avec Piscine du 10 au 14 octobre.', 'RESERVATION_NEW', FALSE, '2025-09-15 11:00:00',
       (SELECT id FROM users WHERE email = 'owner@example.com')
WHERE NOT EXISTS (SELECT 1 FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email = 'owner@example.com' AND n.message LIKE '%Fatima%');

-- ---------- FAVORITES ----------
INSERT INTO favorites (user_id, lieu_id, created_at)
SELECT (SELECT id FROM users WHERE email = 'marie@example.com'), (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'), '2025-06-15 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM favorites f JOIN users u ON f.user_id = u.id JOIN lieux l ON f.lieu_id = l.id WHERE u.email = 'marie@example.com' AND l.titre = 'Villa Spacieuse avec Piscine');

INSERT INTO favorites (user_id, lieu_id, created_at)
SELECT (SELECT id FROM users WHERE email = 'marie@example.com'), (SELECT id FROM lieux WHERE titre = 'Riad Traditionnel Marrakech'), '2025-07-01 14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM favorites f JOIN users u ON f.user_id = u.id JOIN lieux l ON f.lieu_id = l.id WHERE u.email = 'marie@example.com' AND l.titre = 'Riad Traditionnel Marrakech');

INSERT INTO favorites (user_id, lieu_id, created_at)
SELECT (SELECT id FROM users WHERE email = 'fatima@example.com'), (SELECT id FROM lieux WHERE titre = 'Appartement Vue Mer Tanger'), '2025-08-20 09:30:00'
WHERE NOT EXISTS (SELECT 1 FROM favorites f JOIN users u ON f.user_id = u.id JOIN lieux l ON f.lieu_id = l.id WHERE u.email = 'fatima@example.com' AND l.titre = 'Appartement Vue Mer Tanger');

INSERT INTO favorites (user_id, lieu_id, created_at)
SELECT (SELECT id FROM users WHERE email = 'sara@example.com'), (SELECT id FROM lieux WHERE titre = 'Villa Luxe Agadir'), '2025-09-01 16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM favorites f JOIN users u ON f.user_id = u.id JOIN lieux l ON f.lieu_id = l.id WHERE u.email = 'sara@example.com' AND l.titre = 'Villa Luxe Agadir');

INSERT INTO favorites (user_id, lieu_id, created_at)
SELECT (SELECT id FROM users WHERE email = 'karim@example.com'), (SELECT id FROM lieux WHERE titre = 'Loft Industriel Casablanca'), '2025-07-10 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM favorites f JOIN users u ON f.user_id = u.id JOIN lieux l ON f.lieu_id = l.id WHERE u.email = 'karim@example.com' AND l.titre = 'Loft Industriel Casablanca');

-- ---------- CALENDAR EVENTS ----------
INSERT INTO calendar_events (lieu_id, start_date, end_date, type, title)
SELECT (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'), '2025-07-15', '2025-07-18', 'booked', 'Reservation Marie Martin'
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce JOIN lieux l ON ce.lieu_id = l.id WHERE l.titre = 'Villa Spacieuse avec Piscine' AND ce.start_date = '2025-07-15');

INSERT INTO calendar_events (lieu_id, start_date, end_date, type, title)
SELECT (SELECT id FROM lieux WHERE titre = 'Villa Spacieuse avec Piscine'), '2025-08-05', '2025-08-10', 'blocked', 'Maintenance annuelle'
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce JOIN lieux l ON ce.lieu_id = l.id WHERE l.titre = 'Villa Spacieuse avec Piscine' AND ce.start_date = '2025-08-05');

INSERT INTO calendar_events (lieu_id, start_date, end_date, type, title)
SELECT (SELECT id FROM lieux WHERE titre = 'Appartement Moderne Centre-Ville'), '2025-09-01', '2025-09-05', 'booked', 'Reservation Marie Martin'
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce JOIN lieux l ON ce.lieu_id = l.id WHERE l.titre = 'Appartement Moderne Centre-Ville' AND ce.start_date = '2025-09-01');

INSERT INTO calendar_events (lieu_id, start_date, end_date, type, title)
SELECT (SELECT id FROM lieux WHERE titre = 'Studio Cosy Rabat'), '2025-07-01', '2025-07-03', 'booked', 'Reservation Fatima Zahra'
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce JOIN lieux l ON ce.lieu_id = l.id WHERE l.titre = 'Studio Cosy Rabat' AND ce.start_date = '2025-07-01');
