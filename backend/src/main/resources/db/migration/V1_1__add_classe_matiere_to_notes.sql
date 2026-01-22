-- Migration: Ajouter classe_matiere_id et absent à la table notes
-- Date: 2026-01-10
-- Description: Correction de l'architecture pour permettre la récupération du coefficient correct

-- 1. Ajouter la colonne classe_matiere_id (nullable temporairement pour la migration)
ALTER TABLE notes ADD COLUMN classe_matiere_id BIGINT;

-- 2. Ajouter la colonne absent
ALTER TABLE notes ADD COLUMN absent BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Créer l'index de performance
CREATE INDEX idx_notes_classe_matiere ON notes(classe_matiere_id, periode_id);

-- 4. Ajouter la contrainte de clé étrangère
ALTER TABLE notes ADD CONSTRAINT fk_notes_classe_matiere
    FOREIGN KEY (classe_matiere_id) REFERENCES classe_matieres(id) ON DELETE CASCADE;

-- 5. Contrainte d'unicité pour éviter les doublons (devoirs/contrôles)
-- Une seule note par élève/classe_matiere/période/type/date si pas d'examen
CREATE UNIQUE INDEX idx_notes_unique_devoir
ON notes(eleve_id, classe_matiere_id, periode_id, type, date_note)
WHERE examen_id IS NULL AND classe_matiere_id IS NOT NULL;

-- 6. Contrainte d'unicité pour les examens
-- Une seule note par élève/examen
CREATE UNIQUE INDEX idx_notes_unique_examen
ON notes(eleve_id, examen_id)
WHERE examen_id IS NOT NULL;

-- 7. Index de performance supplémentaires
CREATE INDEX idx_notes_eleve_periode ON notes(eleve_id, periode_id);
CREATE INDEX idx_notes_type ON notes(type);

-- Note: Les données existantes devront être migrées manuellement
-- en trouvant le classe_matiere_id correspondant à partir de eleve.classe_id et note.matiere_id
-- Script de migration des données dans le prochain fichier
