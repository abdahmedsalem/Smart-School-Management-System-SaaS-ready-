package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClasseMatiereDTO {
    private Long id;
    private Integer coefficient;
    private Long classeId;
    private String classeNom;
    private Long matiereNiveauId;
    private Long matiereId;  // ID of the matiere (for compatibility with frontend filtering)
    private String matiereNom;
    private String matiereCode;
    private String niveauNom;
}
