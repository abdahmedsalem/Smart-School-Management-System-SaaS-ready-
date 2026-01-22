package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteCreateDTO {
    private Long eleveId;
    private Long matiereId; // Deprecated - use classeMatiereId instead
    private Long classeMatiereId; // Primary field - ID from classe_matieres table
    private Long examenId;
    private Long periodeId;
    private BigDecimal valeur;
    private String type;
    private LocalDate dateNote;
    private String commentaire;
    private String anneeScolaire;
    private Boolean absent; // True si l'élève était absent (note non comptabilisée)
}
