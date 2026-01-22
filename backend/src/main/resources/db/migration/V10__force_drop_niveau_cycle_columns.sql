-- Migration V10: Forcer la suppression des colonnes niveau_id et cycle_id
-- Ces colonnes doivent être supprimées de la table matieres

SET FOREIGN_KEY_CHECKS = 0;

-- Vérifier et supprimer toutes les clés étrangères possibles
SET @query1 = IF(
    (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = 'sms'
     AND TABLE_NAME = 'matieres'
     AND CONSTRAINT_TYPE = 'FOREIGN KEY') > 0,
    'SELECT CONCAT("ALTER TABLE matieres DROP FOREIGN KEY ", CONSTRAINT_NAME, ";")
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = "sms"
     AND TABLE_NAME = "matieres"
     AND CONSTRAINT_TYPE = "FOREIGN KEY"',
    'SELECT "No foreign keys to drop"'
);

-- Supprimer les index qui pourraient bloquer
DROP INDEX IF EXISTS idx_matiere_niveau ON matieres;
DROP INDEX IF EXISTS idx_matiere_cycle ON matieres;
DROP INDEX IF EXISTS FKsbs2ucdx2r0swu4iw54u01dq7 ON matieres;
DROP INDEX IF EXISTS FKnqvvlx5cpg40kkqv4jrnqvk0r ON matieres;

-- Forcer la suppression des colonnes niveau_id et cycle_id
ALTER TABLE matieres
DROP COLUMN IF EXISTS niveau_id,
DROP COLUMN IF EXISTS cycle_id,
DROP COLUMN IF EXISTS coefficient;

SET FOREIGN_KEY_CHECKS = 1;

-- Vérifier la structure finale
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sms'
  AND TABLE_NAME = 'matieres'
ORDER BY ORDINAL_POSITION;
