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
public class NoteDTO {
    private Long id;
    private Long eleveId;
    private String eleveNom;
    private String elevePrenom;
    private String eleveMatricule;
    private Long matiereId;
    private String matiere;
    private Long examenId;
    private String examenNom;
    private Long periodeId;
    private String periode;
    private BigDecimal valeur;
    private String type;
    private LocalDate dateNote;
    private String commentaire;
    private String anneeScolaire;
}
