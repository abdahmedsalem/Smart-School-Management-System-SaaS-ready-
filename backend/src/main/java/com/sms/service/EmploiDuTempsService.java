package com.sms.service;

import com.sms.dto.SeanceCreateDTO;
import com.sms.dto.SeanceDTO;
import com.sms.entity.Seance;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmploiDuTempsService {

    private final SeanceRepository seanceRepository;
    private final ClasseRepository classeRepository;
    private final MatiereRepository matiereRepository;
    private final PersonnelRepository personnelRepository;
    private final SalleRepository salleRepository;

    private static final String[] JOURS = {"", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};

    public List<SeanceDTO> getAllSeances() {
        return seanceRepository.findByActifTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SeanceDTO getSeanceById(Long id) {
        Seance seance = seanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Séance non trouvée avec l'id: " + id));
        return toDTO(seance);
    }

    public List<SeanceDTO> getEmploiDuTempsByClasse(Long classeId) {
        return seanceRepository.findEmploiDuTempsByClasse(classeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SeanceDTO> getEmploiDuTempsByProfesseur(Long professeurId) {
        return seanceRepository.findEmploiDuTempsByProfesseur(professeurId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SeanceDTO> getSeancesByJour(Integer jourSemaine) {
        return seanceRepository.findByJourSemaine(jourSemaine).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SeanceDTO> getSeancesBySalle(Long salleId) {
        return seanceRepository.findBySalleId(salleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Retourne l'emploi du temps structuré par jour
    public Map<String, List<SeanceDTO>> getEmploiDuTempsStructure(Long classeId) {
        List<SeanceDTO> seances = getEmploiDuTempsByClasse(classeId);
        Map<String, List<SeanceDTO>> emploiDuTemps = new LinkedHashMap<>();

        for (int i = 1; i <= 6; i++) { // Lundi à Samedi
            String jour = JOURS[i];
            final int jourNum = i;
            List<SeanceDTO> seancesJour = seances.stream()
                    .filter(s -> s.getJourSemaine() == jourNum)
                    .sorted(Comparator.comparing(SeanceDTO::getHeureDebut))
                    .collect(Collectors.toList());
            emploiDuTemps.put(jour, seancesJour);
        }

        return emploiDuTemps;
    }

    @Transactional
    public SeanceDTO createSeance(SeanceCreateDTO dto) {
        Seance seance = new Seance();
        mapDtoToEntity(dto, seance);
        seance.setActif(true);
        return toDTO(seanceRepository.save(seance));
    }

    @Transactional
    public SeanceDTO updateSeance(Long id, SeanceCreateDTO dto) {
        Seance seance = seanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Séance non trouvée avec l'id: " + id));
        mapDtoToEntity(dto, seance);
        return toDTO(seanceRepository.save(seance));
    }

    @Transactional
    public void deleteSeance(Long id) {
        Seance seance = seanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Séance non trouvée avec l'id: " + id));
        seance.setActif(false);
        seanceRepository.save(seance);
    }

    @Transactional
    public void hardDeleteSeance(Long id) {
        if (!seanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Séance non trouvée avec l'id: " + id);
        }
        seanceRepository.deleteById(id);
    }

    // Vérification des conflits d'horaire
    public List<String> verifierConflits(SeanceCreateDTO dto) {
        List<String> conflits = new ArrayList<>();

        // Vérifier conflit de salle
        List<Seance> seancesSalle = seanceRepository.findBySalleId(dto.getSalleId());
        for (Seance s : seancesSalle) {
            if (s.getJourSemaine().equals(dto.getJourSemaine()) && s.getActif()) {
                if (horairesSeChevanchent(s, dto)) {
                    conflits.add("Conflit de salle: " + s.getSalle().getNom() + " déjà occupée");
                }
            }
        }

        // Vérifier conflit de professeur
        List<Seance> seancesProf = seanceRepository.findByProfesseurId(dto.getProfesseurId());
        for (Seance s : seancesProf) {
            if (s.getJourSemaine().equals(dto.getJourSemaine()) && s.getActif()) {
                if (horairesSeChevanchent(s, dto)) {
                    conflits.add("Conflit de professeur: déjà en cours à cette heure");
                }
            }
        }

        // Vérifier conflit de classe
        List<Seance> seancesClasse = seanceRepository.findByClasseId(dto.getClasseId());
        for (Seance s : seancesClasse) {
            if (s.getJourSemaine().equals(dto.getJourSemaine()) && s.getActif()) {
                if (horairesSeChevanchent(s, dto)) {
                    conflits.add("Conflit de classe: déjà un cours prévu à cette heure");
                }
            }
        }

        return conflits;
    }

    private boolean horairesSeChevanchent(Seance seance, SeanceCreateDTO dto) {
        return !(dto.getHeureFin().isBefore(seance.getHeureDebut()) ||
                 dto.getHeureDebut().isAfter(seance.getHeureFin()));
    }

    private void mapDtoToEntity(SeanceCreateDTO dto, Seance seance) {
        seance.setJourSemaine(dto.getJourSemaine());
        seance.setHeureDebut(dto.getHeureDebut());
        seance.setHeureFin(dto.getHeureFin());
        seance.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");

        if (dto.getClasseId() != null) {
            seance.setClasse(classeRepository.findById(dto.getClasseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classe non trouvée")));
        }
        if (dto.getMatiereId() != null) {
            seance.setMatiere(matiereRepository.findById(dto.getMatiereId()).orElse(null));
        }
        if (dto.getProfesseurId() != null) {
            seance.setProfesseur(personnelRepository.findById(dto.getProfesseurId()).orElse(null));
        }
        if (dto.getSalleId() != null) {
            seance.setSalle(salleRepository.findById(dto.getSalleId()).orElse(null));
        }
    }

    private SeanceDTO toDTO(Seance seance) {
        SeanceDTO dto = SeanceDTO.builder()
                .id(seance.getId())
                .jourSemaine(seance.getJourSemaine())
                .jourNom(seance.getJourSemaine() != null && seance.getJourSemaine() > 0 && seance.getJourSemaine() < 8
                        ? JOURS[seance.getJourSemaine()] : "")
                .heureDebut(seance.getHeureDebut())
                .heureFin(seance.getHeureFin())
                .anneeScolaire(seance.getAnneeScolaire())
                .actif(seance.getActif())
                .build();

        if (seance.getClasse() != null) {
            dto.setClasseId(seance.getClasse().getId());
            dto.setClasse(seance.getClasse().getNom());
        }
        if (seance.getMatiere() != null) {
            dto.setMatiereId(seance.getMatiere().getId());
            dto.setMatiere(seance.getMatiere().getNom());
        }
        if (seance.getProfesseur() != null) {
            dto.setProfesseurId(seance.getProfesseur().getId());
            String nomComplet = seance.getProfesseur().getPrenom() != null
                ? seance.getProfesseur().getPrenom() + " " + seance.getProfesseur().getNom()
                : seance.getProfesseur().getNom();
            dto.setProfesseur(nomComplet);
        }
        if (seance.getSalle() != null) {
            dto.setSalleId(seance.getSalle().getId());
            dto.setSalle(seance.getSalle().getNom());
        }

        return dto;
    }
}
