package com.sms.service;

import com.sms.dto.PaiementCreateDTO;
import com.sms.dto.PaiementDTO;
import com.sms.dto.TypeFraisDTO;
import com.sms.entity.Eleve;
import com.sms.entity.Paiement;
import com.sms.entity.TypeFrais;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.EleveRepository;
import com.sms.repository.PaiementRepository;
import com.sms.repository.TypeFraisRepository;
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
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final EleveRepository eleveRepository;
    private final TypeFraisRepository typeFraisRepository;

    public List<PaiementDTO> getAllPaiements() {
        return paiementRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PaiementDTO> getPaiementsByEleve(Long eleveId) {
        return paiementRepository.findByEleveId(eleveId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PaiementDTO getPaiementById(Long id) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'id: " + id));
        return toDTO(paiement);
    }

    @Transactional
    public PaiementDTO createPaiement(PaiementCreateDTO dto) {
        Eleve eleve = eleveRepository.findById(dto.getEleveId())
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé"));

        Paiement paiement = new Paiement();
        paiement.setEleve(eleve);
        paiement.setMontant(dto.getMontant());
        paiement.setMontantPaye(dto.getMontantPaye() != null ? dto.getMontantPaye() : BigDecimal.ZERO);
        paiement.setModePaiement(dto.getModePaiement());
        paiement.setReferencePaiement(dto.getReferencePaiement());
        paiement.setDatePaiement(dto.getDatePaiement() != null ? dto.getDatePaiement() : LocalDate.now());
        paiement.setDateEcheance(dto.getDateEcheance());
        paiement.setMoisConcerne(dto.getMoisConcerne());
        paiement.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");
        paiement.setCommentaire(dto.getCommentaire());

        if (dto.getTypeFraisId() != null) {
            TypeFrais typeFrais = typeFraisRepository.findById(dto.getTypeFraisId())
                    .orElseThrow(() -> new ResourceNotFoundException("Type de frais non trouvé"));
            paiement.setTypeFrais(typeFrais);
        }

        return toDTO(paiementRepository.save(paiement));
    }

    @Transactional
    public PaiementDTO updatePaiement(Long id, PaiementCreateDTO dto) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'id: " + id));

        if (dto.getMontant() != null) paiement.setMontant(dto.getMontant());
        if (dto.getMontantPaye() != null) paiement.setMontantPaye(dto.getMontantPaye());
        if (dto.getModePaiement() != null) paiement.setModePaiement(dto.getModePaiement());
        if (dto.getReferencePaiement() != null) paiement.setReferencePaiement(dto.getReferencePaiement());
        if (dto.getDatePaiement() != null) paiement.setDatePaiement(dto.getDatePaiement());
        if (dto.getMoisConcerne() != null) paiement.setMoisConcerne(dto.getMoisConcerne());
        if (dto.getCommentaire() != null) paiement.setCommentaire(dto.getCommentaire());

        return toDTO(paiementRepository.save(paiement));
    }

    @Transactional
    public PaiementDTO enregistrerPaiement(Long id, BigDecimal montantPaye, String modePaiement, String reference) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'id: " + id));

        BigDecimal nouveauMontantPaye = paiement.getMontantPaye().add(montantPaye);
        paiement.setMontantPaye(nouveauMontantPaye);
        paiement.setModePaiement(modePaiement);
        paiement.setReferencePaiement(reference);
        paiement.setDatePaiement(LocalDate.now());

        return toDTO(paiementRepository.save(paiement));
    }

    @Transactional
    public void deletePaiement(Long id) {
        if (!paiementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paiement non trouvé avec l'id: " + id);
        }
        paiementRepository.deleteById(id);
    }

    // Types de frais
    public List<TypeFraisDTO> getAllTypesFrais() {
        return typeFraisRepository.findAll().stream()
                .map(this::toTypeFraisDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStatsPaiements(String anneeScolaire) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPaye", paiementRepository.countPaye());
        stats.put("totalEnAttente", paiementRepository.countEnAttente());
        stats.put("totalPartiel", paiementRepository.countPartiel());
        stats.put("totalEncaisse", paiementRepository.getTotalEncaisse(anneeScolaire));
        return stats;
    }

    public Map<String, BigDecimal> getSoldeEleve(Long eleveId, String anneeScolaire) {
        Map<String, BigDecimal> solde = new HashMap<>();
        BigDecimal totalMontant = paiementRepository.getTotalMontantByEleve(eleveId, anneeScolaire);
        BigDecimal totalPaye = paiementRepository.getTotalPayeByEleve(eleveId, anneeScolaire);
        BigDecimal totalReste = paiementRepository.getTotalResteByEleve(eleveId, anneeScolaire);

        solde.put("totalDu", totalMontant != null ? totalMontant : BigDecimal.ZERO);
        solde.put("totalPaye", totalPaye != null ? totalPaye : BigDecimal.ZERO);
        solde.put("resteAPayer", totalReste != null ? totalReste : BigDecimal.ZERO);

        return solde;
    }

    private PaiementDTO toDTO(Paiement paiement) {
        PaiementDTO dto = PaiementDTO.builder()
                .id(paiement.getId())
                .montant(paiement.getMontant())
                .montantPaye(paiement.getMontantPaye())
                .resteAPayer(paiement.getResteAPayer())
                .modePaiement(paiement.getModePaiement())
                .referencePaiement(paiement.getReferencePaiement())
                .datePaiement(paiement.getDatePaiement())
                .dateEcheance(paiement.getDateEcheance())
                .statut(paiement.getStatut())
                .moisConcerne(paiement.getMoisConcerne())
                .anneeScolaire(paiement.getAnneeScolaire())
                .commentaire(paiement.getCommentaire())
                .build();

        if (paiement.getEleve() != null) {
            Eleve eleve = paiement.getEleve();
            dto.setEleveId(eleve.getId());
            dto.setEleveNom(eleve.getNom());
            dto.setElevePrenom(eleve.getPrenom());
            dto.setEleveMatricule(eleve.getMatricule());
            if (eleve.getClasse() != null) {
                dto.setEleveClasse(eleve.getClasse().getNom());
            }
        }

        if (paiement.getTypeFrais() != null) {
            dto.setTypeFraisId(paiement.getTypeFrais().getId());
            dto.setTypeFraisCode(paiement.getTypeFrais().getCode());
        }

        return dto;
    }

    private TypeFraisDTO toTypeFraisDTO(TypeFrais typeFrais) {
        return TypeFraisDTO.builder()
                .id(typeFrais.getId())
                .code(typeFrais.getCode())
                .build();
    }
}
