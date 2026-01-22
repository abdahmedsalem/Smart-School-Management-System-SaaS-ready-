package com.sms.repository;

import com.sms.entity.TypeFrais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeFraisRepository extends JpaRepository<TypeFrais, Long> {

    Optional<TypeFrais> findByCode(String code);
}
