package com.sms.service;

import com.sms.dto.ClasseMatiereDTO;
import com.sms.entity.Classe;
import com.sms.entity.ClasseMatiere;
import com.sms.entity.MatiereNiveau;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ClasseMatiereRepository;
import com.sms.repository.ClasseRepository;
import com.sms.repository.MatiereNiveauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClasseMatiereService {

    private final ClasseMatiereRepository classeMatiereRepository;
    private final ClasseRepository classeRepository;
    private final MatiereNiveauRepository matiereNiveauRepository;

    public List<ClasseMatiereDTO> getAllClassesMatieres() {
        return classeMatiereRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ClasseMatiereDTO> getClasseMatieresByClasse(Long classeId) {
        return classeMatiereRepository.findByClasseId(classeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ClasseMatiereDTO> getClasseMatieresByMatiereNiveau(Long matiereNiveauId) {
        return classeMatiereRepository.findByMatiereNiveauId(matiereNiveauId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ClasseMatiereDTO getClasseMatiereById(Long id) {
        ClasseMatiere classeMatiere = classeMatiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClasseMatiere non trouvée avec l'id: " + id));
        return toDTO(classeMatiere);
    }

    @Transactional
    public ClasseMatiereDTO createClasseMatiere(Long classeId, Long matiereNiveauId, Integer coefficient) {
        Classe classe = classeRepository.findById(classeId)
                .orElseThrow(() -> new ResourceNotFoundException("Classe non trouvée avec l'id: " + classeId));

        MatiereNiveau matiereNiveau = matiereNiveauRepository.findById(matiereNiveauId)
                .orElseThrow(() -> new ResourceNotFoundException("MatiereNiveau non trouvée avec l'id: " + matiereNiveauId));

        ClasseMatiere classeMatiere = ClasseMatiere.builder()
                .coefficient(coefficient)
                .classe(classe)
                .matiereNiveau(matiereNiveau)
                .build();

        return toDTO(classeMatiereRepository.save(classeMatiere));
    }

    @Transactional
    public ClasseMatiereDTO updateClasseMatiere(Long id, Integer coefficient) {
        ClasseMatiere classeMatiere = classeMatiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClasseMatiere non trouvée avec l'id: " + id));

        if (coefficient != null) {
            classeMatiere.setCoefficient(coefficient);
        }

        return toDTO(classeMatiereRepository.save(classeMatiere));
    }

    @Transactional
    public void deleteClasseMatiere(Long id) {
        ClasseMatiere classeMatiere = classeMatiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClasseMatiere non trouvée avec l'id: " + id));
        classeMatiereRepository.delete(classeMatiere);
    }

    private ClasseMatiereDTO toDTO(ClasseMatiere classeMatiere) {
        return ClasseMatiereDTO.builder()
                .id(classeMatiere.getId())
                .coefficient(classeMatiere.getCoefficient())
                .classeId(classeMatiere.getClasse().getId())
                .classeNom(classeMatiere.getClasse().getNom())
                .matiereNiveauId(classeMatiere.getMatiereNiveau().getId())
                .matiereId(classeMatiere.getMatiereNiveau().getMatiere().getId())
                .matiereNom(classeMatiere.getMatiereNiveau().getMatiere().getNom())
                .matiereCode(classeMatiere.getMatiereNiveau().getMatiere().getCode())
                .niveauNom(classeMatiere.getMatiereNiveau().getNiveau().getNom())
                .build();
    }
}
