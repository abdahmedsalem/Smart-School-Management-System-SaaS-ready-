package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteMatiereDTO {
    private Long matiereId;
    private String matiere;
    private Integer coefficient;
    private BigDecimal moyenne;
    private BigDecimal moyenneClasse;
    private String appreciation;
}
