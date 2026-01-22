package com.sms.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EleveDTO {
    private Long id;
    private String matricule;
    private String nom;
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
    private String classe;
    private String niveau;
    private String cycle;
    private String ancienEtablissement;
    private String dateInscription;
    private String numeroInscription;

    // Santé
    private String groupeSanguin;
    private String allergies;
    private String maladiesChroniques;
    private String contactUrgence;

    // Statut
    private String statut;
    private String anneeScolaire;
}
