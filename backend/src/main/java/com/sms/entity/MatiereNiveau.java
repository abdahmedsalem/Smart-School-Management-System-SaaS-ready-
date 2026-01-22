package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "matiere_niveaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatiereNiveau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer coefficient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_id", nullable = false)
    @ToString.Exclude
    private Matiere matiere;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "niveau_id", nullable = false)
    @ToString.Exclude
    private Niveau niveau;
}
