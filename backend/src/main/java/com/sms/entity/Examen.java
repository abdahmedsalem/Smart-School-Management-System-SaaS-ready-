package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "examens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Examen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @ManyToOne
    @JoinColumn(name = "matiere_id")
    private Matiere matiere;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @ManyToOne
    @JoinColumn(name = "periode_id")
    private Periode periode;

    @Column(name = "date_examen")
    private LocalDate dateExamen;

    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

    private Integer duree; // en minutes

    @Column(name = "total_points")
    private BigDecimal totalPoints;

    @ManyToOne
    @JoinColumn(name = "salle_id")
    private Salle salle;

    @ManyToOne
    @JoinColumn(name = "surveillant_id")
    private Personnel surveillant;

    @Column(length = 30)
    private String statut = "planifie"; // planifie, en_cours, termine, annule

    @ManyToOne
    @JoinColumn(name = "type_examen_id")
    private TypeExamen typeExamen;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;

    private String commentaire;
}
