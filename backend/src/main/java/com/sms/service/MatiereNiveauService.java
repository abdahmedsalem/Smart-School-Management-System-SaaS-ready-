package com.sms.service;

import com.sms.dto.MatiereNiveauDTO;
import com.sms.entity.Matiere;
import com.sms.entity.MatiereNiveau;
import com.sms.entity.Niveau;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.MatiereNiveauRepository;
import com.sms.repository.MatiereRepository;
import com.sms.repository.NiveauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatiereNiveauService {

    private final MatiereNiveauRepository matiereNiveauRepository;
    private final MatiereRepository matiereRepository;
    private final NiveauRepository niveauRepository;

    public List<MatiereNiveauDTO> getAllMatieresNiveaux() {
        return matiereNiveauRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MatiereNiveauDTO> getMatieresNiveauxByNiveau(Long niveauId) {
        return matiereNiveauRepository.findByNiveauId(niveauId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MatiereNiveauDTO> getMatieresNiveauxByCycle(Long cycleId) {
        return matiereNiveauRepository.findByCycleId(cycleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MatiereNiveauDTO> getMatieresNiveauxByMatiere(Long matiereId) {
        return matiereNiveauRepository.findByMatiereId(matiereId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MatiereNiveauDTO getMatiereNiveauById(Long id) {
        MatiereNiveau matiereNiveau = matiereNiveauRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MatiereNiveau non trouvée avec l'id: " + id));
        return toDTO(matiereNiveau);
    }

    @Transactional
    public MatiereNiveauDTO createMatiereNiveau(MatiereNiveauDTO dto) {
        Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + dto.getMatiereId()));

        Niveau niveau = niveauRepository.findById(dto.getNiveauId())
                .orElseThrow(() -> new ResourceNotFoundException("Niveau non trouvé avec l'id: " + dto.getNiveauId()));

        MatiereNiveau matiereNiveau = MatiereNiveau.builder()
                .coefficient(dto.getCoefficient())
                .matiere(matiere)
                .niveau(niveau)
                .build();

        return toDTO(matiereNiveauRepository.save(matiereNiveau));
    }

    @Transactional
    public MatiereNiveauDTO updateMatiereNiveau(Long id, MatiereNiveauDTO dto) {
        MatiereNiveau matiereNiveau = matiereNiveauRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MatiereNiveau non trouvée avec l'id: " + id));

        if (dto.getCoefficient() != null) {
            matiereNiveau.setCoefficient(dto.getCoefficient());
        }

        if (dto.getMatiereId() != null) {
            Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + dto.getMatiereId()));
            matiereNiveau.setMatiere(matiere);
        }

        if (dto.getNiveauId() != null) {
            Niveau niveau = niveauRepository.findById(dto.getNiveauId())
                    .orElseThrow(() -> new ResourceNotFoundException("Niveau non trouvé avec l'id: " + dto.getNiveauId()));
            matiereNiveau.setNiveau(niveau);
        }

        return toDTO(matiereNiveauRepository.save(matiereNiveau));
    }

    @Transactional
    public void deleteMatiereNiveau(Long id) {
        MatiereNiveau matiereNiveau = matiereNiveauRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MatiereNiveau non trouvée avec l'id: " + id));
        matiereNiveauRepository.delete(matiereNiveau);
    }

    private MatiereNiveauDTO toDTO(MatiereNiveau matiereNiveau) {
        return MatiereNiveauDTO.builder()
                .id(matiereNiveau.getId())
                .coefficient(matiereNiveau.getCoefficient())
                .matiereId(matiereNiveau.getMatiere().getId())
                .matiereNom(matiereNiveau.getMatiere().getNom())
                .matiereCode(matiereNiveau.getMatiere().getCode())
                .niveauId(matiereNiveau.getNiveau().getId())
                .niveauNom(matiereNiveau.getNiveau().getNom())
                .build();
    }
}
