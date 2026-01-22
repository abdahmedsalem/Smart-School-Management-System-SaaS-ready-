package com.sms.controller;

import com.sms.dto.PaiementCreateDTO;
import com.sms.dto.PaiementDTO;
import com.sms.dto.TypeFraisDTO;
import com.sms.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    @GetMapping
    public ResponseEntity<List<PaiementDTO>> getAllPaiements() {
        return ResponseEntity.ok(paiementService.getAllPaiements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaiementDTO> getPaiementById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.getPaiementById(id));
    }

    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<PaiementDTO>> getPaiementsByEleve(@PathVariable Long eleveId) {
        return ResponseEntity.ok(paiementService.getPaiementsByEleve(eleveId));
    }

    @PostMapping
    public ResponseEntity<PaiementDTO> createPaiement(@RequestBody PaiementCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paiementService.createPaiement(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaiementDTO> updatePaiement(@PathVariable Long id, @RequestBody PaiementCreateDTO dto) {
        return ResponseEntity.ok(paiementService.updatePaiement(id, dto));
    }

    @PatchMapping("/{id}/payer")
    public ResponseEntity<PaiementDTO> enregistrerPaiement(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        BigDecimal montant = new BigDecimal(body.get("montant").toString());
        String mode = (String) body.get("modePaiement");
        String reference = (String) body.get("reference");
        return ResponseEntity.ok(paiementService.enregistrerPaiement(id, montant, mode, reference));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaiement(@PathVariable Long id) {
        paiementService.deletePaiement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/types-frais")
    public ResponseEntity<List<TypeFraisDTO>> getTypesFrais() {
        return ResponseEntity.ok(paiementService.getAllTypesFrais());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(paiementService.getStatsPaiements(anneeScolaire));
    }

    @GetMapping("/solde/{eleveId}")
    public ResponseEntity<Map<String, BigDecimal>> getSoldeEleve(
            @PathVariable Long eleveId,
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(paiementService.getSoldeEleve(eleveId, anneeScolaire));
    }
}
