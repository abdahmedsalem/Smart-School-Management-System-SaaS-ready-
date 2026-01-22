package com.sms.repository;

import com.sms.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {
    List<Specialite> findByCycleId(Long cycleId);
    Optional<Specialite> findByNom(String nom);
}
