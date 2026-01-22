package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamenDTO {
    private Long id;
    private String nom;
    private Long matiereId;
    private String matiere;
    private Long classeId;
    private String classe;
    private Long periodeId;
    private String periode;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Integer duree;
    private BigDecimal totalPoints;
    private Long salleId;
    private String salle;
    private Long surveillantId;
    private String surveillant;
    private String statut;
    private Long typeExamenId;
    private String typeExamen;
    private String anneeScolaire;
    private String commentaire;
}
