-- Suppression des colonnes volume_horaire et actif de la table matieres
ALTER TABLE matieres DROP COLUMN IF EXISTS volume_horaire;
ALTER TABLE matieres DROP COLUMN IF EXISTS actif;
