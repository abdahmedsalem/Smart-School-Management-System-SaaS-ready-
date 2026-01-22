package com.sms.service;

import com.sms.dto.*;
import com.sms.entity.*;
import com.sms.exception.ResourceNotFoundException;
import com.sms.mapper.StructureMapper;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StructureService {

    private final CycleRepository cycleRepository;
    private final NiveauRepository niveauRepository;
    private final SpecialiteRepository specialiteRepository;
    private final PersonnelRepository personnelRepository;
    private final SalleRepository salleRepository;
    private final ClasseRepository classeRepository;
    private final MatiereRepository matiereRepository;
    private final ClasseMatiereRepository classeMatiereRepository;
    private final MatiereNiveauRepository matiereNiveauRepository;
    private final StructureMapper mapper;

    // ============ CYCLES ============
    public List<CycleDTO> getAllCycles() {
        return cycleRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // ============ NIVEAUX ============
    public List<NiveauDTO> getAllNiveaux(Long cycleId) {
        if (cycleId != null) {
            return niveauRepository.findByCycleIdOrderByOrdre(cycleId).stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());
        }
        return niveauRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // ============ SPECIALITES ============
    public List<SpecialiteDTO> getAllSpecialites(Long cycleId) {
        if (cycleId != null) {
            return specialiteRepository.findByCycleId(cycleId).stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());
        }
        return specialiteRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // ============ ENSEIGNANTS ============
    public List<PersonnelDTO> getAllEnseignants() {
        return personnelRepository.findAllEnseignantsActifs().stream()
                .map(this::toPersonnelDTO)
                .collect(Collectors.toList());
    }

    private PersonnelDTO toPersonnelDTO(Personnel p) {
        return PersonnelDTO.builder()
                .id(p.getId())
                .matricule(p.getMatricule())
                .nom(p.getNom())
                .prenom(p.getPrenom())
                .telephone(p.getTelephone())
                .email(p.getEmail())
                .specialite(p.getSpecialite())
                .fonction(p.getFonction())
                .statut(p.getStatut())
                .type(p.getType())
                .build();
    }

    // ============ SALLES ============
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
        return salles.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    // ============ MATIERES ============
    public List<String> getMatieresByCycle(String cycle, String specialite) {
        // Pour le Lycée avec spécialité, on cherche dans la table specialites
        if ("Lycée".equals(cycle) && specialite != null) {
            return specialiteRepository.findByNom(specialite)
                    .map(spec -> {
                        if (spec.getMatieres() != null) {
                            return Arrays.asList(spec.getMatieres().split(","));
                        }
                        return List.<String>of();
                    })
                    .orElse(List.of());
        }
        // Supprimé: utilisation de matiereCycleRepository (table supprimée)
        // Retourner une liste vide - les matières sont maintenant gérées via matiere_niveaux
        return List.of();
    }

    // ============ CLASSES ============
    public List<ClasseDTO> getAllClasses(Long cycleId, String statut, String search) {
        return classeRepository.findByFilters(cycleId, statut, search).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public ClasseDTO getClasseById(Long id) {
        return classeRepository.findById(id)
                .map(mapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Classe", id));
    }

    @Transactional
    public ClasseDTO createClasse(ClasseCreateDTO dto) {
        Classe classe = new Classe();
        populateClasse(classe, dto);
        classe.setEffectif(0);
        classe.setAnneeScolaire("2024-2025");
        Classe savedClasse = classeRepository.save(classe);

        // Ajouter automatiquement les matières du niveau à la classe
        assignMatieresFromNiveau(savedClasse);

        return mapper.toDTO(savedClasse);
    }

    /**
     * Assigne automatiquement toutes les matières du niveau à la classe nouvellement créée
     */
    private void assignMatieresFromNiveau(Classe classe) {
        List<MatiereNiveau> matieresNiveau = matiereNiveauRepository.findByNiveauId(classe.getNiveau().getId());

        List<ClasseMatiere> classeMatieres = new ArrayList<>();
        for (MatiereNiveau mn : matieresNiveau) {
            ClasseMatiere cm = ClasseMatiere.builder()
                    .classe(classe)
                    .matiereNiveau(mn)
                    .coefficient(mn.getCoefficient()) // Utilise le coefficient défini au niveau
                    .build();
            classeMatieres.add(cm);
        }

        classeMatiereRepository.saveAll(classeMatieres);
    }

    @Transactional
    public ClasseDTO updateClasse(Long id, ClasseCreateDTO dto) {
        Classe classe = classeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classe", id));
        populateClasse(classe, dto);
        return mapper.toDTO(classeRepository.save(classe));
    }

    @Transactional
    public ClasseDTO archiveClasse(Long id) {
        Classe classe = classeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classe", id));
        classe.setStatut("Archivée");
        return mapper.toDTO(classeRepository.save(classe));
    }

    @Transactional
    public void deleteClasse(Long id) {
        if (!classeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Classe", id);
        }
        classeRepository.deleteById(id);
    }

    // ============ STATS ============
    public StructureStatsDTO getStats() {
        Long totalClasses = classeRepository.countActiveClasses();
        Long totalEleves = classeRepository.sumEffectifActiveClasses();
        Long totalCapacite = classeRepository.sumCapaciteActiveClasses();

        Integer tauxRemplissage = 0;
        if (totalCapacite > 0) {
            tauxRemplissage = (int) Math.round((double) totalEleves / totalCapacite * 100);
        }

        return StructureStatsDTO.builder()
                .totalClasses(totalClasses)
                .totalEleves(totalEleves)
                .totalCapacite(totalCapacite)
                .tauxRemplissage(tauxRemplissage)
                .build();
    }

    // ============ HELPERS ============
    private void populateClasse(Classe classe, ClasseCreateDTO dto) {
        classe.setNom(dto.getNom());

        Niveau niveau = niveauRepository.findById(dto.getNiveauId())
                .orElseThrow(() -> new ResourceNotFoundException("Niveau", dto.getNiveauId()));
        classe.setNiveau(niveau);

        if (dto.getSpecialiteId() != null) {
            Specialite specialite = specialiteRepository.findById(dto.getSpecialiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Spécialité", dto.getSpecialiteId()));
            classe.setSpecialite(specialite);
        } else {
            classe.setSpecialite(null);
        }

        classe.setCapacite(dto.getCapacite());
        classe.setSalle(dto.getSalle());
        classe.setStatut(dto.getStatut() != null ? dto.getStatut() : "Active");

        // Les matières sont maintenant gérées via ClasseMatiere (table de liaison séparée)
        // Ce code sera géré par ClasseMatiereService
    }

    public List<MatiereNiveauDTO> getMatieresByClasse(Long classeId) {
        List<ClasseMatiere> classeMatieres = classeMatiereRepository.findByClasseId(classeId);
        return classeMatieres.stream()
                .map(cm -> {
                    MatiereNiveau mn = cm.getMatiereNiveau();
                    return MatiereNiveauDTO.builder()
                            .id(mn.getId())
                            .coefficient(cm.getCoefficient())
                            .matiereId(mn.getMatiere().getId())
                            .matiereNom(mn.getMatiere().getNom())
                            .matiereCode(mn.getMatiere().getCode())
                            .niveauId(mn.getNiveau().getId())
                            .niveauNom(mn.getNiveau().getNom())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
