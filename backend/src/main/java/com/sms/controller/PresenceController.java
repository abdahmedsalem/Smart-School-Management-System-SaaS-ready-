package com.sms.controller;

import com.sms.dto.PresenceCreateDTO;
import com.sms.dto.PresenceDTO;
import com.sms.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PresenceController {

    private final PresenceService presenceService;

    /**
     * GET /api/presences
     * Récupère toutes les présences
     */
    @GetMapping
    public ResponseEntity<List<PresenceDTO>> getAllPresences() {
        return ResponseEntity.ok(presenceService.getAllPresences());
    }

    /**
     * GET /api/presences/{id}
     * Récupère une présence par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PresenceDTO> getPresenceById(@PathVariable Long id) {
        return ResponseEntity.ok(presenceService.getPresenceById(id));
    }

    /**
     * GET /api/presences/eleve/{eleveId}
     * Récupère les présences d'un élève
     */
    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<PresenceDTO>> getPresencesByEleve(@PathVariable Long eleveId) {
        return ResponseEntity.ok(presenceService.getPresencesByEleve(eleveId));
    }

    /**
     * GET /api/presences/eleve/{eleveId}/periode?debut=2024-01-01&fin=2024-12-31
     * Récupère les présences d'un élève pour une période
     */
    @GetMapping("/eleve/{eleveId}/periode")
    public ResponseEntity<List<PresenceDTO>> getPresencesByEleveAndDateRange(
            @PathVariable Long eleveId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(presenceService.getPresencesByEleveAndDateRange(eleveId, debut, fin));
    }

    /**
     * GET /api/presences/classe/{classeId}/date/{date}
     * Récupère les présences d'une classe pour une date
     */
    @GetMapping("/classe/{classeId}/date/{date}")
    public ResponseEntity<List<PresenceDTO>> getPresencesByClasseAndDate(
            @PathVariable Long classeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(presenceService.getPresencesByClasseAndDate(classeId, date));
    }

    /**
     * GET /api/presences/date/{date}
     * Récupère toutes les présences d'une date
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<List<PresenceDTO>> getPresencesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(presenceService.getPresencesByDate(date));
    }

    /**
     * POST /api/presences
     * Enregistre une présence
     */
    @PostMapping
    public ResponseEntity<PresenceDTO> createPresence(@RequestBody PresenceCreateDTO dto) {
        return new ResponseEntity<>(presenceService.createPresence(dto), HttpStatus.CREATED);
    }

    /**
     * POST /api/presences/classe/{classeId}
     * Enregistre les présences d'une classe pour une date
     */
    @PostMapping("/classe/{classeId}")
    public ResponseEntity<List<PresenceDTO>> enregistrerPresencesClasse(
            @PathVariable Long classeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long seanceId,
            @RequestBody List<PresenceCreateDTO> presences) {
        return ResponseEntity.ok(presenceService.enregistrerPresencesClasse(classeId, date, seanceId, presences));
    }

    /**
     * PUT /api/presences/{id}
     * Met à jour une présence
     */
    @PutMapping("/{id}")
    public ResponseEntity<PresenceDTO> updatePresence(@PathVariable Long id, @RequestBody PresenceCreateDTO dto) {
        return ResponseEntity.ok(presenceService.updatePresence(id, dto));
    }

    /**
     * PATCH /api/presences/{id}/justifier
     * Justifie une absence
     */
    @PatchMapping("/{id}/justifier")
    public ResponseEntity<PresenceDTO> justifierAbsence(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(presenceService.justifierAbsence(id, body.get("motif")));
    }

    /**
     * DELETE /api/presences/{id}
     * Supprime une présence
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePresence(@PathVariable Long id) {
        presenceService.deletePresence(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/presences/stats/eleve/{eleveId}
     * Récupère les statistiques de présence d'un élève
     */
    @GetMapping("/stats/eleve/{eleveId}")
    public ResponseEntity<Map<String, Object>> getStatsPresenceEleve(
            @PathVariable Long eleveId,
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(presenceService.getStatsPresenceEleve(eleveId, anneeScolaire));
    }

    /**
     * GET /api/presences/stats
     * Récupère les statistiques globales de présence
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatsPresencesGlobales(
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(presenceService.getStatsPresencesGlobales(anneeScolaire));
    }
}
