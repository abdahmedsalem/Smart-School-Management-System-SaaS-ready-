package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    @ToString.Exclude
    private Cycle cycle;

    @Column(columnDefinition = "TEXT")
    private String matieres;
}
