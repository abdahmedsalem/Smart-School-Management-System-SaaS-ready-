package com.sms.controller;

import com.sms.dto.MatiereDTO;
import com.sms.dto.MatiereNiveauDTO;
import com.sms.dto.PeriodeDTO;
import com.sms.service.MatiereService;
import com.sms.service.MatiereNiveauService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academique")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademiqueController {

    private final MatiereService matiereService;
    private final MatiereNiveauService matiereNiveauService;

    // ==================== MATIERES ====================

    /**
     * GET /api/academique/matieres
     * Récupère toutes les matières actives
     */
    @GetMapping("/matieres")
    public ResponseEntity<List<MatiereDTO>> getAllMatieres() {
        return ResponseEntity.ok(matiereService.getAllMatieres());
    }

    /**
     * GET /api/academique/matieres/{id}
     * Récupère une matière par son ID
     */
    @GetMapping("/matieres/{id}")
    public ResponseEntity<MatiereDTO> getMatiereById(@PathVariable Long id) {
        return ResponseEntity.ok(matiereService.getMatiereById(id));
    }

    /**
     * GET /api/academique/matieres/cycle/{cycleId}
     * Récupère les matières d'un cycle - DÉPRÉCIÉ: utiliser /matiere-niveaux
     */
    @GetMapping("/matieres/cycle/{cycleId}")
    public ResponseEntity<List<MatiereDTO>> getMatieresByCycle(@PathVariable Long cycleId) {
        // Retourne toutes les matières (le filtrage se fait maintenant via MatiereNiveau)
        return ResponseEntity.ok(matiereService.getAllMatieres());
    }

    /**
     * GET /api/academique/matieres/niveau/{niveauId}
     * Récupère les matières d'un niveau via MatiereNiveau
     */
    @GetMapping("/matieres/niveau/{niveauId}")
    public ResponseEntity<List<MatiereNiveauDTO>> getMatieresByNiveau(@PathVariable Long niveauId) {
        return ResponseEntity.ok(matiereNiveauService.getMatieresNiveauxByNiveau(niveauId));
    }

    /**
     * POST /api/academique/matieres
     * Crée une nouvelle matière
     */
    @PostMapping("/matieres")
    public ResponseEntity<MatiereDTO> createMatiere(@RequestBody MatiereDTO dto) {
        return new ResponseEntity<>(matiereService.createMatiere(dto), HttpStatus.CREATED);
    }

    /**
     * PUT /api/academique/matieres/{id}
     * Met à jour une matière
     */
    @PutMapping("/matieres/{id}")
    public ResponseEntity<MatiereDTO> updateMatiere(@PathVariable Long id, @RequestBody MatiereDTO dto) {
        return ResponseEntity.ok(matiereService.updateMatiere(id, dto));
    }

    /**
     * DELETE /api/academique/matieres/{id}
     * Supprime (désactive) une matière
     */
    @DeleteMapping("/matieres/{id}")
    public ResponseEntity<Void> deleteMatiere(@PathVariable Long id) {
        matiereService.deleteMatiere(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== PERIODES ====================

    /**
     * GET /api/academique/periodes
     * Récupère toutes les périodes actives
     */
    @GetMapping("/periodes")
    public ResponseEntity<List<PeriodeDTO>> getAllPeriodes() {
        return ResponseEntity.ok(matiereService.getAllPeriodes());
    }

    /**
     * GET /api/academique/periodes/{id}
     * Récupère une période par son ID
     */
    @GetMapping("/periodes/{id}")
    public ResponseEntity<PeriodeDTO> getPeriodeById(@PathVariable Long id) {
        return ResponseEntity.ok(matiereService.getPeriodeById(id));
    }

    /**
     * GET /api/academique/periodes/annee/{anneeScolaire}
     * Récupère les périodes d'une année scolaire
     */
    @GetMapping("/periodes/annee/{anneeScolaire}")
    public ResponseEntity<List<PeriodeDTO>> getPeriodesByAnneeScolaire(@PathVariable String anneeScolaire) {
        return ResponseEntity.ok(matiereService.getPeriodesByAnneeScolaire(anneeScolaire));
    }

    /**
     * POST /api/academique/periodes
     * Crée une nouvelle période
     */
    @PostMapping("/periodes")
    public ResponseEntity<PeriodeDTO> createPeriode(@RequestBody PeriodeDTO dto) {
        return new ResponseEntity<>(matiereService.createPeriode(dto), HttpStatus.CREATED);
    }

    /**
     * PUT /api/academique/periodes/{id}
     * Met à jour une période
     */
    @PutMapping("/periodes/{id}")
    public ResponseEntity<PeriodeDTO> updatePeriode(@PathVariable Long id, @RequestBody PeriodeDTO dto) {
        return ResponseEntity.ok(matiereService.updatePeriode(id, dto));
    }
}
