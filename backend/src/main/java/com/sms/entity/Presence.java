package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "presences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Presence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @ManyToOne
    @JoinColumn(name = "seance_id")
    private Seance seance;

    @Column(name = "date_presence", nullable = false)
    private LocalDate datePresence;

    @Column(length = 30)
    private String statut; // present, absent, retard, excuse

    @Column(name = "heure_arrivee")
    private LocalTime heureArrivee;

    @Column(name = "minutes_retard")
    private Integer minutesRetard;

    private Boolean justifie = false;

    private String motif;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;

    private String commentaire;
}
