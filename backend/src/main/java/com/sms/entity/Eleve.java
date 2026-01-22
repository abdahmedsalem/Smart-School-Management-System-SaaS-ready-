package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "eleves")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Eleve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "date_naissance")
    private String dateNaissance;

    @Column(name = "lieu_naissance")
    private String lieuNaissance;

    private String sexe;

    private String nationalite;

    private String adresse;

    private String wilaya;

    private String moughataa;

    // Parents/Tuteurs
    @Column(name = "nom_pere")
    private String nomPere;

    @Column(name = "profession_pere")
    private String professionPere;

    @Column(name = "tel_pere")
    private String telPere;

    @Column(name = "email_pere")
    private String emailPere;

    @Column(name = "nom_mere")
    private String nomMere;

    @Column(name = "profession_mere")
    private String professionMere;

    @Column(name = "tel_mere")
    private String telMere;

    @Column(name = "tuteur_nom")
    private String tuteurNom;

    @Column(name = "tuteur_tel")
    private String tuteurTel;

    @Column(name = "tuteur_relation")
    private String tuteurRelation;

    // Scolarité
    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @Column(name = "ancien_etablissement")
    private String ancienEtablissement;

    @Column(name = "date_inscription")
    private String dateInscription;

    @Column(name = "numero_inscription")
    private String numeroInscription;

    // Santé
    @Column(name = "groupe_sanguin")
    private String groupeSanguin;

    private String allergies;

    @Column(name = "maladies_chroniques")
    private String maladiesChroniques;

    @Column(name = "contact_urgence")
    private String contactUrgence;

    // Statut
    @Column(nullable = false)
    private String statut = "Actif";

    @Column(name = "annee_scolaire")
    private String anneeScolaire;
}
