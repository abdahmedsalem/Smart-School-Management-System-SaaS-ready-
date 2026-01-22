package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "niveau_id", nullable = false)
    @ToString.Exclude
    private Niveau niveau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    @ToString.Exclude
    private Specialite specialite;

    @Column(nullable = false)
    private Integer capacite;

    @Builder.Default
    private Integer effectif = 0;

    private String salle;

    @Builder.Default
    @Column(nullable = false)
    private String statut = "Active";

    @Builder.Default
    @Column(name = "annee_scolaire")
    private String anneeScolaire = "2024-2025";
}
