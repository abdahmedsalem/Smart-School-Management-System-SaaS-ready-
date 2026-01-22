package com.sms.service;

import com.sms.dto.PersonnelCreateDTO;
import com.sms.dto.PersonnelDTO;
import com.sms.entity.Personnel;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.PersonnelRepository;
import com.sms.repository.ClasseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonnelService {

    private final PersonnelRepository personnelRepository;
    private final ClasseRepository classeRepository;

    public List<PersonnelDTO> getAllPersonnel() {
        return personnelRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PersonnelDTO getPersonnelById(Long id) {
        Personnel personnel = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé avec l'id: " + id));
        return toDTO(personnel);
    }

    public PersonnelDTO getPersonnelByMatricule(String matricule) {
        Personnel personnel = personnelRepository.findByMatricule(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé avec le matricule: " + matricule));
        return toDTO(personnel);
    }

    public List<PersonnelDTO> getEnseignants() {
        return personnelRepository.findAllEnseignantsActifs().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PersonnelDTO> getAdministratifs() {
        return personnelRepository.findAllAdminActifs().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PersonnelDTO> getPersonnelByStatut(String statut) {
        return personnelRepository.findByStatut(statut).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PersonnelDTO> getPersonnelByDepartement(String departement) {
        return personnelRepository.findByDepartement(departement).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PersonnelDTO createPersonnel(PersonnelCreateDTO dto) {
        Personnel personnel = new Personnel();
        mapDtoToEntity(dto, personnel);

        // Générer matricule si non fourni
        if (personnel.getMatricule() == null || personnel.getMatricule().isEmpty()) {
            String prefix = "enseignant".equals(dto.getType()) ? "ENS" : "ADM";
            long count = personnelRepository.count() + 1;
            personnel.setMatricule(String.format("%s-%03d", prefix, count));
        }

        return toDTO(personnelRepository.save(personnel));
    }

    @Transactional
    public PersonnelDTO updatePersonnel(Long id, PersonnelCreateDTO dto) {
        Personnel personnel = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé avec l'id: " + id));
        mapDtoToEntity(dto, personnel);
        return toDTO(personnelRepository.save(personnel));
    }

    @Transactional
    public PersonnelDTO updateStatut(Long id, String statut) {
        Personnel personnel = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé avec l'id: " + id));
        personnel.setStatut(statut);
        return toDTO(personnelRepository.save(personnel));
    }

    @Transactional
    public void deletePersonnel(Long id) {
        if (!personnelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Personnel non trouvé avec l'id: " + id);
        }
        personnelRepository.deleteById(id);
    }

    public Map<String, Object> getStatsPersonnel() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnseignants", personnelRepository.countByTypeAndActif("enseignant"));
        stats.put("totalAdmin", personnelRepository.countByTypeAndActif("admin"));
        stats.put("actifs", personnelRepository.countByStatut("actif"));
        stats.put("enConge", personnelRepository.countByStatut("conge"));
        stats.put("inactifs", personnelRepository.countByStatut("inactif"));
        return stats;
    }

    private void mapDtoToEntity(PersonnelCreateDTO dto, Personnel personnel) {
        if (dto.getMatricule() != null) personnel.setMatricule(dto.getMatricule());
        if (dto.getNom() != null) personnel.setNom(dto.getNom());
        if (dto.getPrenom() != null) personnel.setPrenom(dto.getPrenom());
        if (dto.getSexe() != null) personnel.setSexe(dto.getSexe());
        if (dto.getTelephone() != null) personnel.setTelephone(dto.getTelephone());
        if (dto.getEmail() != null) personnel.setEmail(dto.getEmail());
        if (dto.getSpecialite() != null) personnel.setSpecialite(dto.getSpecialite());
        if (dto.getDiplome() != null) personnel.setDiplome(dto.getDiplome());
        if (dto.getDateEmbauche() != null) personnel.setDateEmbauche(dto.getDateEmbauche());
        if (dto.getStatut() != null) personnel.setStatut(dto.getStatut());
        if (dto.getSalaire() != null) personnel.setSalaire(dto.getSalaire());
        if (dto.getFonction() != null) personnel.setFonction(dto.getFonction());
        if (dto.getDepartement() != null) personnel.setDepartement(dto.getDepartement());
        if (dto.getType() != null) personnel.setType(dto.getType());
        if (dto.getAdresse() != null) personnel.setAdresse(dto.getAdresse());
    }

    private PersonnelDTO toDTO(Personnel personnel) {
        PersonnelDTO dto = PersonnelDTO.builder()
                .id(personnel.getId())
                .matricule(personnel.getMatricule())
                .nom(personnel.getNom())
                .prenom(personnel.getPrenom())
                .sexe(personnel.getSexe())
                .telephone(personnel.getTelephone())
                .email(personnel.getEmail())
                .specialite(personnel.getSpecialite())
                .diplome(personnel.getDiplome())
                .dateEmbauche(personnel.getDateEmbauche())
                .statut(personnel.getStatut())
                .salaire(personnel.getSalaire())
                .fonction(personnel.getFonction())
                .departement(personnel.getDepartement())
                .type(personnel.getType())
                .adresse(personnel.getAdresse())
                .build();

        return dto;
    }
}
