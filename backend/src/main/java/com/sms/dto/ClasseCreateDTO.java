package com.sms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClasseCreateDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "Le niveau est obligatoire")
    private Long niveauId;

    private Long specialiteId;

    @NotNull(message = "La capacité est obligatoire")
    @Min(value = 1, message = "La capacité doit être au moins 1")
    @Max(value = 100, message = "La capacité ne peut pas dépasser 100")
    private Integer capacite;

    private String salle;

    @Builder.Default
    private String statut = "Active";

    // Liste des IDs des matièreNiveau à assigner à la classe avec leurs coefficients
    private List<ClasseMatiereCreateDTO> classeMatieres;
}
