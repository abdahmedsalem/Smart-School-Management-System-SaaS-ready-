package com.sms.repository;

import com.sms.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByEleveId(Long eleveId);
    List<Note> findByMatiereId(Long matiereId);
    List<Note> findByExamenId(Long examenId);
    List<Note> findByPeriodeId(Long periodeId);

    List<Note> findByEleveIdAndPeriodeId(Long eleveId, Long periodeId);
    List<Note> findByEleveIdAndMatiereId(Long eleveId, Long matiereId);

    Optional<Note> findByEleveIdAndClasseMatiereIdAndPeriodeIdAndType(
        Long eleveId, Long classeMatiereId, Long periodeId, String type);

    @Query("SELECT AVG(n.valeur) FROM Note n WHERE n.eleve.id = :eleveId AND n.periode.id = :periodeId")
    BigDecimal getMoyenneByEleveAndPeriode(@Param("eleveId") Long eleveId, @Param("periodeId") Long periodeId);

    @Query("SELECT AVG(n.valeur) FROM Note n WHERE n.eleve.id = :eleveId AND n.matiere.id = :matiereId AND n.periode.id = :periodeId")
    BigDecimal getMoyenneByEleveMatiereAndPeriode(@Param("eleveId") Long eleveId, @Param("matiereId") Long matiereId, @Param("periodeId") Long periodeId);

    @Query("SELECT AVG(n.valeur) FROM Note n WHERE n.eleve.classe.id = :classeId AND n.periode.id = :periodeId")
    BigDecimal getMoyenneClasseByPeriode(@Param("classeId") Long classeId, @Param("periodeId") Long periodeId);
}
