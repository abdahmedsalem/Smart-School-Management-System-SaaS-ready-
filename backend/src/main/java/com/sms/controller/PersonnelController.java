package com.sms.controller;

import com.sms.dto.PersonnelCreateDTO;
import com.sms.dto.PersonnelDTO;
import com.sms.service.PersonnelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personnel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PersonnelController {

    private final PersonnelService personnelService;

    /**
     * GET /api/personnel
     * Récupère tout le personnel
     */
    @GetMapping
    public ResponseEntity<List<PersonnelDTO>> getAllPersonnel() {
        return ResponseEntity.ok(personnelService.getAllPersonnel());
    }

    /**
     * GET /api/personnel/{id}
     * Récupère un membre du personnel par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PersonnelDTO> getPersonnelById(@PathVariable Long id) {
        return ResponseEntity.ok(personnelService.getPersonnelById(id));
    }

    /**
     * GET /api/personnel/matricule/{matricule}
     * Récupère un membre du personnel par son matricule
     */
    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<PersonnelDTO> getPersonnelByMatricule(@PathVariable String matricule) {
        return ResponseEntity.ok(personnelService.getPersonnelByMatricule(matricule));
    }

    /**
     * GET /api/personnel/enseignants
     * Récupère tous les enseignants actifs
     */
    @GetMapping("/enseignants")
    public ResponseEntity<List<PersonnelDTO>> getEnseignants() {
        return ResponseEntity.ok(personnelService.getEnseignants());
    }

    /**
     * GET /api/personnel/administratifs
     * Récupère tout le personnel administratif actif
     */
    @GetMapping("/administratifs")
    public ResponseEntity<List<PersonnelDTO>> getAdministratifs() {
        return ResponseEntity.ok(personnelService.getAdministratifs());
    }

    /**
     * GET /api/personnel/statut/{statut}
     * Récupère le personnel par statut (actif, conge, inactif)
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PersonnelDTO>> getPersonnelByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(personnelService.getPersonnelByStatut(statut));
    }

    /**
     * GET /api/personnel/departement/{departement}
     * Récupère le personnel par département
     */
    @GetMapping("/departement/{departement}")
    public ResponseEntity<List<PersonnelDTO>> getPersonnelByDepartement(@PathVariable String departement) {
        return ResponseEntity.ok(personnelService.getPersonnelByDepartement(departement));
    }

    /**
     * POST /api/personnel
     * Crée un nouveau membre du personnel
     */
    @PostMapping
    public ResponseEntity<PersonnelDTO> createPersonnel(@RequestBody PersonnelCreateDTO dto) {
        return new ResponseEntity<>(personnelService.createPersonnel(dto), HttpStatus.CREATED);
    }

    /**
     * PUT /api/personnel/{id}
     * Met à jour un membre du personnel
     */
    @PutMapping("/{id}")
    public ResponseEntity<PersonnelDTO> updatePersonnel(@PathVariable Long id, @RequestBody PersonnelCreateDTO dto) {
        return ResponseEntity.ok(personnelService.updatePersonnel(id, dto));
    }

    /**
     * PATCH /api/personnel/{id}/statut
     * Met à jour le statut d'un membre du personnel
     */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<PersonnelDTO> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(personnelService.updateStatut(id, body.get("statut")));
    }

    /**
     * DELETE /api/personnel/{id}
     * Supprime un membre du personnel
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonnel(@PathVariable Long id) {
        personnelService.deletePersonnel(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/personnel/stats
     * Récupère les statistiques du personnel
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatsPersonnel() {
        return ResponseEntity.ok(personnelService.getStatsPersonnel());
    }
}
