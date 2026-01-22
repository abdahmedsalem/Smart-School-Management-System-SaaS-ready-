package com.sms.controller;

import com.sms.dto.MatiereNiveauDTO;
import com.sms.service.MatiereNiveauService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matiere-niveaux")
@RequiredArgsConstructor
public class MatiereNiveauController {

    private final MatiereNiveauService matiereNiveauService;

    @GetMapping
    public ResponseEntity<List<MatiereNiveauDTO>> getAllMatieresNiveaux() {
        return ResponseEntity.ok(matiereNiveauService.getAllMatieresNiveaux());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatiereNiveauDTO> getMatiereNiveauById(@PathVariable Long id) {
        return ResponseEntity.ok(matiereNiveauService.getMatiereNiveauById(id));
    }

    @GetMapping("/niveau/{niveauId}")
    public ResponseEntity<List<MatiereNiveauDTO>> getMatieresNiveauxByNiveau(@PathVariable Long niveauId) {
        return ResponseEntity.ok(matiereNiveauService.getMatieresNiveauxByNiveau(niveauId));
    }

    @GetMapping("/matiere/{matiereId}")
    public ResponseEntity<List<MatiereNiveauDTO>> getMatieresNiveauxByMatiere(@PathVariable Long matiereId) {
        return ResponseEntity.ok(matiereNiveauService.getMatieresNiveauxByMatiere(matiereId));
    }

    @PostMapping
    public ResponseEntity<MatiereNiveauDTO> createMatiereNiveau(@Valid @RequestBody MatiereNiveauDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matiereNiveauService.createMatiereNiveau(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatiereNiveauDTO> updateMatiereNiveau(
            @PathVariable Long id,
            @Valid @RequestBody MatiereNiveauDTO dto) {
        return ResponseEntity.ok(matiereNiveauService.updateMatiereNiveau(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatiereNiveau(@PathVariable Long id) {
        matiereNiveauService.deleteMatiereNiveau(id);
        return ResponseEntity.noContent().build();
    }
}
