package com.sms.controller;

import com.sms.dto.MatiereDTO;
import com.sms.dto.MatiereNiveauDTO;
import com.sms.service.MatiereService;
import com.sms.service.MatiereNiveauService;
import com.sms.service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matieres")
@RequiredArgsConstructor
public class MatiereController {

    private final StructureService structureService;
    private final MatiereService matiereService;
    private final MatiereNiveauService matiereNiveauService;

    @GetMapping
    public ResponseEntity<List<String>> getMatieresByCycle(
            @RequestParam String cycle,
            @RequestParam(required = false) String specialite) {
        return ResponseEntity.ok(structureService.getMatieresByCycle(cycle, specialite));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MatiereDTO>> getAllMatieres() {
        return ResponseEntity.ok(matiereService.getAllMatieres());
    }

    @GetMapping("/filtered")
    public ResponseEntity<List<MatiereNiveauDTO>> getFilteredMatieres(
            @RequestParam(required = false) Long cycleId,
            @RequestParam(required = false) Long niveauId) {
        if (niveauId != null) {
            return ResponseEntity.ok(matiereNiveauService.getMatieresNiveauxByNiveau(niveauId));
        }
        if (cycleId != null) {
            return ResponseEntity.ok(matiereNiveauService.getMatieresNiveauxByCycle(cycleId));
        }
        return ResponseEntity.ok(matiereNiveauService.getAllMatieresNiveaux());
    }
}
