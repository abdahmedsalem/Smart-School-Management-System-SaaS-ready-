package com.sms.repository;

import com.sms.entity.Eleve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EleveRepository extends JpaRepository<Eleve, Long> {

    Optional<Eleve> findByMatricule(String matricule);

    List<Eleve> findByStatut(String statut);

    List<Eleve> findByWilaya(String wilaya);

    @Query("SELECT e FROM Eleve e WHERE e.classe.id = :classeId")
    List<Eleve> findByClasseId(@Param("classeId") Long classeId);

    @Query("SELECT e FROM Eleve e WHERE " +
            "(:search IS NULL OR LOWER(e.nom) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.prenom) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.matricule) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:classeId IS NULL OR e.classe.id = :classeId) " +
            "AND (:wilaya IS NULL OR e.wilaya = :wilaya) " +
            "AND (:statut IS NULL OR e.statut = :statut)")
    List<Eleve> findWithFilters(
            @Param("search") String search,
            @Param("classeId") Long classeId,
            @Param("wilaya") String wilaya,
            @Param("statut") String statut
    );

    @Query("SELECT COUNT(e) FROM Eleve e WHERE e.statut = 'Actif'")
    long countActifs();

    @Query("SELECT COUNT(e) FROM Eleve e WHERE e.statut = 'Inactif'")
    long countInactifs();

    @Query("SELECT e.wilaya, COUNT(e) FROM Eleve e GROUP BY e.wilaya")
    List<Object[]> countByWilaya();

    @Query("SELECT e.classe.nom, COUNT(e) FROM Eleve e WHERE e.classe IS NOT NULL GROUP BY e.classe.nom")
    List<Object[]> countByClasse();

    boolean existsByMatricule(String matricule);
}
