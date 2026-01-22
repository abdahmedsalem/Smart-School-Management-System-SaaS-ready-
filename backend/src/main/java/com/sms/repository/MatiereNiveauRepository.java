package com.sms.repository;

import com.sms.entity.MatiereNiveau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatiereNiveauRepository extends JpaRepository<MatiereNiveau, Long> {

    List<MatiereNiveau> findByNiveauId(Long niveauId);

    List<MatiereNiveau> findByMatiereId(Long matiereId);

    @Query("SELECT mn FROM MatiereNiveau mn WHERE mn.matiere.id = :matiereId AND mn.niveau.id = :niveauId")
    MatiereNiveau findByMatiereIdAndNiveauId(@Param("matiereId") Long matiereId, @Param("niveauId") Long niveauId);

    @Query("SELECT mn FROM MatiereNiveau mn WHERE mn.niveau.cycle.id = :cycleId")
    List<MatiereNiveau> findByCycleId(@Param("cycleId") Long cycleId);
}
