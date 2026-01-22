package com.sms.repository;

import com.sms.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    List<Paiement> findByEleveId(Long eleveId);

    List<Paiement> findByStatut(String statut);

    List<Paiement> findByAnneeScolaire(String anneeScolaire);

    @Query("SELECT p FROM Paiement p WHERE p.eleve.id = :eleveId AND p.anneeScolaire = :anneeScolaire")
    List<Paiement> findByEleveAndAnneeScolaire(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT SUM(p.montant) FROM Paiement p WHERE p.eleve.id = :eleveId AND p.anneeScolaire = :anneeScolaire")
    BigDecimal getTotalMontantByEleve(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT SUM(p.montantPaye) FROM Paiement p WHERE p.eleve.id = :eleveId AND p.anneeScolaire = :anneeScolaire")
    BigDecimal getTotalPayeByEleve(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT SUM(p.resteAPayer) FROM Paiement p WHERE p.eleve.id = :eleveId AND p.anneeScolaire = :anneeScolaire")
    BigDecimal getTotalResteByEleve(@Param("eleveId") Long eleveId, @Param("anneeScolaire") String anneeScolaire);

    @Query("SELECT COUNT(p) FROM Paiement p WHERE p.statut = 'Payé'")
    long countPaye();

    @Query("SELECT COUNT(p) FROM Paiement p WHERE p.statut = 'En attente'")
    long countEnAttente();

    @Query("SELECT COUNT(p) FROM Paiement p WHERE p.statut = 'Partiel'")
    long countPartiel();

    @Query("SELECT SUM(p.montantPaye) FROM Paiement p WHERE p.anneeScolaire = :anneeScolaire")
    BigDecimal getTotalEncaisse(@Param("anneeScolaire") String anneeScolaire);
}
