-- Migration V6: Restructuration complète des matières
-- 1. Simplifier la table matieres (garder seulement id, code, nom)
-- 2. Créer la table matiere_niveaux (matiere + niveau + coefficient)
-- 3. Supprimer cycle_id de la table classes
-- 4. Remplacer classe_matieres par une nouvelle table avec matiere_niveau_id et coefficient

-- Désactiver les contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- ÉTAPE 1: Supprimer l'ancienne table classe_matieres
-- =========================================================================
DROP TABLE IF EXISTS classe_matieres;

-- =========================================================================
-- ÉTAPE 2: Créer la nouvelle table matiere_niveaux
-- =========================================================================
CREATE TABLE matiere_niveaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coefficient INT NOT NULL,
    matiere_id BIGINT NOT NULL,
    niveau_id BIGINT NOT NULL,
    CONSTRAINT fk_matiere_niveau_matiere FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE,
    CONSTRAINT fk_matiere_niveau_niveau FOREIGN KEY (niveau_id) REFERENCES niveaux(id) ON DELETE CASCADE,
    CONSTRAINT uk_matiere_niveau UNIQUE (matiere_id, niveau_id)
);

-- =========================================================================
-- ÉTAPE 3: Simplifier la table matieres
-- =========================================================================
-- Supprimer les colonnes coefficient, niveau_id, cycle_id de la table matieres
ALTER TABLE matieres DROP COLUMN IF EXISTS coefficient;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKsbs2ucdx2r0swu4iw54u01dq7;
ALTER TABLE matieres DROP COLUMN IF EXISTS niveau_id;
ALTER TABLE matieres DROP FOREIGN KEY IF EXISTS FKnqvvlx5cpg40kkqv4jrnqvk0r;
ALTER TABLE matieres DROP COLUMN IF EXISTS cycle_id;

-- S'assurer que code est unique et non null
ALTER TABLE matieres MODIFY COLUMN code VARCHAR(255) NOT NULL UNIQUE;

-- =========================================================================
-- ÉTAPE 4: Supprimer cycle_id de la table classes
-- =========================================================================
ALTER TABLE classes DROP FOREIGN KEY IF EXISTS FKtw2jvb8r02eihs3tgnqt2m70n;
ALTER TABLE classes DROP COLUMN IF EXISTS cycle_id;

-- =========================================================================
-- ÉTAPE 5: Créer la nouvelle table classe_matieres
-- =========================================================================
CREATE TABLE classe_matieres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coefficient INT NOT NULL,
    classe_id BIGINT NOT NULL,
    matiere_niveau_id BIGINT NOT NULL,
    CONSTRAINT fk_classe_matiere_classe FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_classe_matiere_matiere_niveau FOREIGN KEY (matiere_niveau_id) REFERENCES matiere_niveaux(id) ON DELETE CASCADE,
    CONSTRAINT uk_classe_matiere_niveau UNIQUE (classe_id, matiere_niveau_id)
);

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
