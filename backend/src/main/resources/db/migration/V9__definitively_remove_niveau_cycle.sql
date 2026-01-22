-- Migration V9: Suppression définitive et forcée de niveau_id et cycle_id de la table matieres
-- Approche: Recréer complètement la table avec uniquement les colonnes nécessaires

SET FOREIGN_KEY_CHECKS = 0;

-- Sauvegarder les données actuelles de matieres
CREATE TEMPORARY TABLE matieres_backup AS
SELECT id, nom, code FROM matieres;

-- Supprimer la table matieres complètement
DROP TABLE IF EXISTS matieres;

-- Recréer la table matieres avec la structure correcte (uniquement id, nom, code)
CREATE TABLE matieres (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_matiere_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurer les données
INSERT INTO matieres (id, nom, code)
SELECT id, nom, code FROM matieres_backup;

-- Nettoyer
DROP TEMPORARY TABLE matieres_backup;

SET FOREIGN_KEY_CHECKS = 1;
