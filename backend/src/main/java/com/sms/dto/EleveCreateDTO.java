package com.sms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EleveCreateDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String dateNaissance;
    private String lieuNaissance;
    private String sexe;
    private String nationalite;
    private String adresse;
    private String wilaya;
    private String moughataa;

    // Parents/Tuteurs
    private String nomPere;
    private String professionPere;
    private String telPere;
    private String emailPere;
    private String nomMere;
    private String professionMere;
    private String telMere;
    private String tuteurNom;
    private String tuteurTel;
    private String tuteurRelation;

    // Scolarité
    private Long classeId;
    private String ancienEtablissement;

    // Santé
    private String groupeSanguin;
    private String allergies;
    private String maladiesChroniques;
    private String contactUrgence;
}
