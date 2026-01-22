package com.sms.repository;

import com.sms.entity.Salle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {
    List<Salle> findByType(String type);
    List<Salle> findByDisponible(Boolean disponible);
    List<Salle> findByTypeAndDisponible(String type, Boolean disponible);
}
