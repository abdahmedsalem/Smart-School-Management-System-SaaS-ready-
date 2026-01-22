package com.sms.service;

import com.sms.dto.ExamenCreateDTO;
import com.sms.dto.ExamenDTO;
import com.sms.dto.ResultatExamenDTO;
import com.sms.entity.*;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final MatiereRepository matiereRepository;
    private final ClasseRepository classeRepository;
    private final PeriodeRepository periodeRepository;
    private final SalleRepository salleRepository;
    private final PersonnelRepository personnelRepository;
    private final ResultatExamenRepository resultatExamenRepository;
    private final EleveRepository eleveRepository;
    private final TypeExamenRepository typeExamenRepository;

    public List<ExamenDTO> getAllExamens() {
        return examenRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ExamenDTO getExamenById(Long id) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé avec l'id: " + id));
        return toDTO(examen);
    }

    public List<ExamenDTO> getExamensByClasse(Long classeId) {
        return examenRepository.findByClasseId(classeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ExamenDTO> getExamensByMatiere(Long matiereId) {
        return examenRepository.findByMatiereId(matiereId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ExamenDTO> getExamensByStatut(String statut) {
        return examenRepository.findByStatut(statut).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ExamenDTO> getExamensByDateRange(LocalDate debut, LocalDate fin) {
        return examenRepository.findByDateExamenBetween(debut, fin).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamenDTO createExamen(ExamenCreateDTO dto) {
        Examen examen = new Examen();
        mapDtoToEntity(dto, examen);
        return toDTO(examenRepository.save(examen));
    }

    @Transactional
    public ExamenDTO updateExamen(Long id, ExamenCreateDTO dto) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé avec l'id: " + id));
        mapDtoToEntity(dto, examen);
        return toDTO(examenRepository.save(examen));
    }

    @Transactional
    public ExamenDTO updateStatut(Long id, String statut) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé avec l'id: " + id));
        examen.setStatut(statut);
        return toDTO(examenRepository.save(examen));
    }

    @Transactional
    public void deleteExamen(Long id) {
        if (!examenRepository.existsById(id)) {
            throw new ResourceNotFoundException("Examen non trouvé avec l'id: " + id);
        }
        examenRepository.deleteById(id);
    }

    // Résultats d'examen
    public List<ResultatExamenDTO> getResultatsByExamen(Long examenId) {
        return resultatExamenRepository.findByExamenIdOrderByNoteDesc(examenId).stream()
                .map(this::toResultatDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResultatExamenDTO enregistrerResultat(Long examenId, Long eleveId, BigDecimal note, String appreciation) {
        Examen examen = examenRepository.findById(examenId)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé"));
        Eleve eleve = eleveRepository.findById(eleveId)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé"));

        ResultatExamen resultat = resultatExamenRepository.findByExamenIdAndEleveId(examenId, eleveId)
                .orElse(new ResultatExamen());

        resultat.setExamen(examen);
        resultat.setEleve(eleve);
        resultat.setNoteObtenue(note);
        resultat.setAppreciation(appreciation);
        resultat.setAbsent(false);

        return toResultatDTO(resultatExamenRepository.save(resultat));
    }

    @Transactional
    public void calculerRangs(Long examenId) {
        List<ResultatExamen> resultats = resultatExamenRepository.findByExamenIdOrderByNoteDesc(examenId);
        int rang = 1;
        for (ResultatExamen r : resultats) {
            if (!r.getAbsent()) {
                r.setRang(rang++);
                resultatExamenRepository.save(r);
            }
        }
    }

    public Map<String, Object> getStatsExamens(String anneeScolaire) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExamens", examenRepository.findByAnneeScolaire(anneeScolaire).size());
        stats.put("examensTermines", examenRepository.countByStatutAndAnneeScolaire("termine", anneeScolaire));
        stats.put("examensPlanifies", examenRepository.countByStatutAndAnneeScolaire("planifie", anneeScolaire));
        stats.put("examensEnCours", examenRepository.countByStatutAndAnneeScolaire("en_cours", anneeScolaire));
        return stats;
    }

    private void mapDtoToEntity(ExamenCreateDTO dto, Examen examen) {
        examen.setNom(dto.getNom());
        examen.setDateExamen(dto.getDate());
        examen.setHeureDebut(dto.getHeureDebut());
        examen.setHeureFin(dto.getHeureFin());
        examen.setDuree(dto.getDuree());
        examen.setTotalPoints(dto.getTotalPoints());
        examen.setStatut(dto.getStatut() != null ? dto.getStatut() : "planifie");
        examen.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");
        examen.setCommentaire(dto.getCommentaire());

        if (dto.getMatiereId() != null) {
            examen.setMatiere(matiereRepository.findById(dto.getMatiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée")));
        }
        if (dto.getClasseId() != null) {
            examen.setClasse(classeRepository.findById(dto.getClasseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classe non trouvée")));
        }
        if (dto.getPeriodeId() != null) {
            examen.setPeriode(periodeRepository.findById(dto.getPeriodeId()).orElse(null));
        }
        if (dto.getSalleId() != null) {
            examen.setSalle(salleRepository.findById(dto.getSalleId()).orElse(null));
        }
        if (dto.getSurveillantId() != null) {
            examen.setSurveillant(personnelRepository.findById(dto.getSurveillantId()).orElse(null));
        }
        if (dto.getTypeExamenId() != null) {
            examen.setTypeExamen(typeExamenRepository.findById(dto.getTypeExamenId())
                    .orElseThrow(() -> new ResourceNotFoundException("Type examen non trouvé")));
        }
    }

    private ExamenDTO toDTO(Examen examen) {
        ExamenDTO dto = ExamenDTO.builder()
                .id(examen.getId())
                .nom(examen.getNom())
                .date(examen.getDateExamen())
                .heureDebut(examen.getHeureDebut())
                .heureFin(examen.getHeureFin())
                .duree(examen.getDuree())
                .totalPoints(examen.getTotalPoints())
                .statut(examen.getStatut())
                .anneeScolaire(examen.getAnneeScolaire())
                .commentaire(examen.getCommentaire())
                .build();

        if (examen.getTypeExamen() != null) {
            dto.setTypeExamenId(examen.getTypeExamen().getId());
            dto.setTypeExamen(examen.getTypeExamen().getNom());
        }

        if (examen.getMatiere() != null) {
            dto.setMatiereId(examen.getMatiere().getId());
            dto.setMatiere(examen.getMatiere().getNom());
        }
        if (examen.getClasse() != null) {
            dto.setClasseId(examen.getClasse().getId());
            dto.setClasse(examen.getClasse().getNom());
        }
        if (examen.getPeriode() != null) {
            dto.setPeriodeId(examen.getPeriode().getId());
            dto.setPeriode(examen.getPeriode().getNom());
        }
        if (examen.getSalle() != null) {
            dto.setSalleId(examen.getSalle().getId());
            dto.setSalle(examen.getSalle().getNom());
        }
        if (examen.getSurveillant() != null) {
            dto.setSurveillantId(examen.getSurveillant().getId());
            String nomComplet = examen.getSurveillant().getPrenom() != null
                ? examen.getSurveillant().getPrenom() + " " + examen.getSurveillant().getNom()
                : examen.getSurveillant().getNom();
            dto.setSurveillant(nomComplet);
        }

        return dto;
    }

    private ResultatExamenDTO toResultatDTO(ResultatExamen resultat) {
        ResultatExamenDTO dto = ResultatExamenDTO.builder()
                .id(resultat.getId())
                .noteObtenue(resultat.getNoteObtenue())
                .rang(resultat.getRang())
                .appreciation(resultat.getAppreciation())
                .absent(resultat.getAbsent())
                .build();

        if (resultat.getExamen() != null) {
            dto.setExamenId(resultat.getExamen().getId());
            dto.setExamenNom(resultat.getExamen().getNom());
        }
        if (resultat.getEleve() != null) {
            dto.setEleveId(resultat.getEleve().getId());
            dto.setEleveNom(resultat.getEleve().getNom());
            dto.setElevePrenom(resultat.getEleve().getPrenom());
            dto.setEleveMatricule(resultat.getEleve().getMatricule());
        }

        return dto;
    }
}
