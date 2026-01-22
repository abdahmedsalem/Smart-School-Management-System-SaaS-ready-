package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodeDTO {
    private Long id;
    private String nom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String anneeScolaire;
    private Integer ordre;
    private Boolean actif;
}
