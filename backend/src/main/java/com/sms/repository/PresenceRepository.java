package com.sms.repository;

import com.sms.entity.Presence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, Long> {
    List<Presence> findByEleveId(Long eleveId);
    List<Presence> findBySeanceId(Long seanceId);
    List<Presence> findByDatePresence(LocalDate date);
    List<Presence> findByStatut(String statut);

    List<Presence> findByEleveIdAndDatePresenceBetween(Long eleveId, LocalDate debut, LocalDate fin);

    @Query("SELECT p FROM Presence p WHERE p.eleve.classe.id = :classeId AND p.datePresence = :date")
    List<Presence> findByClasseAndDate(@Param("classeId") Long classeId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.eleve.id = :eleveId AND p.statut = :statut AND p.anneeScolaire = :anneeScolaire")
    Long countByEleveAndStatut(@Param("eleveId") Long eleveId, @Param("statut") String statut, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.eleve.id = :eleveId AND p.statut = 'absent' AND p.justifie = false AND p.anneeScolaire = :anneeScolaire")
    Long countAbsencesNonJustifiees(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.statut = :statut AND p.anneeScolaire = :anneeScolaire")
    Long countTotalByStatut(@Param("statut") String statut, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.anneeScolaire = :anneeScolaire")
    Long countTotalPresences(@Param("anneeScolaire") String anneeScolaire);
}
