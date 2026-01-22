package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceDTO {
    private Long id;
    private Long eleveId;
    private String eleveNom;
    private String elevePrenom;
    private String eleveMatricule;
    private String eleveClasse;
    private Long seanceId;
    private String seanceMatiere;
    private LocalDate date;
    private String statut;
    private LocalTime heureArrivee;
    private Integer minutesRetard;
    private Boolean justifie;
    private String motif;
    private String anneeScolaire;
    private String commentaire;
}
