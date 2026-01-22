package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalleDTO {
    private Long id;
    private String nom;
    private Integer capacite;
    private String type;
    private String equipements;
    private Boolean disponible;
}
