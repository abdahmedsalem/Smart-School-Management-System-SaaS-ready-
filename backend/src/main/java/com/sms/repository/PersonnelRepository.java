package com.sms.repository;

import com.sms.entity.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, Long> {
    Optional<Personnel> findByMatricule(String matricule);
    List<Personnel> findByType(String type);
    List<Personnel> findByStatut(String statut);
    List<Personnel> findByDepartement(String departement);

    @Query("SELECT p FROM Personnel p WHERE p.type = 'enseignant' AND p.statut = 'actif'")
    List<Personnel> findAllEnseignantsActifs();

    @Query("SELECT p FROM Personnel p WHERE p.type = 'admin' AND p.statut = 'actif'")
    List<Personnel> findAllAdminActifs();

    @Query("SELECT COUNT(p) FROM Personnel p WHERE p.type = :type AND p.statut = 'actif'")
    Long countByTypeAndActif(@Param("type") String type);

    @Query("SELECT COUNT(p) FROM Personnel p WHERE p.statut = :statut")
    Long countByStatut(@Param("statut") String statut);
}
