package com.sms.repository;

import com.sms.entity.Niveau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NiveauRepository extends JpaRepository<Niveau, Long> {
    List<Niveau> findByCycleIdOrderByOrdre(Long cycleId);
}
