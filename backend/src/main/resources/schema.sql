-- ============================================
-- Script SQL complet pour SMS (School Management System)
-- ============================================

-- Table des cycles (Fondamental, Collège, Lycée)
CREATE TABLE IF NOT EXISTS cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ordre INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des niveaux (1ère année, 2ème année, etc.)
CREATE TABLE IF NOT EXISTS niveaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cycle_id BIGINT,
    ordre INT DEFAULT 0,
    FOREIGN KEY (cycle_id) REFERENCES cycles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des spécialités (C, D, A, O pour le Lycée)
CREATE TABLE IF NOT EXISTS specialites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    cycle_id BIGINT,
    matieres TEXT,
    FOREIGN KEY (cycle_id) REFERENCES cycles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des professeurs (ancienne version simplifiée)
CREATE TABLE IF NOT EXISTS professeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des salles
CREATE TABLE IF NOT EXISTS salles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    capacite INT DEFAULT 30,
    type VARCHAR(50),
    equipements TEXT,
    disponible BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des matières par cycle (ancienne version)
CREATE TABLE IF NOT EXISTS matieres_cycle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cycle_id BIGINT,
    FOREIGN KEY (cycle_id) REFERENCES cycles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des matières (nouvelle version complète)
CREATE TABLE IF NOT EXISTS matieres (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    coefficient INT DEFAULT 1,
    volume_horaire INT,
    niveau_id BIGINT,
    cycle_id BIGINT,
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id),
    FOREIGN KEY (cycle_id) REFERENCES cycles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des périodes (Trimestres)
CREATE TABLE IF NOT EXISTS periodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    date_debut DATE,
    date_fin DATE,
    annee_scolaire VARCHAR(20),
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des classes
CREATE TABLE IF NOT EXISTS classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    cycle_id BIGINT,
    niveau_id BIGINT,
    specialite_id BIGINT,
    capacite INT DEFAULT 35,
    effectif INT DEFAULT 0,
    prof_principal_id BIGINT,
    salle VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'Active',
    annee_scolaire VARCHAR(20),
    FOREIGN KEY (cycle_id) REFERENCES cycles(id),
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id),
    FOREIGN KEY (specialite_id) REFERENCES specialites(id),
    FOREIGN KEY (prof_principal_id) REFERENCES professeurs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des élèves
CREATE TABLE IF NOT EXISTS eleves (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance VARCHAR(20),
    lieu_naissance VARCHAR(100),
    sexe VARCHAR(20),
    nationalite VARCHAR(50),
    adresse VARCHAR(255),
    wilaya VARCHAR(100),
    moughataa VARCHAR(100),

    -- Parents/Tuteurs
    nom_pere VARCHAR(100),
    profession_pere VARCHAR(100),
    tel_pere VARCHAR(30),
    email_pere VARCHAR(100),
    nom_mere VARCHAR(100),
    profession_mere VARCHAR(100),
    tel_mere VARCHAR(30),
    tuteur_nom VARCHAR(100),
    tuteur_tel VARCHAR(30),
    tuteur_relation VARCHAR(50),

    -- Scolarité
    classe_id BIGINT,
    ancien_etablissement VARCHAR(255),
    date_inscription VARCHAR(20),
    numero_inscription VARCHAR(50),

    -- Santé
    groupe_sanguin VARCHAR(10),
    allergies TEXT,
    maladies_chroniques TEXT,
    contact_urgence VARCHAR(30),

    -- Statut
    statut VARCHAR(20) DEFAULT 'Actif',
    annee_scolaire VARCHAR(20),

    FOREIGN KEY (classe_id) REFERENCES classes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des types de frais
CREATE TABLE IF NOT EXISTS types_frais (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    eleve_id BIGINT NOT NULL,
    type_frais_id BIGINT,
    montant DECIMAL(10, 2) NOT NULL,
    montant_paye DECIMAL(10, 2) DEFAULT 0,
    reste_a_payer DECIMAL(10, 2),
    mode_paiement VARCHAR(50),
    reference_paiement VARCHAR(100),
    date_paiement DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'En attente',
    mois_concerne VARCHAR(20),
    annee_scolaire VARCHAR(20),
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    FOREIGN KEY (type_frais_id) REFERENCES types_frais(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table du personnel (enseignants et administratifs)
CREATE TABLE IF NOT EXISTS personnel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    sexe VARCHAR(10),
    telephone VARCHAR(30),
    email VARCHAR(100),
    specialite VARCHAR(100),
    diplome VARCHAR(200),
    date_embauche DATE,
    statut VARCHAR(30) DEFAULT 'actif',
    salaire DECIMAL(10, 2),
    fonction VARCHAR(100),
    departement VARCHAR(100),
    type VARCHAR(20), -- enseignant, admin
    adresse VARCHAR(255),
    annee_scolaire VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des séances (emploi du temps)
CREATE TABLE IF NOT EXISTS seances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    classe_id BIGINT NOT NULL,
    matiere_id BIGINT,
    professeur_id BIGINT,
    salle_id BIGINT,
    jour_semaine INT, -- 1=Lundi, 2=Mardi, etc.
    heure_debut TIME,
    heure_fin TIME,
    annee_scolaire VARCHAR(20),
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (classe_id) REFERENCES classes(id),
    FOREIGN KEY (matiere_id) REFERENCES matieres(id),
    FOREIGN KEY (professeur_id) REFERENCES professeurs(id),
    FOREIGN KEY (salle_id) REFERENCES salles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des examens
CREATE TABLE IF NOT EXISTS examens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    matiere_id BIGINT,
    classe_id BIGINT,
    periode_id BIGINT,
    date_examen DATE,
    heure_debut TIME,
    heure_fin TIME,
    duree INT, -- en minutes
    total_points DECIMAL(5, 2) DEFAULT 20.00,
    salle_id BIGINT,
    surveillant_id BIGINT,
    statut VARCHAR(30) DEFAULT 'planifie', -- planifie, en_cours, termine, annule
    annee_scolaire VARCHAR(20),
    commentaire TEXT,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id),
    FOREIGN KEY (classe_id) REFERENCES classes(id),
    FOREIGN KEY (periode_id) REFERENCES periodes(id),
    FOREIGN KEY (salle_id) REFERENCES salles(id),
    FOREIGN KEY (surveillant_id) REFERENCES professeurs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des résultats d'examens
CREATE TABLE IF NOT EXISTS resultats_examens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    examen_id BIGINT NOT NULL,
    eleve_id BIGINT NOT NULL,
    note_obtenue DECIMAL(5, 2),
    rang INT,
    appreciation VARCHAR(255),
    absent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (examen_id) REFERENCES examens(id) ON DELETE CASCADE,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des notes
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    eleve_id BIGINT NOT NULL,
    matiere_id BIGINT NOT NULL,
    examen_id BIGINT,
    periode_id BIGINT,
    valeur DECIMAL(5, 2) NOT NULL,
    type VARCHAR(50), -- Devoir, Interrogation, Examen, Participation
    date_note DATE,
    commentaire TEXT,
    annee_scolaire VARCHAR(20),
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id),
    FOREIGN KEY (examen_id) REFERENCES examens(id),
    FOREIGN KEY (periode_id) REFERENCES periodes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des bulletins
CREATE TABLE IF NOT EXISTS bulletins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    eleve_id BIGINT NOT NULL,
    periode_id BIGINT NOT NULL,
    moyenne_generale DECIMAL(5, 2),
    rang INT,
    total_eleves INT,
    appreciation TEXT,
    date_generation DATE,
    annee_scolaire VARCHAR(20),
    decision VARCHAR(50), -- Admis, Redoublant, Passage conditionnel
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    FOREIGN KEY (periode_id) REFERENCES periodes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des présences
CREATE TABLE IF NOT EXISTS presences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    eleve_id BIGINT NOT NULL,
    seance_id BIGINT,
    date_presence DATE NOT NULL,
    statut VARCHAR(30), -- present, absent, retard, excuse
    heure_arrivee TIME,
    minutes_retard INT,
    justifie BOOLEAN DEFAULT FALSE,
    motif VARCHAR(255),
    annee_scolaire VARCHAR(20),
    commentaire TEXT,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE,
    FOREIGN KEY (seance_id) REFERENCES seances(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INDEX pour améliorer les performances
-- ============================================

CREATE INDEX IF NOT EXISTS idx_eleves_matricule ON eleves(matricule);
CREATE INDEX IF NOT EXISTS idx_eleves_nom ON eleves(nom);
CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_eleves_wilaya ON eleves(wilaya);
CREATE INDEX IF NOT EXISTS idx_eleves_statut ON eleves(statut);

CREATE INDEX IF NOT EXISTS idx_paiements_eleve ON paiements(eleve_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON paiements(date_paiement);

CREATE INDEX IF NOT EXISTS idx_personnel_matricule ON personnel(matricule);
CREATE INDEX IF NOT EXISTS idx_personnel_type ON personnel(type);
CREATE INDEX IF NOT EXISTS idx_personnel_statut ON personnel(statut);

CREATE INDEX IF NOT EXISTS idx_seances_classe ON seances(classe_id);
CREATE INDEX IF NOT EXISTS idx_seances_professeur ON seances(professeur_id);
CREATE INDEX IF NOT EXISTS idx_seances_jour ON seances(jour_semaine);

CREATE INDEX IF NOT EXISTS idx_examens_classe ON examens(classe_id);
CREATE INDEX IF NOT EXISTS idx_examens_date ON examens(date_examen);
CREATE INDEX IF NOT EXISTS idx_examens_statut ON examens(statut);

CREATE INDEX IF NOT EXISTS idx_notes_eleve ON notes(eleve_id);
CREATE INDEX IF NOT EXISTS idx_notes_matiere ON notes(matiere_id);
CREATE INDEX IF NOT EXISTS idx_notes_periode ON notes(periode_id);

CREATE INDEX IF NOT EXISTS idx_presences_eleve ON presences(eleve_id);
CREATE INDEX IF NOT EXISTS idx_presences_date ON presences(date_presence);
CREATE INDEX IF NOT EXISTS idx_presences_statut ON presences(statut);

CREATE INDEX IF NOT EXISTS idx_bulletins_eleve ON bulletins(eleve_id);
CREATE INDEX IF NOT EXISTS idx_bulletins_periode ON bulletins(periode_id);

-- ============================================
-- DONNÉES INITIALES - Types de frais
-- ============================================

INSERT IGNORE INTO types_frais (id, code) VALUES
(1, 'INSCRIPTION'),
(2, 'MENSUEL');
