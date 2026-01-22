package com.sms.repository;

import com.sms.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamenRepository extends JpaRepository<Examen, Long> {
    List<Examen> findByClasseId(Long classeId);
    List<Examen> findByMatiereId(Long matiereId);
    List<Examen> findByPeriodeId(Long periodeId);
    List<Examen> findByStatut(String statut);
    List<Examen> findByAnneeScolaire(String anneeScolaire);

    List<Examen> findByDateExamenBetween(LocalDate debut, LocalDate fin);

    @Query("SELECT e FROM Examen e WHERE e.classe.id = :classeId AND e.anneeScolaire = :anneeScolaire ORDER BY e.dateExamen")
    List<Examen> findByClasseAndAnneeScolaire(@Param("classeId") Long classeId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT COUNT(e) FROM Examen e WHERE e.statut = :statut AND e.anneeScolaire = :anneeScolaire")
    Long countByStatutAndAnneeScolaire(@Param("statut") String statut, @Param("anneeScolaire") String anneeScolaire);
}
