package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "personnel")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Personnel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String matricule;

    @Column(nullable = false)
    private String nom;

    private String prenom;

    @Column(length = 10)
    private String sexe;

    private String telephone;

    private String email;

    private String specialite;

    private String diplome;

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    @Column(length = 30)
    private String statut = "actif"; // actif, conge, inactif

    @Column(precision = 10, scale = 2)
    private BigDecimal salaire;

    private String fonction; // Enseignant, Directeur, Secretaire, Comptable, etc.

    private String departement;

    @Column(length = 20)
    private String type; // enseignant, admin

    private String adresse;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;
}
