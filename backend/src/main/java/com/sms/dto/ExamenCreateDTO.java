package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamenCreateDTO {
    private String nom;
    private Long matiereId;
    private Long classeId;
    private Long periodeId;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Integer duree;
    private BigDecimal totalPoints;
    private Long salleId;
    private Long surveillantId;
    private String statut;
    private Long typeExamenId;
    private String anneeScolaire;
    private String commentaire;
}
