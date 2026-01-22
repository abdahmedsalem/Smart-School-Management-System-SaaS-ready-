package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StructureStatsDTO {
    private Long totalClasses;
    private Long totalEleves;
    private Long totalCapacite;
    private Integer tauxRemplissage;
}
