package com.sms.mapper;

import com.sms.dto.*;
import com.sms.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class StructureMapper {

    public CycleDTO toDTO(Cycle entity) {
        if (entity == null) return null;
        return CycleDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .ordre(entity.getOrdre())
                .build();
    }

    public NiveauDTO toDTO(Niveau entity) {
        if (entity == null) return null;
        return NiveauDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .cycleId(entity.getCycle().getId())
                .ordre(entity.getOrdre())
                .build();
    }

    public SpecialiteDTO toDTO(Specialite entity) {
        if (entity == null) return null;
        return SpecialiteDTO.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .nom(entity.getNom())
                .cycleId(entity.getCycle().getId())
                .build();
    }

    public SalleDTO toDTO(Salle entity) {
        if (entity == null) return null;
        return SalleDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .capacite(entity.getCapacite())
                .type(entity.getType())
                .equipements(entity.getEquipements())
                .disponible(entity.getDisponible())
                .build();
    }

    public MatiereDTO toDTO(Matiere entity) {
        if (entity == null) return null;
        return MatiereDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .code(entity.getCode())
                .build();
    }

    public ClasseDTO toDTO(Classe entity) {
        if (entity == null) return null;
        return ClasseDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .cycleId(entity.getNiveau().getCycle().getId())
                .cycle(entity.getNiveau().getCycle().getNom())
                .niveauId(entity.getNiveau().getId())
                .niveau(entity.getNiveau().getNom())
                .specialiteId(entity.getSpecialite() != null ? entity.getSpecialite().getId() : null)
                .specialite(entity.getSpecialite() != null ? entity.getSpecialite().getNom() : null)
                .capacite(entity.getCapacite())
                .effectif(entity.getEffectif())
                .salle(entity.getSalle())
                .statut(entity.getStatut())
                .anneeScolaire(entity.getAnneeScolaire())
                .classeMatieres(null)  // Les ClasseMatieres seront chargées séparément via ClasseMatiereService
                .build();
    }
}
