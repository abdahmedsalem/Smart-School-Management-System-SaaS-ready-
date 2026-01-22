-- Migration: Remplir classe_matiere_id pour les notes existantes
-- Date: 2026-01-10
-- Description: Migrer les données existantes en trouvant le classe_matiere_id correct

-- Mettre à jour les notes existantes en trouvant le classe_matiere_id correspondant
UPDATE notes n
SET classe_matiere_id = (
    SELECT cm.id
    FROM classe_matieres cm
    JOIN eleves e ON e.classe_id = cm.classe_id
    JOIN matiere_niveaux mn ON mn.id = cm.matiere_niveau_id
    WHERE e.id = n.eleve_id
      AND mn.matiere_id = n.matiere_id
    LIMIT 1
)
WHERE n.classe_matiere_id IS NULL
  AND n.matiere_id IS NOT NULL
  AND n.eleve_id IS NOT NULL;

-- Vérifier qu'il n'y a plus de notes sans classe_matiere_id (sauf si matiere_id était déjà null)
-- SELECT COUNT(*) FROM notes WHERE classe_matiere_id IS NULL AND matiere_id IS NOT NULL;

-- Si des notes n'ont pas pu être migrées, les logger pour investigation manuelle
-- (les notes orphelines où la matière n'est plus assignée à la classe)
CREATE TEMPORARY TABLE IF NOT EXISTS notes_migration_issues AS
SELECT n.id, n.eleve_id, n.matiere_id, e.classe_id, n.date_note
FROM notes n
JOIN eleves e ON e.id = n.eleve_id
WHERE n.classe_matiere_id IS NULL
  AND n.matiere_id IS NOT NULL;

-- Afficher les problèmes (si des notes n'ont pas pu être migrées)
-- SELECT * FROM notes_migration_issues;

-- Rendre la colonne NOT NULL maintenant que les données sont migrées
-- Note: Décommenter cette ligne après avoir vérifié que toutes les notes ont un classe_matiere_id
-- ALTER TABLE notes ALTER COLUMN classe_matiere_id SET NOT NULL;
