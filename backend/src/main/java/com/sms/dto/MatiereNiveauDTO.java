package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatiereNiveauDTO {
    private Long id;
    private Integer coefficient;
    private Long matiereId;
    private String matiereNom;
    private String matiereCode;
    private Long niveauId;
    private String niveauNom;
}
