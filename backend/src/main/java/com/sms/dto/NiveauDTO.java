package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NiveauDTO {
    private Long id;
    private String nom;
    private Long cycleId;
    private Integer ordre;
}
