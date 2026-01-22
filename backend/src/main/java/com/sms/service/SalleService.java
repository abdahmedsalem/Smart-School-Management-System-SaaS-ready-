package com.sms.service;

import com.sms.dto.SalleDTO;
import com.sms.entity.Salle;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalleService {

    private final SalleRepository salleRepository;

    public List<SalleDTO> getAllSalles(String type, Boolean disponible) {
        List<Salle> salles;
        if (type != null && disponible != null) {
            salles = salleRepository.findByTypeAndDisponible(type, disponible);
        } else if (type != null) {
            salles = salleRepository.findByType(type);
        } else if (disponible != null) {
            salles = salleRepository.findByDisponible(disponible);
        } else {
            salles = salleRepository.findAll();
        }
        return salles.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SalleDTO getSalleById(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));
        return toDTO(salle);
    }

    @Transactional
    public SalleDTO createSalle(SalleDTO dto) {
        Salle salle = new Salle();
        salle.setNom(dto.getNom());
        salle.setCapacite(dto.getCapacite());
        salle.setType(dto.getType());
        salle.setEquipements(dto.getEquipements());
        salle.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);
        return toDTO(salleRepository.save(salle));
    }

    @Transactional
    public SalleDTO updateSalle(Long id, SalleDTO dto) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));

        if (dto.getNom() != null) {
            salle.setNom(dto.getNom());
        }
        if (dto.getCapacite() != null) {
            salle.setCapacite(dto.getCapacite());
        }
        if (dto.getType() != null) {
            salle.setType(dto.getType());
        }
        if (dto.getEquipements() != null) {
            salle.setEquipements(dto.getEquipements());
        }
        if (dto.getDisponible() != null) {
            salle.setDisponible(dto.getDisponible());
        }

        return toDTO(salleRepository.save(salle));
    }

    @Transactional
    public void deleteSalle(Long id) {
        if (!salleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Salle", id);
        }
        salleRepository.deleteById(id);
    }

    private SalleDTO toDTO(Salle salle) {
        return SalleDTO.builder()
                .id(salle.getId())
                .nom(salle.getNom())
                .capacite(salle.getCapacite())
                .type(salle.getType())
                .equipements(salle.getEquipements())
                .disponible(salle.getDisponible())
                .build();
    }
}
