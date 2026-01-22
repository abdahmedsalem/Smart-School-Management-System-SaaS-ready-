package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresenceCreateDTO {
    private Long eleveId;
    private Long seanceId;
    private LocalDate date;
    private String statut;
    private LocalTime heureArrivee;
    private Integer minutesRetard;
    private Boolean justifie;
    private String motif;
    private String anneeScolaire;
    private String commentaire;
}
