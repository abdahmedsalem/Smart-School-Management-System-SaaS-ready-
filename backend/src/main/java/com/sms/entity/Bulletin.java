package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bulletins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bulletin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @ManyToOne
    @JoinColumn(name = "periode_id", nullable = false)
    private Periode periode;

    @Column(name = "moyenne_generale", precision = 5, scale = 2)
    private BigDecimal moyenneGenerale;

    private Integer rang;

    @Column(name = "total_eleves")
    private Integer totalEleves;

    @Column(columnDefinition = "TEXT")
    private String appreciation;

    @Column(name = "date_generation")
    private LocalDate dateGeneration;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;

    @Column(length = 30)
    private String decision; // Admis, Redoublant, Passage conditionnel
}
