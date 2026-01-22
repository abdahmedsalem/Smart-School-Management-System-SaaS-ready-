package com.sms.service;

import com.sms.dto.MatiereDTO;
import com.sms.dto.PeriodeDTO;
import com.sms.entity.Matiere;
import com.sms.entity.Periode;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.MatiereRepository;
import com.sms.repository.PeriodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatiereService {

    private final MatiereRepository matiereRepository;
    private final PeriodeRepository periodeRepository;

    // Matières - Simplifié (seulement id, nom, code)
    public List<MatiereDTO> getAllMatieres() {
        return matiereRepository.findAll().stream()
                .map(this::toMatiereDTO)
                .collect(Collectors.toList());
    }

    public MatiereDTO getMatiereById(Long id) {
        Matiere matiere = matiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id));
        return toMatiereDTO(matiere);
    }

    @Transactional
    public MatiereDTO createMatiere(MatiereDTO dto) {
        Matiere matiere = Matiere.builder()
                .nom(dto.getNom())
                .code(dto.getCode())
                .build();

        return toMatiereDTO(matiereRepository.save(matiere));
    }

    @Transactional
    public MatiereDTO updateMatiere(Long id, MatiereDTO dto) {
        Matiere matiere = matiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id));

        if (dto.getNom() != null) matiere.setNom(dto.getNom());
        if (dto.getCode() != null) matiere.setCode(dto.getCode());

        return toMatiereDTO(matiereRepository.save(matiere));
    }

    @Transactional
    public void deleteMatiere(Long id) {
        Matiere matiere = matiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id));
        matiereRepository.delete(matiere);
    }

    // Périodes
    public List<PeriodeDTO> getAllPeriodes() {
        return periodeRepository.findByActifTrueOrderByOrdre().stream()
                .map(this::toPeriodeDTO)
                .collect(Collectors.toList());
    }

    public PeriodeDTO getPeriodeById(Long id) {
        Periode periode = periodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Période non trouvée avec l'id: " + id));
        return toPeriodeDTO(periode);
    }

    public List<PeriodeDTO> getPeriodesByAnneeScolaire(String anneeScolaire) {
        return periodeRepository.findByAnneeScolaireOrderByOrdre(anneeScolaire).stream()
                .map(this::toPeriodeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PeriodeDTO createPeriode(PeriodeDTO dto) {
        Periode periode = new Periode();
        periode.setNom(dto.getNom());
        periode.setDateDebut(dto.getDateDebut());
        periode.setDateFin(dto.getDateFin());
        periode.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");
        periode.setOrdre(dto.getOrdre());
        periode.setActif(true);

        return toPeriodeDTO(periodeRepository.save(periode));
    }

    @Transactional
    public PeriodeDTO updatePeriode(Long id, PeriodeDTO dto) {
        Periode periode = periodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Période non trouvée avec l'id: " + id));

        if (dto.getNom() != null) periode.setNom(dto.getNom());
        if (dto.getDateDebut() != null) periode.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) periode.setDateFin(dto.getDateFin());
        if (dto.getAnneeScolaire() != null) periode.setAnneeScolaire(dto.getAnneeScolaire());
        if (dto.getOrdre() != null) periode.setOrdre(dto.getOrdre());
        if (dto.getActif() != null) periode.setActif(dto.getActif());

        return toPeriodeDTO(periodeRepository.save(periode));
    }

    private MatiereDTO toMatiereDTO(Matiere matiere) {
        return MatiereDTO.builder()
                .id(matiere.getId())
                .nom(matiere.getNom())
                .code(matiere.getCode())
                .build();
    }

    private PeriodeDTO toPeriodeDTO(Periode periode) {
        return PeriodeDTO.builder()
                .id(periode.getId())
                .nom(periode.getNom())
                .dateDebut(periode.getDateDebut())
                .dateFin(periode.getDateFin())
                .anneeScolaire(periode.getAnneeScolaire())
                .ordre(periode.getOrdre())
                .actif(periode.getActif())
                .build();
    }
}
