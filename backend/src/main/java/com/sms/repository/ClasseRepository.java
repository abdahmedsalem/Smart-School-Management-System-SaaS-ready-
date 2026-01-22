package com.sms.repository;

import com.sms.entity.Classe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClasseRepository extends JpaRepository<Classe, Long> {

    List<Classe> findByNiveauId(Long niveauId);

    List<Classe> findByStatut(String statut);

    @Query("SELECT c FROM Classe c " +
           "WHERE (:cycleId IS NULL OR c.niveau.cycle.id = :cycleId) AND " +
           "(:statut IS NULL OR c.statut = :statut) AND " +
           "(:search IS NULL OR LOWER(c.nom) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Classe> findByFilters(
            @Param("cycleId") Long cycleId,
            @Param("statut") String statut,
            @Param("search") String search
    );

    @Query("SELECT COUNT(c) FROM Classe c WHERE c.statut = 'Active'")
    Long countActiveClasses();

    @Query("SELECT COALESCE(SUM(c.effectif), 0) FROM Classe c WHERE c.statut = 'Active'")
    Long sumEffectifActiveClasses();

    @Query("SELECT COALESCE(SUM(c.capacite), 0) FROM Classe c WHERE c.statut = 'Active'")
    Long sumCapaciteActiveClasses();
}
