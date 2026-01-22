package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonnelDTO {
    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private String sexe;
    private String telephone;
    private String email;
    private String specialite;
    private String diplome;
    private LocalDate dateEmbauche;
    private String statut;
    private BigDecimal salaire;
    private String fonction;
    private String departement;
    private String type;
    private String adresse;
    private List<String> classes; // Pour les enseignants
}
