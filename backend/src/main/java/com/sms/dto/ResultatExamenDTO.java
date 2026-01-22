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
public class ResultatExamenDTO {
    private Long id;
    private Long examenId;
    private String examenNom;
    private Long eleveId;
    private String eleveNom;
    private String elevePrenom;
    private String eleveMatricule;
    private BigDecimal noteObtenue;
    private Integer rang;
    private String appreciation;
    private Boolean absent;
}
