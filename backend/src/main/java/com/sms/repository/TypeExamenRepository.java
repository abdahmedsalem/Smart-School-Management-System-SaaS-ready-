package com.sms.repository;

import com.sms.entity.TypeExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeExamenRepository extends JpaRepository<TypeExamen, Long> {
    Optional<TypeExamen> findByNom(String nom);
}
