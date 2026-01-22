package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClasseDTO {
    private Long id;
    private String nom;
    private Long cycleId;
    private String cycle;
    private Long niveauId;
    private String niveau;
    private Long specialiteId;
    private String specialite;
    private Integer capacite;
    private Integer effectif;
    private String salle;
    private String statut;
    private String anneeScolaire;
    private List<ClasseMatiereDTO> classeMatieres;
}
