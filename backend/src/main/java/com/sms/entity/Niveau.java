package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "niveaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Niveau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private Integer ordre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    @ToString.Exclude
    private Cycle cycle;
}
