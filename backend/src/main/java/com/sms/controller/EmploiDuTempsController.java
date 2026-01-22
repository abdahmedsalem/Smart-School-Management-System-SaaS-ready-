package com.sms.controller;

import com.sms.dto.SeanceCreateDTO;
import com.sms.dto.SeanceDTO;
import com.sms.service.EmploiDuTempsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emploi-du-temps")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmploiDuTempsController {

    private final EmploiDuTempsService emploiDuTempsService;

    /**
     * GET /api/emploi-du-temps/seances
     * Récupère toutes les séances
     */
    @GetMapping("/seances")
    public ResponseEntity<List<SeanceDTO>> getAllSeances() {
        return ResponseEntity.ok(emploiDuTempsService.getAllSeances());
    }

    /**
     * GET /api/emploi-du-temps/seances/{id}
     * Récupère une séance par son ID
     */
    @GetMapping("/seances/{id}")
    public ResponseEntity<SeanceDTO> getSeanceById(@PathVariable Long id) {
        return ResponseEntity.ok(emploiDuTempsService.getSeanceById(id));
    }

    /**
     * GET /api/emploi-du-temps/classe/{classeId}
     * Récupère l'emploi du temps d'une classe (liste simple)
     */
    @GetMapping("/classe/{classeId}")
    public ResponseEntity<List<SeanceDTO>> getEmploiDuTempsByClasse(@PathVariable Long classeId) {
        return ResponseEntity.ok(emploiDuTempsService.getEmploiDuTempsByClasse(classeId));
    }

    /**
     * GET /api/emploi-du-temps/classe/{classeId}/structure
     * Récupère l'emploi du temps d'une classe structuré par jour
     */
    @GetMapping("/classe/{classeId}/structure")
    public ResponseEntity<Map<String, List<SeanceDTO>>> getEmploiDuTempsStructure(@PathVariable Long classeId) {
        return ResponseEntity.ok(emploiDuTempsService.getEmploiDuTempsStructure(classeId));
    }

    /**
     * GET /api/emploi-du-temps/professeur/{professeurId}
     * Récupère l'emploi du temps d'un professeur
     */
    @GetMapping("/professeur/{professeurId}")
    public ResponseEntity<List<SeanceDTO>> getEmploiDuTempsByProfesseur(@PathVariable Long professeurId) {
        return ResponseEntity.ok(emploiDuTempsService.getEmploiDuTempsByProfesseur(professeurId));
    }

    /**
     * GET /api/emploi-du-temps/jour/{jourSemaine}
     * Récupère les séances d'un jour (1=Lundi, ..., 6=Samedi)
     */
    @GetMapping("/jour/{jourSemaine}")
    public ResponseEntity<List<SeanceDTO>> getSeancesByJour(@PathVariable Integer jourSemaine) {
        return ResponseEntity.ok(emploiDuTempsService.getSeancesByJour(jourSemaine));
    }

    /**
     * GET /api/emploi-du-temps/salle/{salleId}
     * Récupère les séances d'une salle
     */
    @GetMapping("/salle/{salleId}")
    public ResponseEntity<List<SeanceDTO>> getSeancesBySalle(@PathVariable Long salleId) {
        return ResponseEntity.ok(emploiDuTempsService.getSeancesBySalle(salleId));
    }

    /**
     * POST /api/emploi-du-temps/seances
     * Crée une nouvelle séance
     */
    @PostMapping("/seances")
    public ResponseEntity<SeanceDTO> createSeance(@RequestBody SeanceCreateDTO dto) {
        return new ResponseEntity<>(emploiDuTempsService.createSeance(dto), HttpStatus.CREATED);
    }

    /**
     * POST /api/emploi-du-temps/verifier-conflits
     * Vérifie les conflits d'horaire avant création
     */
    @PostMapping("/verifier-conflits")
    public ResponseEntity<List<String>> verifierConflits(@RequestBody SeanceCreateDTO dto) {
        return ResponseEntity.ok(emploiDuTempsService.verifierConflits(dto));
    }

    /**
     * PUT /api/emploi-du-temps/seances/{id}
     * Met à jour une séance
     */
    @PutMapping("/seances/{id}")
    public ResponseEntity<SeanceDTO> updateSeance(@PathVariable Long id, @RequestBody SeanceCreateDTO dto) {
        return ResponseEntity.ok(emploiDuTempsService.updateSeance(id, dto));
    }

    /**
     * DELETE /api/emploi-du-temps/seances/{id}
     * Supprime (désactive) une séance
     */
    @DeleteMapping("/seances/{id}")
    public ResponseEntity<Void> deleteSeance(@PathVariable Long id) {
        emploiDuTempsService.deleteSeance(id);
        return ResponseEntity.noContent().build();
    }
}
