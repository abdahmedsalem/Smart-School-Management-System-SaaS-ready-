-- Migration V7: Supprimer toutes les clés étrangères de la table matieres
-- Cette table doit être simplifiée avec seulement id, nom, code

SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer toutes les clés étrangères potentielles de la table matieres
-- Note: Certaines peuvent ne pas exister, c'est OK

-- Supprimer FK vers niveau si elle existe
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKsbs2ucdx2r0swu4iw54u01dq7;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matiere_niveau;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FK_matiere_niveau;

-- Supprimer FK vers cycle si elle existe
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKnqvvlx5cpg40kkqv4jrnqvk0r;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matiere_cycle;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FK_matiere_cycle;

-- Supprimer toute autre FK potentielle
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matieres_niveau_id;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS fk_matieres_cycle_id;

-- Supprimer les colonnes niveau_id et cycle_id si elles existent encore
ALTER TABLE matieres DROP COLUMN IF EXISTS niveau_id;
ALTER TABLE matieres DROP COLUMN IF EXISTS cycle_id;
ALTER TABLE matieres DROP COLUMN IF EXISTS coefficient;

-- S'assurer que la table a la bonne structure
-- Colonnes attendues: id, nom, code
ALTER TABLE matieres MODIFY COLUMN nom VARCHAR(255) NOT NULL;
ALTER TABLE matieres MODIFY COLUMN code VARCHAR(255) NOT NULL UNIQUE;

SET FOREIGN_KEY_CHECKS = 1;

-- Afficher la structure finale pour vérification
SHOW CREATE TABLE matieres;
