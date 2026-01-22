package com.sms.config;

import com.sms.entity.*;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CycleRepository cycleRepository;
    private final NiveauRepository niveauRepository;
    private final SpecialiteRepository specialiteRepository;
    private final PersonnelRepository personnelRepository;
    private final SalleRepository salleRepository;
    private final ClasseRepository classeRepository;
    private final MatiereRepository matiereRepository;
    private final EleveRepository eleveRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // Ne rien initialiser - les données existent déjà
        // L'initialisation a été faite une seule fois
        if (cycleRepository.count() > 0) {
            log.info("Base de données déjà initialisée");
            return;
        }

        log.info("Initialisation des données de base uniquement (pas de classes)...");

        // Cycles
        Cycle fondamental = cycleRepository.save(Cycle.builder().nom("Fondamental").ordre(1).build());
        Cycle college = cycleRepository.save(Cycle.builder().nom("Collège").ordre(2).build());
        Cycle lycee = cycleRepository.save(Cycle.builder().nom("Lycée").ordre(3).build());

        // Niveaux Fondamental
        Niveau f1 = niveauRepository.save(Niveau.builder().nom("1ère année").cycle(fondamental).ordre(1).build());
        Niveau f2 = niveauRepository.save(Niveau.builder().nom("2ème année").cycle(fondamental).ordre(2).build());
        Niveau f3 = niveauRepository.save(Niveau.builder().nom("3ème année").cycle(fondamental).ordre(3).build());
        Niveau f4 = niveauRepository.save(Niveau.builder().nom("4ème année").cycle(fondamental).ordre(4).build());
        Niveau f5 = niveauRepository.save(Niveau.builder().nom("5ème année").cycle(fondamental).ordre(5).build());
        Niveau f6 = niveauRepository.save(Niveau.builder().nom("6ème année").cycle(fondamental).ordre(6).build());

        // Niveaux Collège
        Niveau c1 = niveauRepository.save(Niveau.builder().nom("1ère année").cycle(college).ordre(1).build());
        Niveau c2 = niveauRepository.save(Niveau.builder().nom("2ème année").cycle(college).ordre(2).build());
        Niveau c3 = niveauRepository.save(Niveau.builder().nom("3ème année").cycle(college).ordre(3).build());
        Niveau c4 = niveauRepository.save(Niveau.builder().nom("4ème année").cycle(college).ordre(4).build());

        // Niveaux Lycée
        Niveau l1 = niveauRepository.save(Niveau.builder().nom("1ère année").cycle(lycee).ordre(1).build());
        Niveau l2 = niveauRepository.save(Niveau.builder().nom("2ème année").cycle(lycee).ordre(2).build());
        Niveau l3 = niveauRepository.save(Niveau.builder().nom("3ème année (Bac)").cycle(lycee).ordre(3).build());

        // Spécialités Lycée
        Specialite specC = specialiteRepository.save(Specialite.builder()
                .code("C").nom("C (Scientifique)").cycle(lycee)
                .matieres("Mathématiques,Physique-Chimie,Sciences Naturelles,Français,Arabe,Anglais,Philosophie,Sport")
                .build());
        Specialite specD = specialiteRepository.save(Specialite.builder()
                .code("D").nom("D (Sciences Naturelles)").cycle(lycee)
                .matieres("Sciences Naturelles,Mathématiques,Physique-Chimie,Français,Arabe,Anglais,Philosophie,Sport")
                .build());
        Specialite specA = specialiteRepository.save(Specialite.builder()
                .code("A").nom("A (Littéraire)").cycle(lycee)
                .matieres("Français,Arabe,Anglais,Philosophie,Histoire-Géographie,Mathématiques,Sport")
                .build());
        Specialite specO = specialiteRepository.save(Specialite.builder()
                .code("O").nom("O (Originelle)").cycle(lycee)
                .matieres("Arabe,Éducation islamique,Fiqh,Français,Anglais,Mathématiques,Philosophie,Sport")
                .build());

        // Création des matières dans la table matieres (simplifié: id, nom, code uniquement)
        if (matiereRepository.count() == 0) {
            matiereRepository.save(Matiere.builder().nom("Mathématiques").code("MATH").build());
            matiereRepository.save(Matiere.builder().nom("Arabe").code("ARA").build());
            matiereRepository.save(Matiere.builder().nom("Français").code("FRA").build());
            matiereRepository.save(Matiere.builder().nom("Histoire – Géographie").code("HG").build());
            matiereRepository.save(Matiere.builder().nom("Éducation islamique").code("ISL").build());
            matiereRepository.save(Matiere.builder().nom("Éducation moderne").code("EDU").build());
            matiereRepository.save(Matiere.builder().nom("Sciences naturelles").code("SVT").build());
            matiereRepository.save(Matiere.builder().nom("Anglais").code("ANG").build());
            matiereRepository.save(Matiere.builder().nom("Physique – Chimie").code("PHY").build());
            matiereRepository.save(Matiere.builder().nom("Philosophie").code("PHILO").build());
            matiereRepository.save(Matiere.builder().nom("Informatique").code("INFO").build());
            matiereRepository.save(Matiere.builder().nom("Littérature").code("LITT").build());
            log.info("12 matières créées dans la table matieres (les coefficients seront gérés via MatiereNiveau)");
        }

        // Supprimé: Création des MatiereCycle (table supprimée)
        // Les matières sont maintenant gérées via la table matiere_niveaux

        // Enseignants (créés dans la table personnel avec type='enseignant')
        // Note: Les enseignants sont maintenant gérés via le module Personnel/RH

        // Salles
        salleRepository.save(Salle.builder().nom("Salle 001").capacite(40).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 002").capacite(40).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 101").capacite(35).type("Cours").equipements("Tableau, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 102").capacite(35).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 103").capacite(35).type("Cours").equipements("Tableau, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 104").capacite(35).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 105").capacite(35).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 201").capacite(30).type("Cours").equipements("Tableau, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 202").capacite(30).type("Cours").equipements("Tableau, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 203").capacite(30).type("Cours").equipements("Tableau, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 204").capacite(30).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle 205").capacite(30).type("Cours").equipements("Tableau").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Labo Physique").capacite(25).type("Laboratoire").equipements("Équipement scientifique").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Labo Info").capacite(20).type("Informatique").equipements("20 PC, Projecteur").disponible(true).build());
        salleRepository.save(Salle.builder().nom("Salle Sport").capacite(50).type("Sport").equipements("Équipement sportif").disponible(true).build());

        // =====================================================================
        // IMPORTANT: NE JAMAIS CRÉER DE CLASSES OU D'ÉLÈVES ICI
        // Les 3 classes existantes (ID: 1, 2, 3) sont les SEULES autorisées
        // Tout code de création de classes/élèves a été SUPPRIMÉ DÉFINITIVEMENT
        // =====================================================================

        log.info("Données de structure initialisées avec succès ! (Cycles, niveaux, spécialités, professeurs, salles, matières)");
        log.info("IMPORTANT: Les classes et élèves ne sont PAS créés ici - ils existent déjà dans la base");
    }
}
