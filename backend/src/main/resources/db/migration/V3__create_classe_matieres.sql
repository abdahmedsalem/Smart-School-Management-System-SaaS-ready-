-- Table de jointure pour la relation many-to-many entre classes et matieres
CREATE TABLE IF NOT EXISTS classe_matieres (
    classe_id BIGINT NOT NULL,
    matiere_id BIGINT NOT NULL,
    PRIMARY KEY (classe_id, matiere_id),
    FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_classe_matieres_classe ON classe_matieres(classe_id);
CREATE INDEX idx_classe_matieres_matiere ON classe_matieres(matiere_id);
