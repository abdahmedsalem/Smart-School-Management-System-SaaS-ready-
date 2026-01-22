package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cycles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(nullable = false)
    private Integer ordre;

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Niveau> niveaux = new ArrayList<>();

    @OneToMany(mappedBy = "cycle", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Specialite> specialites = new ArrayList<>();
}
