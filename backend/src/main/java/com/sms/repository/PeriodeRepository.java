package com.sms.repository;

import com.sms.entity.Periode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeriodeRepository extends JpaRepository<Periode, Long> {
    List<Periode> findByActifTrueOrderByOrdre();
    List<Periode> findByAnneeScolaireOrderByOrdre(String anneeScolaire);
}
