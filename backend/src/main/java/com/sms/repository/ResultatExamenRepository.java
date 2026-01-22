package com.sms.repository;

import com.sms.entity.ResultatExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultatExamenRepository extends JpaRepository<ResultatExamen, Long> {
    List<ResultatExamen> findByExamenId(Long examenId);
    List<ResultatExamen> findByEleveId(Long eleveId);
    Optional<ResultatExamen> findByExamenIdAndEleveId(Long examenId, Long eleveId);

    @Query("SELECT AVG(r.noteObtenue) FROM ResultatExamen r WHERE r.examen.id = :examenId AND r.absent = false")
    BigDecimal getMoyenneExamen(@Param("examenId") Long examenId);

    @Query("SELECT COUNT(r) FROM ResultatExamen r WHERE r.examen.id = :examenId AND r.noteObtenue >= :seuilReussite")
    Long countReussiteByExamen(@Param("examenId") Long examenId, @Param("seuilReussite") BigDecimal seuilReussite);

    @Query("SELECT r FROM ResultatExamen r WHERE r.examen.id = :examenId ORDER BY r.noteObtenue DESC")
    List<ResultatExamen> findByExamenIdOrderByNoteDesc(@Param("examenId") Long examenId);
}
