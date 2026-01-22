package com.sms.controller;

import com.sms.dto.*;
import com.sms.service.EleveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eleves")
@RequiredArgsConstructor
public class EleveController {

    private final EleveService eleveService;

    @GetMapping
    public ResponseEntity<List<EleveDTO>> getAllEleves(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long classeId,
            @RequestParam(required = false) String wilaya,
            @RequestParam(required = false) String statut) {
        return ResponseEntity.ok(eleveService.getAllEleves(search, classeId, wilaya, statut));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EleveDTO> getEleveById(@PathVariable Long id) {
        return ResponseEntity.ok(eleveService.getEleveById(id));
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<EleveDTO> getEleveByMatricule(@PathVariable String matricule) {
        return ResponseEntity.ok(eleveService.getEleveByMatricule(matricule));
    }

    @PostMapping
    public ResponseEntity<EleveDTO> createEleve(@Valid @RequestBody EleveCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eleveService.createEleve(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EleveDTO> updateEleve(@PathVariable Long id, @Valid @RequestBody EleveCreateDTO dto) {
        return ResponseEntity.ok(eleveService.updateEleve(id, dto));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<EleveDTO> changeStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statut = body.get("statut");
        return ResponseEntity.ok(eleveService.changeStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEleve(@PathVariable Long id) {
        eleveService.deleteEleve(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<EleveStatsDTO> getStats() {
        return ResponseEntity.ok(eleveService.getStats());
    }

    @GetMapping("/wilayas")
    public ResponseEntity<List<String>> getWilayas() {
        return ResponseEntity.ok(eleveService.getWilayas());
    }
}
