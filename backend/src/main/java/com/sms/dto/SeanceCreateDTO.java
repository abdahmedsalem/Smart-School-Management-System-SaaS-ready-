package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeanceCreateDTO {
    private Long classeId;
    private Long matiereId;
    private Long professeurId;
    private Long salleId;
    private Integer jourSemaine;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String anneeScolaire;
}
