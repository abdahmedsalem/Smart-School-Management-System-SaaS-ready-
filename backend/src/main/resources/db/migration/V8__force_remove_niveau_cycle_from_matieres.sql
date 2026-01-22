-- Migration V8: Forcer la suppression de niveau_id et cycle_id de la table matieres
-- Cette migration s'assure que ces colonnes sont définitivement supprimées

SET FOREIGN_KEY_CHECKS = 0;

-- Vérifier et supprimer toutes les contraintes de clés étrangères restantes
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKsbs2ucdx2r0swu4iw54u01dq7;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKnqvvlx5cpg40kkqv4jrnqvk0r;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matiere_niveau;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matiere_cycle;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FK_matiere_niveau;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FK_matiere_cycle;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matieres_niveau_id;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matieres_cycle_id;

-- Supprimer les colonnes niveau_id et cycle_id si elles existent
ALTER TABLE matieres DROP COLUMN IF EXISTS niveau_id;
ALTER TABLE matieres DROP COLUMN IF EXISTS cycle_id;
ALTER TABLE matieres DROP COLUMN IF EXISTS coefficient;

SET FOREIGN_KEY_CHECKS = 1;

-- Vérification finale: la table ne doit contenir que id, nom, code
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sms'
  AND TABLE_NAME = 'matieres'
ORDER BY ORDINAL_POSITION;
