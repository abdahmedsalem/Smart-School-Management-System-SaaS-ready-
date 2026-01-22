package com.sms.controller;

import com.sms.dto.BulletinDTO;
import com.sms.dto.NoteBulkCreateDTO;
import com.sms.dto.NoteCreateDTO;
import com.sms.dto.NoteDTO;
import com.sms.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NoteController {

    private final NoteService noteService;

    /**
     * GET /api/notes
     * Récupère toutes les notes
     */
    @GetMapping
    public ResponseEntity<List<NoteDTO>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    /**
     * GET /api/notes/{id}
     * Récupère une note par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NoteDTO> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    /**
     * GET /api/notes/eleve/{eleveId}
     * Récupère toutes les notes d'un élève
     */
    @GetMapping("/eleve/{eleveId}")
    public ResponseEntity<List<NoteDTO>> getNotesByEleve(@PathVariable Long eleveId) {
        return ResponseEntity.ok(noteService.getNotesByEleve(eleveId));
    }

    /**
     * GET /api/notes/eleve/{eleveId}/periode/{periodeId}
     * Récupère les notes d'un élève pour une période
     */
    @GetMapping("/eleve/{eleveId}/periode/{periodeId}")
    public ResponseEntity<List<NoteDTO>> getNotesByEleveAndPeriode(
            @PathVariable Long eleveId, @PathVariable Long periodeId) {
        return ResponseEntity.ok(noteService.getNotesByEleveAndPeriode(eleveId, periodeId));
    }

    /**
     * GET /api/notes/matiere/{matiereId}
     * Récupère les notes par matière
     */
    @GetMapping("/matiere/{matiereId}")
    public ResponseEntity<List<NoteDTO>> getNotesByMatiere(@PathVariable Long matiereId) {
        return ResponseEntity.ok(noteService.getNotesByMatiere(matiereId));
    }

    /**
     * POST /api/notes
     * Crée une nouvelle note
     */
    @PostMapping
    public ResponseEntity<NoteDTO> createNote(@RequestBody NoteCreateDTO dto) {
        return new ResponseEntity<>(noteService.createNote(dto), HttpStatus.CREATED);
    }

    /**
     * POST /api/notes/bulk
     * Crée ou met à jour plusieurs notes en une seule requête
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<NoteDTO>> createNotesBulk(@RequestBody NoteBulkCreateDTO dto) {
        return new ResponseEntity<>(noteService.createNotesBulk(dto.getNotes(), dto.isUpsert()), HttpStatus.CREATED);
    }

    /**
     * PUT /api/notes/{id}
     * Met à jour une note
     */
    @PutMapping("/{id}")
    public ResponseEntity<NoteDTO> updateNote(@PathVariable Long id, @RequestBody NoteCreateDTO dto) {
        return ResponseEntity.ok(noteService.updateNote(id, dto));
    }

    /**
     * DELETE /api/notes/{id}
     * Supprime une note
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/notes/bulletin/eleve/{eleveId}/periode/{periodeId}
     * Récupère le bulletin d'un élève pour une période
     */
    @GetMapping("/bulletin/eleve/{eleveId}/periode/{periodeId}")
    public ResponseEntity<BulletinDTO> getBulletinEleve(
            @PathVariable Long eleveId, @PathVariable Long periodeId) {
        return ResponseEntity.ok(noteService.getBulletinEleve(eleveId, periodeId));
    }

    /**
     * POST /api/notes/bulletin/generer
     * Génère un bulletin pour un élève
     */
    @PostMapping("/bulletin/generer")
    public ResponseEntity<BulletinDTO> genererBulletin(@RequestBody Map<String, Object> body) {
        Long eleveId = Long.valueOf(body.get("eleveId").toString());
        Long periodeId = Long.valueOf(body.get("periodeId").toString());
        String appreciation = body.get("appreciation") != null ? body.get("appreciation").toString() : null;
        String decision = body.get("decision") != null ? body.get("decision").toString() : null;
        return ResponseEntity.ok(noteService.genererBulletin(eleveId, periodeId, appreciation, decision));
    }

    /**
     * GET /api/notes/bulletins/classe/{classeId}/periode/{periodeId}
     * Récupère tous les bulletins d'une classe pour une période
     */
    @GetMapping("/bulletins/classe/{classeId}/periode/{periodeId}")
    public ResponseEntity<List<BulletinDTO>> getBulletinsClasse(
            @PathVariable Long classeId, @PathVariable Long periodeId) {
        return ResponseEntity.ok(noteService.getBulletinsClasse(classeId, periodeId));
    }

    /**
     * GET /api/notes/stats
     * Récupère les statistiques académiques
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatsAcademiques(
            @RequestParam(defaultValue = "2024-2025") String anneeScolaire) {
        return ResponseEntity.ok(noteService.getStatsAcademiques(anneeScolaire));
    }
}
