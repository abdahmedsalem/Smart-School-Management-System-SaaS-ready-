package com.sms.service;

import com.sms.dto.*;
import com.sms.entity.Classe;
import com.sms.entity.Eleve;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ClasseRepository;
import com.sms.repository.EleveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EleveService {

    private final EleveRepository eleveRepository;
    private final ClasseRepository classeRepository;

    public List<EleveDTO> getAllEleves(String search, Long classeId, String wilaya, String statut) {
        List<Eleve> eleves = eleveRepository.findWithFilters(search, classeId, wilaya, statut);
        return eleves.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EleveDTO getEleveById(Long id) {
        Eleve eleve = eleveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé avec l'id: " + id));
        return toDTO(eleve);
    }

    public EleveDTO getEleveByMatricule(String matricule) {
        Eleve eleve = eleveRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé avec le matricule: " + matricule));
        return toDTO(eleve);
    }

    @Transactional
    public EleveDTO createEleve(EleveCreateDTO dto) {
        Eleve eleve = new Eleve();
        mapCreateDTOToEntity(dto, eleve);

        // Générer matricule
        eleve.setMatricule(generateMatricule());
        eleve.setStatut("Actif");
        eleve.setAnneeScolaire("2024-2025");
        eleve.setDateInscription(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        eleve.setNumeroInscription(generateNumeroInscription());

        Eleve saved = eleveRepository.save(eleve);

        // Mettre à jour l'effectif de la classe
        if (saved.getClasse() != null) {
            Classe classe = saved.getClasse();
            classe.setEffectif(classe.getEffectif() + 1);
            classeRepository.save(classe);
        }

        return toDTO(saved);
    }

    @Transactional
    public EleveDTO updateEleve(Long id, EleveCreateDTO dto) {
        Eleve eleve = eleveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé avec l'id: " + id));

        Classe ancienneClasse = eleve.getClasse();
        mapCreateDTOToEntity(dto, eleve);
        Eleve saved = eleveRepository.save(eleve);

        // Gérer le changement de classe
        if (ancienneClasse != null && (saved.getClasse() == null || !ancienneClasse.getId().equals(saved.getClasse().getId()))) {
            ancienneClasse.setEffectif(Math.max(0, ancienneClasse.getEffectif() - 1));
            classeRepository.save(ancienneClasse);
        }
        if (saved.getClasse() != null && (ancienneClasse == null || !ancienneClasse.getId().equals(saved.getClasse().getId()))) {
            Classe nouvelleClasse = saved.getClasse();
            nouvelleClasse.setEffectif(nouvelleClasse.getEffectif() + 1);
            classeRepository.save(nouvelleClasse);
        }

        return toDTO(saved);
    }

    @Transactional
    public EleveDTO changeStatut(Long id, String statut) {
        Eleve eleve = eleveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé avec l'id: " + id));
        eleve.setStatut(statut);
        return toDTO(eleveRepository.save(eleve));
    }

    @Transactional
    public void deleteEleve(Long id) {
        Eleve eleve = eleveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé avec l'id: " + id));

        // Mettre à jour l'effectif de la classe
        if (eleve.getClasse() != null) {
            Classe classe = eleve.getClasse();
            classe.setEffectif(Math.max(0, classe.getEffectif() - 1));
            classeRepository.save(classe);
        }

        eleveRepository.delete(eleve);
    }

    public EleveStatsDTO getStats() {
        long total = eleveRepository.count();
        long actifs = eleveRepository.countActifs();
        long inactifs = eleveRepository.countInactifs();

        Map<String, Long> parWilaya = new HashMap<>();
        eleveRepository.countByWilaya().forEach(row -> {
            parWilaya.put((String) row[0], (Long) row[1]);
        });

        Map<String, Long> parClasse = new HashMap<>();
        eleveRepository.countByClasse().forEach(row -> {
            parClasse.put((String) row[0], (Long) row[1]);
        });

        return EleveStatsDTO.builder()
                .totalEleves(total)
                .elevesActifs(actifs)
                .elevesInactifs(inactifs)
                .parWilaya(parWilaya)
                .parClasse(parClasse)
                .build();
    }

    public List<String> getWilayas() {
        return List.of(
                "Nouakchott-Nord", "Nouakchott-Ouest", "Nouakchott-Sud",
                "Nouadhibou", "Atar", "Kaédi", "Rosso", "Zouérate",
                "Kiffa", "Néma", "Aioun", "Tidjikja", "Sélibaby"
        );
    }

    private String generateMatricule() {
        int year = LocalDate.now().getYear();
        // Utiliser timestamp pour garantir l'unicité
        long timestamp = System.currentTimeMillis() % 100000;
        int random = (int) (Math.random() * 900) + 100;
        return String.format("EL-%d-%05d%03d", year, timestamp, random);
    }

    private String generateNumeroInscription() {
        int year = LocalDate.now().getYear();
        int random = (int) (Math.random() * 9000) + 1000;
        return String.format("INS-%d-%04d", year, random);
    }

    private void mapCreateDTOToEntity(EleveCreateDTO dto, Eleve eleve) {
        eleve.setNom(dto.getNom());
        eleve.setPrenom(dto.getPrenom());
        eleve.setDateNaissance(dto.getDateNaissance());
        eleve.setLieuNaissance(dto.getLieuNaissance());
        eleve.setSexe(dto.getSexe());
        eleve.setNationalite(dto.getNationalite());
        eleve.setAdresse(dto.getAdresse());
        eleve.setWilaya(dto.getWilaya());
        eleve.setMoughataa(dto.getMoughataa());

        // Parents
        eleve.setNomPere(dto.getNomPere());
        eleve.setProfessionPere(dto.getProfessionPere());
        eleve.setTelPere(dto.getTelPere());
        eleve.setEmailPere(dto.getEmailPere());
        eleve.setNomMere(dto.getNomMere());
        eleve.setProfessionMere(dto.getProfessionMere());
        eleve.setTelMere(dto.getTelMere());
        eleve.setTuteurNom(dto.getTuteurNom());
        eleve.setTuteurTel(dto.getTuteurTel());
        eleve.setTuteurRelation(dto.getTuteurRelation());

        // Scolarité
        if (dto.getClasseId() != null) {
            Classe classe = classeRepository.findById(dto.getClasseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Classe non trouvée"));
            eleve.setClasse(classe);
        } else {
            eleve.setClasse(null);
        }
        eleve.setAncienEtablissement(dto.getAncienEtablissement());

        // Santé
        eleve.setGroupeSanguin(dto.getGroupeSanguin());
        eleve.setAllergies(dto.getAllergies());
        eleve.setMaladiesChroniques(dto.getMaladiesChroniques());
        eleve.setContactUrgence(dto.getContactUrgence());
    }

    private EleveDTO toDTO(Eleve eleve) {
        EleveDTO dto = EleveDTO.builder()
                .id(eleve.getId())
                .matricule(eleve.getMatricule())
                .nom(eleve.getNom())
                .prenom(eleve.getPrenom())
                .dateNaissance(eleve.getDateNaissance())
                .lieuNaissance(eleve.getLieuNaissance())
                .sexe(eleve.getSexe())
                .nationalite(eleve.getNationalite())
                .adresse(eleve.getAdresse())
                .wilaya(eleve.getWilaya())
                .moughataa(eleve.getMoughataa())
                .nomPere(eleve.getNomPere())
                .professionPere(eleve.getProfessionPere())
                .telPere(eleve.getTelPere())
                .emailPere(eleve.getEmailPere())
                .nomMere(eleve.getNomMere())
                .professionMere(eleve.getProfessionMere())
                .telMere(eleve.getTelMere())
                .tuteurNom(eleve.getTuteurNom())
                .tuteurTel(eleve.getTuteurTel())
                .tuteurRelation(eleve.getTuteurRelation())
                .ancienEtablissement(eleve.getAncienEtablissement())
                .dateInscription(eleve.getDateInscription())
                .numeroInscription(eleve.getNumeroInscription())
                .groupeSanguin(eleve.getGroupeSanguin())
                .allergies(eleve.getAllergies())
                .maladiesChroniques(eleve.getMaladiesChroniques())
                .contactUrgence(eleve.getContactUrgence())
                .statut(eleve.getStatut())
                .anneeScolaire(eleve.getAnneeScolaire())
                .build();

        if (eleve.getClasse() != null) {
            Classe classe = eleve.getClasse();
            dto.setClasseId(classe.getId());
            dto.setClasse(classe.getNom());
            if (classe.getNiveau() != null) {
                dto.setNiveau(classe.getNiveau().getNom());
                // Le cycle est maintenant accessible via niveau
                if (classe.getNiveau().getCycle() != null) {
                    dto.setCycle(classe.getNiveau().getCycle().getNom());
                }
            }
        }

        return dto;
    }
}
