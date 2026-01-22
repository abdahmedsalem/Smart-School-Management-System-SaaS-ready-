package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "seances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    @ManyToOne
    @JoinColumn(name = "matiere_id")
    private Matiere matiere;

    @ManyToOne
    @JoinColumn(name = "professeur_id")
    private Personnel professeur;

    @ManyToOne
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @Column(name = "jour_semaine")
    private Integer jourSemaine; // 1=Lundi, 2=Mardi, etc.

    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;

    private Boolean actif = true;
}
