package com.sms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClasseMatiereCreateDTO {
    @NotNull(message = "L'ID de matièreNiveau est obligatoire")
    private Long matiereNiveauId;

    @NotNull(message = "Le coefficient est obligatoire")
    private Integer coefficient;
}
