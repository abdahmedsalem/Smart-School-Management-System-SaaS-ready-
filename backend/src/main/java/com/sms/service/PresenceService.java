package com.sms.service;

import com.sms.dto.PresenceCreateDTO;
import com.sms.dto.PresenceDTO;
import com.sms.entity.Eleve;
import com.sms.entity.Presence;
import com.sms.entity.Seance;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.EleveRepository;
import com.sms.repository.PresenceRepository;
import com.sms.repository.SeanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final PresenceRepository presenceRepository;
    private final EleveRepository eleveRepository;
    private final SeanceRepository seanceRepository;

    public List<PresenceDTO> getAllPresences() {
        return presenceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PresenceDTO getPresenceById(Long id) {
        Presence presence = presenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Présence non trouvée avec l'id: " + id));
        return toDTO(presence);
    }

    public List<PresenceDTO> getPresencesByEleve(Long eleveId) {
        return presenceRepository.findByEleveId(eleveId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PresenceDTO> getPresencesByEleveAndDateRange(Long eleveId, LocalDate debut, LocalDate fin) {
        return presenceRepository.findByEleveIdAndDatePresenceBetween(eleveId, debut, fin).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PresenceDTO> getPresencesByClasseAndDate(Long classeId, LocalDate date) {
        return presenceRepository.findByClasseAndDate(classeId, date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PresenceDTO> getPresencesByDate(LocalDate date) {
        return presenceRepository.findByDatePresence(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PresenceDTO createPresence(PresenceCreateDTO dto) {
        Presence presence = new Presence();
        mapDtoToEntity(dto, presence);
        return toDTO(presenceRepository.save(presence));
    }

    @Transactional
    public List<PresenceDTO> enregistrerPresencesClasse(Long classeId, LocalDate date, Long seanceId, List<PresenceCreateDTO> presences) {
        return presences.stream()
                .map(dto -> {
                    dto.setDate(date);
                    dto.setSeanceId(seanceId);
                    return createPresence(dto);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public PresenceDTO updatePresence(Long id, PresenceCreateDTO dto) {
        Presence presence = presenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Présence non trouvée avec l'id: " + id));
        mapDtoToEntity(dto, presence);
        return toDTO(presenceRepository.save(presence));
    }

    @Transactional
    public PresenceDTO justifierAbsence(Long id, String motif) {
        Presence presence = presenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Présence non trouvée avec l'id: " + id));
        presence.setJustifie(true);
        presence.setMotif(motif);
        return toDTO(presenceRepository.save(presence));
    }

    @Transactional
    public void deletePresence(Long id) {
        if (!presenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Présence non trouvée avec l'id: " + id);
        }
        presenceRepository.deleteById(id);
    }

    public Map<String, Object> getStatsPresenceEleve(Long eleveId, String anneeScolaire) {
        Map<String, Object> stats = new HashMap<>();
        Long totalPresent = presenceRepository.countByEleveAndStatut(eleveId, "present", anneeScolaire);
        Long totalAbsent = presenceRepository.countByEleveAndStatut(eleveId, "absent", anneeScolaire);
        Long totalRetard = presenceRepository.countByEleveAndStatut(eleveId, "retard", anneeScolaire);
        Long absencesNonJustifiees = presenceRepository.countAbsencesNonJustifiees(eleveId, anneeScolaire);

        Long total = totalPresent + totalAbsent + totalRetard;
        BigDecimal tauxPresence = BigDecimal.ZERO;
        if (total > 0) {
            tauxPresence = BigDecimal.valueOf(totalPresent)
                    .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        stats.put("totalPresent", totalPresent);
        stats.put("totalAbsent", totalAbsent);
        stats.put("totalRetard", totalRetard);
        stats.put("absencesNonJustifiees", absencesNonJustifiees);
        stats.put("tauxPresence", tauxPresence);
        return stats;
    }

    public Map<String, Object> getStatsPresencesGlobales(String anneeScolaire) {
        Map<String, Object> stats = new HashMap<>();
        Long totalPresences = presenceRepository.countTotalPresences(anneeScolaire);
        Long totalPresent = presenceRepository.countTotalByStatut("present", anneeScolaire);
        Long totalAbsent = presenceRepository.countTotalByStatut("absent", anneeScolaire);
        Long totalRetard = presenceRepository.countTotalByStatut("retard", anneeScolaire);

        BigDecimal tauxPresence = BigDecimal.ZERO;
        if (totalPresences > 0) {
            tauxPresence = BigDecimal.valueOf(totalPresent)
                    .divide(BigDecimal.valueOf(totalPresences), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        stats.put("totalAbsences", totalAbsent);
        stats.put("totalRetards", totalRetard);
        stats.put("tauxPresence", tauxPresence);
        return stats;
    }

    private void mapDtoToEntity(PresenceCreateDTO dto, Presence presence) {
        presence.setDatePresence(dto.getDate());
        presence.setStatut(dto.getStatut());
        presence.setHeureArrivee(dto.getHeureArrivee());
        presence.setMinutesRetard(dto.getMinutesRetard());
        presence.setJustifie(dto.getJustifie() != null ? dto.getJustifie() : false);
        presence.setMotif(dto.getMotif());
        presence.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");
        presence.setCommentaire(dto.getCommentaire());

        if (dto.getEleveId() != null) {
            presence.setEleve(eleveRepository.findById(dto.getEleveId())
                    .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé")));
        }
        if (dto.getSeanceId() != null) {
            presence.setSeance(seanceRepository.findById(dto.getSeanceId()).orElse(null));
        }
    }

    private PresenceDTO toDTO(Presence presence) {
        PresenceDTO dto = PresenceDTO.builder()
                .id(presence.getId())
                .date(presence.getDatePresence())
                .statut(presence.getStatut())
                .heureArrivee(presence.getHeureArrivee())
                .minutesRetard(presence.getMinutesRetard())
                .justifie(presence.getJustifie())
                .motif(presence.getMotif())
                .anneeScolaire(presence.getAnneeScolaire())
                .commentaire(presence.getCommentaire())
                .build();

        if (presence.getEleve() != null) {
            Eleve eleve = presence.getEleve();
            dto.setEleveId(eleve.getId());
            dto.setEleveNom(eleve.getNom());
            dto.setElevePrenom(eleve.getPrenom());
            dto.setEleveMatricule(eleve.getMatricule());
            if (eleve.getClasse() != null) {
                dto.setEleveClasse(eleve.getClasse().getNom());
            }
        }
        if (presence.getSeance() != null) {
            dto.setSeanceId(presence.getSeance().getId());
            if (presence.getSeance().getMatiere() != null) {
                dto.setSeanceMatiere(presence.getSeance().getMatiere().getNom());
            }
        }

        return dto;
    }
}
