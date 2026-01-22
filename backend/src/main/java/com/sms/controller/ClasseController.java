package com.sms.controller;

import com.sms.dto.ClasseCreateDTO;
import com.sms.dto.ClasseDTO;
import com.sms.dto.MatiereNiveauDTO;
import com.sms.service.StructureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClasseController {

    private final StructureService structureService;

    @GetMapping
    public ResponseEntity<List<ClasseDTO>> getAllClasses(
            @RequestParam(required = false) Long cycleId,
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(structureService.getAllClasses(cycleId, statut, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClasseDTO> getClasseById(@PathVariable Long id) {
        return ResponseEntity.ok(structureService.getClasseById(id));
    }

    @PostMapping
    public ResponseEntity<ClasseDTO> createClasse(@Valid @RequestBody ClasseCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(structureService.createClasse(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClasseDTO> updateClasse(
            @PathVariable Long id,
            @Valid @RequestBody ClasseCreateDTO dto) {
        return ResponseEntity.ok(structureService.updateClasse(id, dto));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ClasseDTO> archiveClasse(@PathVariable Long id) {
        return ResponseEntity.ok(structureService.archiveClasse(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClasse(@PathVariable Long id) {
        structureService.deleteClasse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/matieres")
    public ResponseEntity<List<MatiereNiveauDTO>> getMatieresByClasse(@PathVariable Long id) {
        return ResponseEntity.ok(structureService.getMatieresByClasse(id));
    }
}
