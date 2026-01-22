package com.sms.repository;

import com.sms.entity.Bulletin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BulletinRepository extends JpaRepository<Bulletin, Long> {
    List<Bulletin> findByEleveId(Long eleveId);
    List<Bulletin> findByPeriodeId(Long periodeId);
    Optional<Bulletin> findByEleveIdAndPeriodeId(Long eleveId, Long periodeId);

    @Query("SELECT b FROM Bulletin b WHERE b.eleve.classe.id = :classeId AND b.periode.id = :periodeId ORDER BY b.rang")
    List<Bulletin> findByClasseAndPeriode(@Param("classeId") Long classeId, @Param("periodeId") Long periodeId);

    @Query("SELECT b FROM Bulletin b WHERE b.anneeScolaire = :anneeScolaire AND b.eleve.id = :eleveId ORDER BY b.periode.ordre")
    List<Bulletin> findByEleveAndAnneeScolaire(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);
}
