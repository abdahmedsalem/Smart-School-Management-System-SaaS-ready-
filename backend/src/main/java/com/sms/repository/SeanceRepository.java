package com.sms.repository;

import com.sms.entity.Seance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeanceRepository extends JpaRepository<Seance, Long> {
    List<Seance> findByClasseId(Long classeId);
    List<Seance> findByProfesseurId(Long professeurId);
    List<Seance> findBySalleId(Long salleId);
    List<Seance> findByJourSemaine(Integer jourSemaine);
    List<Seance> findByActifTrue();

    @Query("SELECT s FROM Seance s WHERE s.classe.id = :classeId AND s.actif = true ORDER BY s.jourSemaine, s.heureDebut")
    List<Seance> findEmploiDuTempsByClasse(@Param("classeId") Long classeId);

    @Query("SELECT s FROM Seance s WHERE s.professeur.id = :professeurId AND s.actif = true ORDER BY s.jourSemaine, s.heureDebut")
    List<Seance> findEmploiDuTempsByProfesseur(@Param("professeurId") Long professeurId);

    @Query("SELECT s FROM Seance s WHERE s.classe.id = :classeId AND s.jourSemaine = :jour AND s.actif = true ORDER BY s.heureDebut")
    List<Seance> findByClasseAndJour(@Param("classeId") Long classeId, @Param("jour") Integer jour);
}
