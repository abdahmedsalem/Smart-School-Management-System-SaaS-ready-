package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeanceDTO {
    private Long id;
    private Long classeId;
    private String classe;
    private Long matiereId;
    private String matiere;
    private Long professeurId;
    private String professeur;
    private Long salleId;
    private String salle;
    private Integer jourSemaine;
    private String jourNom;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String anneeScolaire;
    private Boolean actif;
}
