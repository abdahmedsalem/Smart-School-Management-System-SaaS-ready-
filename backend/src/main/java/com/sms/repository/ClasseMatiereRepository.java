package com.sms.repository;

import com.sms.entity.ClasseMatiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClasseMatiereRepository extends JpaRepository<ClasseMatiere, Long> {

    List<ClasseMatiere> findByClasseId(Long classeId);

    List<ClasseMatiere> findByMatiereNiveauId(Long matiereNiveauId);

    @Query("SELECT cm FROM ClasseMatiere cm WHERE cm.classe.id = :classeId AND cm.matiereNiveau.id = :matiereNiveauId")
    ClasseMatiere findByClasseIdAndMatiereNiveauId(@Param("classeId") Long classeId, @Param("matiereNiveauId") Long matiereNiveauId);
}
