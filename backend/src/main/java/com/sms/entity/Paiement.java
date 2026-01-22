package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_frais_id")
    private TypeFrais typeFrais;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Column(name = "montant_paye", precision = 10, scale = 2)
    private BigDecimal montantPaye = BigDecimal.ZERO;

    @Column(name = "reste_a_payer", precision = 10, scale = 2)
    private BigDecimal resteAPayer;

    @Column(name = "mode_paiement", length = 50)
    private String modePaiement;

    @Column(name = "reference_paiement", length = 100)
    private String referencePaiement;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(name = "date_echeance")
    private LocalDate dateEcheance;

    @Column(length = 30)
    private String statut = "En attente";

    @Column(name = "mois_concerne", length = 20)
    private String moisConcerne;

    @Column(name = "annee_scolaire", length = 20)
    private String anneeScolaire;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (montantPaye == null) {
            montantPaye = BigDecimal.ZERO;
        }
        calculateResteAPayer();
    }

    @PreUpdate
    public void preUpdate() {
        calculateResteAPayer();
    }

    private void calculateResteAPayer() {
        if (montant != null && montantPaye != null) {
            resteAPayer = montant.subtract(montantPaye);
            if (resteAPayer.compareTo(BigDecimal.ZERO) <= 0) {
                statut = "Payé";
                resteAPayer = BigDecimal.ZERO;
            } else if (montantPaye.compareTo(BigDecimal.ZERO) > 0) {
                statut = "Partiel";
            }
        }
    }
}
