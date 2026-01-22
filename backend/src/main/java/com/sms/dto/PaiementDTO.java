package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaiementDTO {
    private Long id;
    private Long eleveId;
    private String eleveNom;
    private String elevePrenom;
    private String eleveMatricule;
    private String eleveClasse;
    private Long typeFraisId;
    private String typeFraisCode;
    private BigDecimal montant;
    private BigDecimal montantPaye;
    private BigDecimal resteAPayer;
    private String modePaiement;
    private String referencePaiement;
    private LocalDate datePaiement;
    private LocalDate dateEcheance;
    private String statut;
    private String moisConcerne;
    private String anneeScolaire;
    private String commentaire;
}
