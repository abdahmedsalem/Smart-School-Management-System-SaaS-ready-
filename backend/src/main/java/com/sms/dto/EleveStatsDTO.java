package com.sms.dto;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EleveStatsDTO {
    private long totalEleves;
    private long elevesActifs;
    private long elevesInactifs;
    private Map<String, Long> parWilaya;
    private Map<String, Long> parClasse;
}
