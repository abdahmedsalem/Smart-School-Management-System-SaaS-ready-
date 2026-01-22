package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulletinDTO {
    private Long id;
    private Long eleveId;
    private String eleveNom;
    private String elevePrenom;
    private String eleveMatricule;
    private String eleveClasse;
    private Long periodeId;
    private String periode;
    private BigDecimal moyenneGenerale;
    private Integer rang;
    private Integer totalEleves;
    private String appreciation;
    private LocalDate dateGeneration;
    private String anneeScolaire;
    private String decision;
    private List<NoteMatiereDTO> notesMatieres;
}
