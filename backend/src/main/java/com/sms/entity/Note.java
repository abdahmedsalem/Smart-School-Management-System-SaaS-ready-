package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "eleve_id", nullable = false)
    private Eleve eleve;

    @ManyToOne
    @JoinColumn(name = "matiere_id")
    private Matiere matiere; // Kept for backward compatibility, but use classeMatiere instead

    @ManyToOne
    @JoinColumn(name = "classe_matiere_id")
    private ClasseMatiere classeMatiere; // Primary relation - contains matiere + coefficient

    @ManyToOne
    @JoinColumn(name = "examen_id")
    private Examen examen;

    @ManyToOne
    @JoinColumn(name = "periode_id")
    private Periode periode;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal valeur;

    @Column(length = 50)
    private String type; // Devoir, Interrogation, Examen, Participation

    @Column(name = "date_note")
    private LocalDate dateNote;

    private String commentaire;

    @Column(name = "annee_scolaire")
    private String anneeScolaire;

    @Column(nullable = false)
    private Boolean absent = false; // True si l'élève était absent

    // Helper method to get Matiere from ClasseMatiere
    @Transient
    public Matiere getMatiereFromClasseMatiere() {
        return classeMatiere != null && classeMatiere.getMatiereNiveau() != null
                ? classeMatiere.getMatiereNiveau().getMatiere()
                : matiere;
    }

    // Helper method to get coefficient
    @Transient
    public Integer getCoefficient() {
        return classeMatiere != null ? classeMatiere.getCoefficient() : 1;
    }
}
