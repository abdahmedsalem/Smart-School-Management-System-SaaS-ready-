package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "resultats_examens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultatExamen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "examen_id", nullable = false)
    private Examen examen;

    @ManyToOne
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @Column(name = "note_obtenue", precision = 5, scale = 2)
    private BigDecimal noteObtenue;

    private Integer rang;

    private String appreciation;

    private Boolean absent = false;
}
