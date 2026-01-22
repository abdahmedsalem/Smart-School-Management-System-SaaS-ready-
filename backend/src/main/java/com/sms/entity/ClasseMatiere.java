package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classe_matieres")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClasseMatiere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer coefficient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id", nullable = false)
    @ToString.Exclude
    private Classe classe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_niveau_id", nullable = false)
    @ToString.Exclude
    private MatiereNiveau matiereNiveau;
}
