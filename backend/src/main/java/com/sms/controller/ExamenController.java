package com.sms.controller;

import com.sms.dto.ExamenCreateDTO;
import com.sms.dto.ExamenDTO;
import com.sms.dto.ResultatExamenDTO;
import com.sms.service.ExamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/examens")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExamenController {

    private final ExamenService examenService;

    /**
     * GET /api/examens
     * Récupère tous les examens
     */
    @GetMapping
    public ResponseEntity<List<ExamenDTO>> getAllExamens() {
        return ResponseEntity.ok(examenService.getAllExamens());
    }

    /**
     * GET /api/examens/{id}
     * Récupère un examen par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExamenDTO> getExamenById(@PathVariable Long id) {
        return ResponseEntity.ok(examenService.getExamenById(id));
    }

    /**
     * GET /api/examens/classe/{classeId}
     * Récupère les examens d'une classe
     */
    @GetMapping("/classe/{classeId}")
    public ResponseEntity<List<ExamenDTO>> getExamensByClasse(@PathVariable Long classeId) {
        return ResponseEntity.ok(examenService.getExamensByClasse(classeId));
    }

    /**
     * GET /api/examens/matiere/{matiereId}
     * Récupère les examens d'une matière
     */
    @GetMapping("/matiere/{matiereId}")
    public ResponseEntity<List<ExamenDTO>> getExamensByMatiere(@PathVariable Long matiereId) {
        return ResponseEntity.ok(examenService.getExamensByMatiere(matiereId));
    }

    /**
     * GET /api/examens/statut/{statut}
     * Récupère les examens par statut (planifie, en_cours, termine, annule)
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<ExamenDTO>> getExamensByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(examenService.getExamensByStatut(statut));
    }

    /**
     * GET /api/examens/periode?debut=2024-01-01&fin=2024-12-31
     * Récupère les examens dans une plage de dates
     */
    @GetMapping("/periode")
    public ResponseEntity<List<ExamenDTO>> getExamensByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(examenService.getExamensByDateRange(debut, fin));
    }

    /**
     * POST /api/examens
     * Crée un nouvel examen
     */
    @PostMapping
    public ResponseEntity<ExamenDTO> createExamen(@RequestBody ExamenCreateDTO dto) {
        return new ResponseEntity<>(examenService.createExamen(dto), HttpStatus.CREATED);
    }

    /**
     * PUT /api/examens/{id}
     * Met à jour un examen
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExamenDTO> updateExamen(@PathVariable Long id, @RequestBody ExamenCreateDTO dto) {
        return ResponseEntity.ok(examenService.updateExamen(id, dto));
    }

    /**
     * PATCH /api/examens/{id}/statut
     * Met à jour le statut d'un examen
     */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<ExamenDTO> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(examenService.updateStatut(id, body.get("statut")));
    }

    /**
     * DELETE /api/examens/{id}
     * Supprime un examen
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamen(@PathVariable Long id) {
        examenService.deleteExamen(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/examens/{examenId}/resultats
     * Récupère les résultats d'un examen
     */
    @GetMapping("/{examenId}/resultats")
    public ResponseEntity<List<ResultatExamenDTO>> getResultatsByExamen(@PathVariable Long examenId) {
        return ResponseEntity.ok(examenService.getResultatsByExamen(examenId));
    }

    /**
     * POST /api/examens/{examenId}/resultats
     * Enregistre un résultat d'examen pour un élève
     */
    @PostMapping("/{examenId}/resultats")
    public ResponseEntity<ResultatExamenDTO> enregistrerResultat(
            @PathVariable Long examenId,
            @RequestBody Map<String, Object> body) {
        Long eleveId = Long.valueOf(body.get("eleveId").toString());
        BigDecimal note = new BigDecimal(body.get("note").toString());
        String appreciation = body.get("appreciation") != null ? body.get("appreciation").toString() : null;
        return ResponseEntity.ok(examenService.enregistrerResultat(examenId, eleveId, note, appreciation));
    }

    /**
     * POST /api/examens/{examenId}/calculer-rangs
     * Calcule les rangs pour un examen
     */
    @PostMapping("/{examenId}/calculer-rangs")
    public ResponseEntity<Void> calculerRangs(@PathVariable Long examenId) {
        examenService.calculerRangs(examenId);
        return ResponseEntity.ok().build();
    }

    /**
     * GET /api/examens/stats
     * Récupère les statistiques des examens
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatsExamens(
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(examenService.getStatsExamens(anneeScolaire));
    }
}
