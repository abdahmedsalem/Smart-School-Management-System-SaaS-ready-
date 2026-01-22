package com.sms.repository;

import com.sms.entity.Cycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CycleRepository extends JpaRepository<Cycle, Long> {
    Optional<Cycle> findByNom(String nom);
}
