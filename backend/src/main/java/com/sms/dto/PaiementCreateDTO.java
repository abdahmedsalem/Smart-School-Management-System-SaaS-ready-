package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaiementCreateDTO {
    private Long eleveId;
    private Long typeFraisId;
    private BigDecimal montant;
    private BigDecimal montantPaye;
    private String modePaiement;
    private String referencePaiement;
    private LocalDate datePaiement;
    private LocalDate dateEcheance;
    private String moisConcerne;
    private String anneeScolaire;
    private String commentaire;
}
